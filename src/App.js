import './App.css';
import React, { useState, useEffect} from 'react';
import axios from 'axios';


export default function App() {
  const [updateDate, setUpdateDate] = useState("updating");
  const [frames, setFrames] = useState([]);
  const [chainrings, setChainrings] = useState([]);

  useEffect(() => {

    const getLastUpdatedDate = async (componentName) => {
      await axios
        .get(`https://www.njs-export.com/collections/${componentName}.json`)
        .then(res => setUpdateDate(`${componentName} last updated at ${res.data.collection.updated_at}`));
    }
  
    const getComponentCount = async (componentName) => {
      return axios
        .get(`https://www.njs-export.com/collections/${componentName}.json`)
        .then(res => res.data.collection.products_count);
    }
    
    const getComponentInfo = async (componentName, component, setComponent) => {
      const pages = await Math.ceil(await getComponentCount(componentName) / 30);
      setComponent([])
      for(let i = 1; i <= pages; i++) {
        await axios
          .get(`https://www.njs-export.com/collections/${componentName}/products.json?page=${i}`)
          .then(res => setComponent(component => [...component, ...res.data.products]))
      }
    }

    getLastUpdatedDate('frames');
    getComponentInfo('frames', frames, setFrames);
    //getComponentInfo('chainrings', chainrings, setChainrings);
  }, [])

  return(
    <div>
      <h1>NJS Export Inventory Tracker</h1>
      <h2>{updateDate}</h2>
      {frames.map((frame, i) =>
        <li key={i}>
          <div>
            {frame.tags[1]}
            {frame.tags[0]}
          </div>
          <img src={frame.images[0].src} alt="Frame" width={250} height={200} />
        </li>
      )}
      <h2>New Chainrings</h2>
      {chainrings.map((chainring, i) =>
        <li key={i}>
          {chainring.title}
        </li>
      )}
    </div>
  );
}