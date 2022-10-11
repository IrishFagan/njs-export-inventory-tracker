import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function App() {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
  
    const getFrameCount = async () => {
      return axios
        .get("https://www.njs-export.com/collections/frames.json")
        .then(res => res.data.collection.products_count);
    }
    
    const getFrameInfo = async () => {
      const pages = await Math.ceil(await getFrameCount() / 30);
      setFrames([])
      for(let i = 1; i <= pages; i++) {
        const response = await axios.get(`https://www.njs-export.com/collections/frames/products.json?page=${i}`)
        const filteredResponse = response.data.products
        setFrames(frames => [...frames, ...filteredResponse])
      }
    }

    getFrameInfo();
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