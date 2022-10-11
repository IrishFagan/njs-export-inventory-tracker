import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function App() {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
  
    const getItemCount = async (itemName) => {
      return axios
        .get(`https://www.njs-export.com/collections/${itemName}.json`)
        .then(res => res.data.collection.products_count);
    }
    
    const getItemInfo = async (itemName, item, setItem) => {
      const pages = await Math.ceil(await getItemCount(itemName) / 30);
      setItem([])
      for(let i = 1; i <= pages; i++) {
        const response = await axios.get(`https://www.njs-export.com/collections/${itemName}/products.json?page=${i}`)
        const filteredResponse = response.data.products;
        setItem(item => [...item, ...filteredResponse])
      }
    }

    getItemInfo('frames', frames, setFrames);
  }, [])

  return(
    <div>
      <h1>NJS Export Inventory Tracker</h1>
      {frames.map((frame, i) =>
        <li key={i}>
          {frame.title}
        </li>
      )}
    </div>
  );
}