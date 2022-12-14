"use strict";
const axios = require('axios');
const AWS = require('aws-sdk');
const mysql = require('mysql');
const crypto = require('crypto-js');

const connection = mysql.createConnection({
  host    : process.env.AURORA_HOST,
  user    : process.env.AURORA_USER,
  password: process.env.AURORA_PW,
  database: process.env.AURORA_DB
})

const s3 = new AWS.S3();
const db = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

const table = "NJS-ExportInventory";

/* - HELPER FUNCTIONS - */

const encrypt = (string) => {
  var encrypted = crypto.AES.encrypt(string, process.env.CRYPTO_SECRET).toString();
  return crypto.enc.Base64.parse(encrypted).toString(crypto.enc.Hex);
}

const decrypt = (string) => {
  if (string === null) {
    return;
  }
  var decoded = crypto.enc.Hex.parse(string).toString(crypto.enc.Base64);
  return crypto.AES.decrypt(decoded, process.env.CRYPTO_SECRET).toString(crypto.enc.Utf8);
}

const hashCode = (string) => {
  let hash = 0;
  for (let i = 0, len = string.length; i < len; i++) {
    let chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash + Date.now();
}

const getComponentTypeCount = async (componentName) => {
  return axios
    .get(`https://www.njs-export.com/collections/${componentName}.json`)
    .then(res => res.data.collection.products_count);
}

const getAllComponentsOfType = async (componentName) => {
  var components = [];
  const pages = await Math.ceil(await getComponentTypeCount(componentName) / 30);
  for(let i = 1; i <= pages; i++) {
    await axios
      .get(`https://www.njs-export.com/collections/${componentName}/products.json?page=${i}`)
      .then(res => res.data.products.forEach((component) => components.push(component)))
  }
  return components;
}

const getFormattedComponents = async (componentName) => {
  const components = await getAllComponentsOfType(componentName);
  const componentData = []

  await components.forEach((component) => {
    componentData.push({
      PutRequest: {
        Item: {
          "ID": component.id,
          "Type": component.product_type,
          "Title": component.title,
          "Handle": component.handle,
          "CreatedDate": new Date(component.created_at.replace(/-/g, '\/').replace(/T.+/, '')).toDateString(),
          "Image": component.images[0] ? component.images[0].src : 'https://cdn.shopify.com/shopifycloud/shopify/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_1024x1024.gif',
          "Available": component.variants[0].available,
          "Price": component.variants[0].price
        }
      }
    })
  })

  return componentData;
}

const uploadComponentType = async (componentName) => {
  console.log('STARTING: ', componentName);
  const formattedComponents = await getFormattedComponents(componentName);
  var promises = [];

  for (let i = 1; i <= (Math.ceil(Math.max(await formattedComponents.length) / 20) * 20); i++) {
    if (i % 20 === 0) {
      var params = {
        RequestItems: {
          'NJS-ExportInventory': await formattedComponents.slice(i-20, i)
        }
      }

      db.batchWrite(params, function(err, data) {
        if (err) console.log(err);
        else {
          console.log(data);
          promises.push(data)
        };
      })
    }
  }
  await promises;
}

const getComponentsByDate = async (date) => {
  var params = {
    TableName: 'NJS-ExportInventory',
    IndexName: 'createdDateIndex',
    KeyConditionExpression: 'CreatedDate = :cd',
    ExpressionAttributeValues: {
      ':cd': date
    }
  }

  return await db.query(params).promise()
}

const getLatestListingDate = async () => {
  return await axios
    .get('https://njs-export.com/products.json')
    .then((res) => res.data.products[0].variants[0].created_at)
}

const jsonResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(
      {
        body: body
      }
    ),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true, 
    }
  }
}

const sendEmail = async (email, body, subject) => {
  var emailParams = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Text: { Data: body
        },
      },
      Subject: { Data: subject},
    },
    Source: "dev-test-user@njs.bike",
  };

  return ses.sendEmail(emailParams).promise()
}

