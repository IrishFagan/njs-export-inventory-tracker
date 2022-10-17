import './App.css';
import ComponentList from './components/ComponentList';
import React, { useState, useEffect} from 'react';
import axios from 'axios';

export default function App() {
  const [openList, setOpenList] = useState(false);
  const [listingDate, setListingDate] = useState(new Date(/*2013-06-18'*/));
  const [frames, setFrames] = useState([]);
  const [chainrings, setChainrings] = useState([]);

  const handleOpenList = () => {
    setOpenList(!openList);
  }

  useEffect(() => {

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

    getComponentInfo('frames', frames, setFrames);
    getComponentInfo('chainrings', chainrings, setChainrings);
  }, [])

  return(
    <div>
      <div>
        <button onClick={handleOpenList}>{listingDate.toDateString()}</button>
      </div>
      <h1>NJS Export Inventory Tracker</h1>
      <ComponentList
        component={frames}
        componentName="frames"
        listingDate={listingDate}
      />
      <ComponentList
        component={chainrings}
        componentName="chainrings"
        listingDate={listingDate}
      />
    </div>
  );
}