"use strict";
const axios = require('axios');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = new AWS.DynamoDB.DocumentClient();
const table = "NJS-ExportInventory"

const getComponentCount = async (componentName) => {
  return axios
    .get(`https://www.njs-export.com/collections/${componentName}.json`)
    .then(res => res.data.collection.products_count);
}

const getComponentInfo = async (componentName) => {
  var components = [];
  const pages = await Math.ceil(await getComponentCount(componentName) / 30);
  for(let i = 1; i <= pages; i++) {
    await axios
      .get(`https://www.njs-export.com/collections/${componentName}/products.json?page=${i}`)
      .then(res => res.data.products.forEach((component) => components.push(component)))
  }
  return components;
}

const formattedComponent = async (componentName) => {
  const components = await getComponentInfo(componentName);
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
          "Image": component.images[0].src,
          "Available": component.variants[0].available,
          "Price": component.variants[0].price
        }
      }
    })
  })

  return componentData;
}

const componentResponse = async (componentName) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        componentData: await formattedComponent(componentName)
      },
      null,
      2
    )
  }
}

const uploadComponents = async (componentName) => {
  console.log('STARTING: ', componentName);
  const components = await formattedComponent(componentName);
  var results = [];

  for (var i = 1; i <= (Math.ceil(Math.max(await components.length) / 20) * 20); i++) {
    if (i % 20 === 0) {
      var params = {
        RequestItems: {
          'NJS-ExportInventory': await components.slice(i-20, i)
        }
      }

      db.batchWrite(params, function(err, data) {
        if (err) console.log(err);
        else {
          console.log(data);
          results.push(data)
        };
      })
    }
  }
  await results;
}

/* - HANDLER FUNCTIONS - */

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
    'wheelsets'
  ]

  for (var component of componentNames) {
    await uploadComponents(component);
  }
}

module.exports.getComponents = async (event) => {
  var params = {
    TableName: 'NJS-ExportInventory',
    IndexName: 'createdDateIndex',
    KeyConditionExpression: 'CreatedDate = :cd',
    ExpressionAttributeValues: {
      ':cd': event['queryStringParameters']['date']
    }
  }

  const data = await db.query(params).promise()

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

module.exports.frameCount = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        count: await getComponentCount('cranks')
      },
      null,
      2
    ),
  };
};

module.exports.latestListing = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {  
        latestListingDate: await axios
          .get('https://njs-export.com/products.json')
          .then((res) => res.data.products[0].variants[0].created_at)
      },
      null,
      2
    ),
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

module.exports.frames = async (event) => componentResponse('frames')

module.exports.forks = async (event) => componentResponse('forks')

module.exports.cranks = async (event) => componentResponse('cranks')

module.exports.chainrings = async (event) => componentResponse('chainrings')

module.exports.cogs = async (event) => componentResponse('cogs')

module.exports.chains = async (event) => componentResponse('chains')

module.exports.stems = async (event) => componentResponse('stems')

module.exports.handlebars = async (event) => componentResponse('handlebars')

module.exports.seatposts = async (event) => componentResponse('seatposts')

module.exports.saddles = async (event) => componentResponse('saddles')

module.exports.wheels = async (event) => componentResponse('wheelsets')

module.exports.hubs = async (event) => componentResponse('hubs')

module.exports.rims = async (event) => componentResponse('rims-1')