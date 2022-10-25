"use strict";
const axios = require('axios');

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
      componentData: await formattedComponent('frames')
    },
    null,
    2
    ),
  }
}

module.exports.chainrings = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
    {
      componentData: await formattedComponent('chainrings')
    },
    null,
    2
    )
  }
}