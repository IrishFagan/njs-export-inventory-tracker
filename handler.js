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
  for(let i = 1; i <= pages; i++) {
    await axios
      .get(`https://www.njs-export.com/collections/${componentName}/products.json?page=${i}`)
      .then(res => res.data.products.forEach((frame) => frames.push(frame)))
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
  const frames = await getComponentInfo('frames')
  var frameData = []

  await frames.forEach((frame) => {
    frameData.push({
      title: frame.title,
      handle: frame.handle,
      created_at: frame.created_at,
      image: frame.images[0].src,
      available: frame.variants[0].available,
      price: frame.variants[0].price
    })
  })

  return {
    statusCode: 200,
    body: JSON.stringify(
    {
      frames: frameData
    },
    null,
    2
    ),
  }
}
