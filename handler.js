"use strict";

const getComponentCount = async (componentName) => {
  return axios
    .get(`https://www.njs-export.com/collections/${componentName}.json`)
    .then(res => res.data.collection.products_count);
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
      frames: "frame :)"
    },
    null,
    2
    ),
  }
}
