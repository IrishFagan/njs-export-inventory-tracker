import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import ComponentList from './components/ComponentList';
import DateSelector from './components/DateSelector';

export default function App() {
  const [listingDate, setListingDate] = useState(new Date().toDateString());
  const [components, setComponents] = useState([]);
  const [frames, setFrames] = useState([]);

  const formatDate = (date) => {
    var formattedDate = (new Date(date.replace(/-/g, '\/').replace(/T.+/, '')))
    return formattedDate.toDateString()
  }

  const getComponentByDate = async (date) => {
    setComponents([]);
    axios
      .get(`https://vfvdj3rj36.execute-api.us-west-2.amazonaws.com/dev/get?date=${(date ? date : listingDate)}`)
      .then(res => setComponents(res.data.data.Items))
  }

  useEffect(() => {

    const getLatestListingDate = async () => {
      const latestListingDate = await axios
          .get('https://v3ory7fu51.execute-api.us-west-2.amazonaws.com/latest')
          .then((res) => formatDate(res.data.latestListingDate))

      setListingDate(latestListingDate)
      getComponentByDate(latestListingDate);
    }

    getLatestListingDate();
  }, [])

  return(
    <div>
      <h1>NJS Export Inventory Tracker</h1>
      <DateSelector
        getComponentByDate={getComponentByDate}
        setListingDate={setListingDate}
        listingDate={listingDate}
        frames={frames}
      />
      <ComponentList
        component={components}
        componentName="Components"
        listingDate={listingDate}
      />
    </div>
  );
}