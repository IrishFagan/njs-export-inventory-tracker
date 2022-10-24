import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import ComponentList from './components/ComponentList';
import DateSelector from './components/DateSelector';

export default function App() {
  const [listingDate, setListingDate] = useState(new Date(/*2013-06-18'*/));
  const [frames, setFrames] = useState([]);
  const [chainrings, setChainrings] = useState([]);
  const [stems, setStems] = useState([]);
  const [cranks, setCranks] = useState([]);

  const sortByDate = (components) => {
    return components.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  useEffect(() => {
    
    const getComponentCount = async (componentName) => {
      return axios
        .get(`https://www.njs-export.com/collections/${componentName}.json`)
        .then(res => res.data.collection.products_count);
    }
    
    const getComponentInfo = async (componentName, component, setComponent) => {
      const pages = await Math.ceil(await getComponentCount(componentName) / 30);
      await setComponent([])
      for(let i = 1; i <= pages; i++) {
        await axios
          .get(`https://www.njs-export.com/collections/${componentName}/products.json?page=${i}`)
          .then(res => setComponent(component => [...sortByDate(component), ...res.data.products]))
      }
    }

    getComponentInfo('frames', frames, setFrames);
    getComponentInfo('chainrings', chainrings, setChainrings);
    getComponentInfo('stems', stems, setStems);
    getComponentInfo('cranks', cranks, setCranks);
  }, [])

  return(
    <div>
      <h1>NJS Export Inventory Tracker</h1>
      <DateSelector
        setListingDate={setListingDate}
        listingDate={listingDate}
        frames={frames}
      />
      <ComponentList
        component={frames}
        componentName="Frames"
        listingDate={listingDate}
      />
      <ComponentList
        component={chainrings}
        componentName="Chainrings"
        listingDate={listingDate}
      />
      <ComponentList
        component={stems}
        componentName="Stems"
        listingDate={listingDate}
      />
      <ComponentList
        component={cranks}
        componentName="Cranks"
        listingDate={listingDate}
      />
    </div>
  );
}