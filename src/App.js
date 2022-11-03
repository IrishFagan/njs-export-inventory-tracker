import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import ComponentList from './components/ComponentList';
import DateSelector from './components/DateSelector';

export default function App() {
  const [listingDate, setListingDate] = useState(new Date().toDateString());
  const [frames, setFrames] = useState([]);

  const formatDate = (date) => {
    var formattedDate = (new Date(date.replace(/-/g, '\/').replace(/T.+/, '')))
    return formattedDate.toDateString()
  }

  useEffect(() => {

    const getComponentByDate = async () => {
      axios
        .get(`https://vfvdj3rj36.execute-api.us-west-2.amazonaws.com/dev/get?date=${listingDate}`)
        .then(res => console.log(res))
    }
    
    const getComponentInfo = async (componentName, component, setComponent) => {
      return axios
        .get(`https://v3ory7fu51.execute-api.us-west-2.amazonaws.com/${componentName}`)
        .then(res => setComponent(res.data.componentData));
    }

    const getLatestListingDate = async () => {
      setListingDate(
        await axios
          .get('https://v3ory7fu51.execute-api.us-west-2.amazonaws.com/latest')
          .then((res) => formatDate(res.data.latestListingDate))
      )
    }

    getLatestListingDate();
    getComponentByDate();
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