const emailHash = async (email) => {
  var hash = hashCode(email);
  var dbParams = {
    TableName: 'UserHashTable',
    Item: {
      "UserHash": hash,
      "ttl": Math.round(Date.now() / 1000) + 90
    }
  }

  await db.put(dbParams).promise()
  return hash;
}

const deleteFromDB = async (tableName, key) => {
  if (key.UserHash !== 1122334455) {
    await db.delete({
      TableName: tableName,
      Key: key
    }).promise()
  }
}

const queryDB = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, values,async (err, res) => {
      if (err) {
        if (err.code !== 'ER_DUP_ENTRY') {
          console.log(err);
          reject(err);
        }
        if (err.code === 'ER_DUP_ENTRY') console.log('Just a dupe entry! Handled by DB engine :)')
      }
      resolve(res);
    })
  })
}

const escape = (input) => {
  return connection.escape(input)
}

const filter = (type, string) => {
  if (string === null) {
    return;
  }
  if (type === 'keywords') {
    return string.split(',').filter(keyword => keyword.match(/^[a-z0-9.]+$/i))
  }
}

const getSubscriptionEmails = async (keyword) => {
  return await queryDB(`SELECT email FROM emails
                        LEFT JOIN subscriptions
                        ON subscriptions.email_id_fk = emails.email_id
                        RIGHT JOIN keywords
                        ON subscriptions.keyword_id_fk = keywords.keyword_id
                        WHERE keywords.keyword = ?;`, [keyword]);
}

/* - HANDLER FUNCTIONS - */

module.exports.unsubscribe = async (event) => {
  const email = decrypt(event['queryStringParameters']['email']);
  const keywords = filter('keywords', event['queryStringParameters']['keywords'])

  console.log(email)
  console.log(keywords)

  for (let keyword of keywords) {
    let res = await queryDB(`
      DELETE subscriptions
      FROM subscriptions
      INNER JOIN emails
      ON emails.email_id = subscriptions.email_id_fk
      INNER JOIN keywords
      ON keywords.keyword_id = subscriptions.keyword_id_fk
      WHERE emails.email = ?
      AND keywords.keyword = ?;`, [email, keyword]);
    console.log(res);
  }

  return jsonResponse(200, 'Success');
}

module.exports.subscribe = async (event) => {
  const keywords = filter('keywords', event['queryStringParameters']['keywords'])
  const email = decrypt(event['queryStringParameters']['email']);
  const hash = event['queryStringParameters']['hash'];
  const forbiddenParams = [null, 'null', '', ' ']
  
  if (forbiddenParams.includes(email)) {
    return jsonResponse(200, "Error - Invalid parameters. Please fill out the subscription form again")
  }

  var response = 'Success';

  const params = {
    TableName: 'UserHashTable',
    IndexName: 'userHashIndex',
    KeyConditionExpression: 'UserHash = :uh',
    FilterExpression: '#timetolive >= :currentEpoch',
    ExpressionAttributeValues: {
      ':uh': parseInt(hash),
      ':currentEpoch': Date.now() / 1000
    },
    ExpressionAttributeNames: {
      '#timetolive': 'ttl'
    }
  }

  const emailHash = await db.query(params).promise();

  console.log(event['queryStringParameters']['email'])
  console.log(email);
  console.log(keywords);


  if (emailHash.Count) {
    await queryDB(`INSERT INTO emails (email) VALUES (?)`, [email]);
    for (let keyword of keywords) {
      console.log(keyword)
      await queryDB(`INSERT INTO keywords (keyword) VALUES (?)`, [keyword]);
      await queryDB(`INSERT INTO subscriptions (keyword_id_fk, email_id_fk) VALUES (
        (SELECT keyword_id FROM keywords WHERE keyword = ?),
        (SELECT email_id FROM emails WHERE email = ?));`, [keyword, email]);
    }
    await deleteFromDB('UserHashTable', emailHash.Items[0]);
    return jsonResponse(200, "Success - Keywords have been added to subscriptions");
  } else {
    return jsonResponse(200, "Error - Hash expired. Please try again")
  }
}

