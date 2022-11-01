"use strict";
const axios = require('axios');
const AWS = require('aws-sdk');

const db = new AWS.DynamoDB()
const table = "NJSExportInventory"

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
      title: component.title,
      handle: component.handle,
      created_at: component.created_at,
      image: component.images[0].src,
      available: component.variants[0].available,
      price: component.variants[0].price
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

/* - HANDLER FUNCTIONS - */

module.exports.createComponent = async (event) => {
  const params = {
    TableName: table,
    Item: {
      id: 69420,
      handle: "Stinky Bike Test",
      created_at: "00069-12-01T14:57:12+09:00",
      image: "www.test.com/image_of_poop.png",
      available: true,
      price: "420.69"
    }
  }

  await db.putItem(params, (err, data) => {
    if (err) {
      return {
        statusCode: 200,
        body: JSON.stringify(err)
      }
    } else {
      console.log("Success", data)
      return {
        statusCode: 200,
        body: JSON.stringify(params)
      }
    }
  })
}

module.exports.frameCount = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        count: await getComponentCount('frames')
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