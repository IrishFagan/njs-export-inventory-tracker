import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function App() {
  const [frameCount, setFrameCount] = useState(0);
  const [frames, setFrames] = useState([]);

  

  useEffect(() => {
    const getFrameCount = () => {
      axios
      .get("https://www.njs-export.com/collections/frames.json")
      .then(data => setFrameCount(data.data.collection.products_count))
    }
    
    const getFrameInfo = () => {
      let pages = Math.ceil(frameCount / 30);
      for(let i = 1; i <= 2; i++) {
        axios
          .get(`https://www.njs-export.com/collections/frames/products.json?page=${i}`)
          .then(data => {
            console.log(data.data.products)
            console.log(i)
            setFrames(data.data.products)
          })
      }
    }

    getFrameCount();
    getFrameInfo();
  }, [])

  return(
    <div>
      <h1>NJS Export Inventory Tracker</h1>
      {frames.map((frame) =>
        <li key={frame.id}>
          {frame.title}
        </li>
      )}
    </div>
  );
}