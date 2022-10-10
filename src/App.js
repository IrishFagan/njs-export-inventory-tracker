import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


export default function App() {
  const [frameCount, setFrameCount] = useState(0);
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    let temp = [];
    const getFrameCount = () => {
      axios
      .get("https://www.njs-export.com/collections/frames.json")
      .then(data => setFrameCount(data.data.collection.products_count))
    }
    
    const getFrameInfo = async () => {
      let pages = Math.ceil(frameCount / 30);
      for(let i = 1; i <= pages; i++) {
        await axios
          .get(`https://www.njs-export.com/collections/frames/products.json?page=${i}`)
          .then(data => {
            console.log(i)
            temp = [...temp, ...data.data.products]
            console.log(temp);
        })
      }
      await setFrames(temp);
    }

    getFrameCount();
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