"use strict";
const axios = require('axios');

const getComponentCount = async (componentName) => {
  return axios
    .get(`https://www.njs-export.com/collections/${componentName}.json`)
    .then(res => res.data.collection.products_count);
}

const getComponentInfo = async (componentName) => {
  var frames = [];
  const pages = await Math.ceil(await getComponentCount(componentName) / 30);
  for(let i = 1; i <= 5; i++) {
    await axios
      .get(`https://www.njs-export.com/collections/${componentName}/products.json?page=${i}`)
      .then(res => frames.push(res.data.products))
  }
  return frames;
}

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};

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

module.exports.frames = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
    {
      frames: await getComponentInfo('frames')
    },
    null,
    2
    ),
  }
}
