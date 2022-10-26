import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import ComponentList from './components/ComponentList';
import DateSelector from './components/DateSelector';

export default function App() {
  const [listingDate, setListingDate] = useState(new Date(/*2013-06-18'*/));
  const [frames, setFrames] = useState([]);
  const [chainrings, setChainrings] = useState([]);
  const [cranks, setCranks] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [stems, setStems] = useState([]);
  const [handlebars, setHandlebars] = useState([]);

  const sortByDate = (components) => {
    return components.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  useEffect(() => {
    
    const getComponentInfo = async (componentName, component, setComponent) => {
      return axios
        .get(`https://v3ory7fu51.execute-api.us-west-2.amazonaws.com/${componentName}`)
        .then(res => setComponent(res.data.componentData));
    }

    getComponentInfo('frames', frames, setFrames);
    getComponentInfo('chainrings', chainrings, setChainrings);
    getComponentInfo('cranks', cranks, setCranks);
    getComponentInfo('hubs', hubs, setHubs);
    getComponentInfo('stems', stems, setStems);
    getComponentInfo('handlebars', handlebars, setHandlebars)
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
        component={cranks}
        componentName="Cranks"
        listingDate={listingDate}
      />
      <ComponentList
        component={hubs}
        componentName="Hubs"
        listingDate={listingDate}
      />
      <ComponentList
        component={stems}
        componentName="Stems"
        listingDate={listingDate}
      />
      <ComponentList
        component={handlebars}
        componentName="Handlebars"
        listingDate={listingDate}
      />
    </div>
  );
}