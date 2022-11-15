"use strict";
const axios = require('axios');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

const table = "NJS-ExportInventory";

/* - HELPER FUNCTIONS - */

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

  for (var i = 1; i <= (Math.ceil(Math.max(await formattedComponents.length) / 20) * 20); i++) {
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

const returnResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(
      {
        body: body
      }
    )
  }
}

const handleEmailVerification = async (email, keywords) => {
  var hash = hashCode(email);
  var params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Text: { Data: 
          `Please confirm you'd like to subscribe to these keywords:
          ${keywords}

          Please click the appropriate link below as well to confirm the addition of these keywords.
          ${hash}
          `
        },
      },
      Subject: { Data: `Confirm Keywords`},
    },
    Source: "dev-test-user@njs.bike",
  };

  console.log(hash);

  return ses.sendEmail(params).promise()
}

/* - HANDLER FUNCTIONS - */

module.exports.sendEmailConfirmation = async (event) => {
  var response = returnResponse(200, "All is well :)")
  const email = event.body.email
  var keywords = event.body.keywords.split(',')

  console.log('email: ', email);
  console.log('keywords: ', keywords);

  keywords = keywords.filter(keyword => keyword.match(/^[a-z0-9]+$/i))

  console.log(keywords)

  var emailResponse = await handleEmailVerification(email, keywords);

  console.log(emailResponse);

  return response
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

  for (var component of componentNames) {
    await uploadComponentType(component);
  }
}

module.exports.getComponentsByDate = async (event) => {
  const data = await getComponentsByDate(event['queryStringParameters']['date'])

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(
      {
        data: data
      }
    )
  }
}

module.exports.getLatestListingDate = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {  
        latestListingDate: await getLatestListingDate()
      },
      null,
      2
    ),
  }
}

module.exports.checkForSpecificComponent = async (event) => {
  console.log('Invocation means change in table :)');

  const records = event['Records']

  for (var record = 0; record < records.length; record++) {
    if(records[record].eventName === 'INSERT') {
      console.log(records[record].dynamodb.NewImage.Title.S)
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