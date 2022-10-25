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
  const [hubs, setHubs] = useState([]);

  const sortByDate = (components) => {
    return components.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  useEffect(() => {
    
    const getComponentCount = async (componentName) => {
      return axios
        .get(`https://xdooj1w64j.execute-api.us-west-2.amazonaws.com/${componentName}/count`)
        .then(res => res.data.count);
    }
    
    const getComponentInfo = async (componentName, component, setComponent) => {
      return axios
        .get('https://xdooj1w64j.execute-api.us-west-2.amazonaws.com/frames')
        .then(res => setComponent(res.data.frames));
    }

    getComponentInfo('frames', frames, setFrames);
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
    </div>
  );
}