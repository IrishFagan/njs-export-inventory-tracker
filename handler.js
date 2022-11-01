"use strict";
const axios = require('axios');
const AWS = require('aws-sdk');

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
          "ID": component.id.toString(),
          "Type": component.product_type,
          "Title": component.title,
          "Handle": component.handle,
          "CreatedAt": component.created_at,
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

/* - HANDLER FUNCTIONS - */

module.exports.uploadComponents = async (event) => {
  const components = await formattedComponent('chainrings')

  for (var i = 1; i <= (Math.ceil(Math.max(await components.length) / 20) * 20); i++) {
    if (i % 20 === 0) {
      var params = {
        RequestItems: {
          'NJS-ExportInventory': await components.slice(i-20, i)
        }
      }

      await db.batchWrite(params, function(err, data) {
        if (err) console.log(err);
        else console.log(data);
      })
    }
  }
}

module.exports.createComponent = async (event) => {
  const params = {
    TableName: table,
    Item: {
      "ID": "69420",
      "Handle": "Stinky Bike Test",
      "CreatedAt": "00069-12-01T14:57:12+09:00",
      "Image": "www.test.com/image_of_poop.png",
      "Available": true,
      "Price": "420.69"
    }
  }

  db.put(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
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