module.exports.getKeywords = async (event) => {
  const email = decrypt(event['queryStringParameters']['email']);
  const subscriptions = await queryDB(`
    SELECT keyword FROM keywords
    LEFT JOIN subscriptions
    ON subscriptions.keyword_id_fk = keywords.keyword_id
    RIGHT JOIN emails
    ON subscriptions.email_id_fk = emails.email_id
    WHERE emails.email = ?;`, [email]);
  
  console.log(event['queryStringParameters']['email'])
  console.log(email);
  console.log(subscriptions);

  console.log(subscriptions[0].keyword);

  if (subscriptions.length === 0 || subscriptions[0].keyword === null) {
    return jsonResponse(200, []);
  } else {
    return jsonResponse(200, subscriptions);
  };
};

module.exports.sendEmailConfirmation = async (event) => {
  const email = event.body.email
  var keywords = filter('keywords', event.body.keywords)
  const hash = await emailHash(email);

  await sendEmail(
    email,
    `Please confirm you'd like to subscribe to these keywords:
  ${keywords}

Please click the appropriate link below as well to confirm the addition of these keywords.          

https://www.njs.bike/subscribe?hash=${hash}&keywords=${keywords}&email=${encrypt(email)}


To view current keyword subscriptions as well as unsubscribe from
certain keywords please click the link below:

https://www.njs.bike/unsubscribe/?email=${encrypt(email)}`,
    `njs.bike - Keyword Confirmation`
  );

  return jsonResponse(200, 'Success');
}

module.exports.checkKeywordSubscription = async (event) => {
  console.log('Invocation means change in table :)');

  const records = event['Records']
  const keywords = await queryDB(`SELECT keyword FROM keywords`);
  var emails = new Set();

  for (let record = 0; record < records.length; record++) {
    if(records[record].eventName === 'INSERT') {
      let recordTitle = records[record].dynamodb.NewImage.Title.S
      for (let keyword of keywords) {
        if(recordTitle.toLowerCase().includes(keyword['keyword'].toLowerCase())) {
          console.log(keyword)
          const responses = (await getSubscriptionEmails(keyword['keyword']));
          responses.forEach(response => emails.add(response['email']));
        }
      }
    }
  }
  console.log(emails);

  for (let email of emails) {
    if (email !== null) {
      await sendEmail(
        email,
`An item keyword you've subscribed to has been listed on njs-export!

Head on over to https://njs.bike to see what was recently listed!


To view current keyword subscriptions as well as unsubscribe from
certain keywords please click the link below:

https://www.njs.bike/unsubscribe/?email=${encrypt(email)}`,
      'njs.bike - Keyword Subscription'
      )
    }
  }
}

module.exports.checkNewComponents = async (event) => {
  console.log(`Checking for new components at ${new Date()}`);
  const currentProducts = JSON.stringify(await axios
      .get('https://njs-export.com/products.json')
      .then((res) => res.data))

  var params = {
    Bucket: 'njs-export',
    Key: 'products/products.json'
  }

  const savedProducts = (await s3.getObject(params).promise()).Body.toString('utf-8')

  if (savedProducts === currentProducts) {
    console.log('No new products have been listed!');
  } else {
    console.log('New products have been listed. Updating DB with new products.');

    params = {
      Bucket: 'njs-export',
      Key: 'products/products.json',
      Body: currentProducts
    }

    await s3.putObject(params).promise();
  }
}

module.exports.uploadAllComponents = async (event) => {
  const componentNames = [
    'frames',
    'forks',
    'chainrings',
    'cogs',
    'chains',
    'cranks',
    'bottom-brackets',
    'handlebars',
    'handlebar-stem-grip-sets',
    'headsets',
    'hubs',
    'pedals',
    'clips-and-straps',
    'rims-1',
    'saddles',
    'seatposts',
    'stems',
    'wheelsets',
    'bric-a-brac',
    'tools'
  ]

  for (let component of componentNames) {
    await uploadComponentType(component);
  }
}

module.exports.getComponentsByDate = async (event) => {
  const data = await getComponentsByDate(event['queryStringParameters']['date'])

  return jsonResponse(200, data);
}

module.exports.getLatestListingDate = async (event) => {
  return jsonResponse(200, await getLatestListingDate())
}