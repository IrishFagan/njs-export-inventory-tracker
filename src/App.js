import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import ComponentList from './components/ComponentList';
import DateSelector from './components/DateSelector';

export default function App() {
  const [listingDate, setListingDate] = useState(new Date().toDateString());
  const [components, setComponents] = useState([]);
  const [email, setEmail] = useState("");
  const [keywords, setKeywords] = useState("");

  const formatDate = (date) => {
    var formattedDate = (new Date(date.replace(/-/g, '\/').replace(/T.+/, '')))
    return formattedDate.toDateString()
  }

  const getComponentByDate = async (date) => {
    setComponents([]);
    axios
      .get(`https://kuwsmvuodh.execute-api.us-west-2.amazonaws.com/dev/get?date=${(date ? date : listingDate)}`)
      .then(res => setComponents(res.data.data.Items))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    axios
      .post(`https://kuwsmvuodh.execute-api.us-west-2.amazonaws.com/dev/update`,
        {
          email: email,
          keywords: keywords
        })
      .then(res => {
        setEmail("");
        setKeywords("");
        console.log(res);
      })
      .catch(err => console.log(err));
  }

  const handleKeywords = async (keyword) => {
    if (keyword.match(/^[a-z0-9]+$/i) || keyword.match("")) {
      setKeywords(keyword);
    } else {
      return;
    }
  }

  useEffect(() => {

    const getLatestListingDate = async () => {
      const latestListingDate = await axios
          .get('https://hwf43ohf0h.execute-api.us-west-2.amazonaws.com/latest')
          .then((res) => formatDate(res.data.latestListingDate))

      setListingDate(latestListingDate)
      getComponentByDate(latestListingDate);
    }

    getLatestListingDate();
  }, [])

  return(
    <div>
      <h1>NJS Export Inventory Tracker</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter your email:
          <input
            type="text"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label>Enter keywords:
          <input
            type="text"
            value={keywords}
            onChange={e => handleKeywords(e.target.value)}
          />
        </label>
        <br />
        <input type="submit" />
      </form>
      <DateSelector
        getComponentByDate={getComponentByDate}
        setListingDate={setListingDate}
        listingDate={listingDate}
      />
      <ComponentList
        component={components}
        componentName="Components"
        listingDate={listingDate}
      />
    </div>
  );
}