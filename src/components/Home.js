import React, { useState, useEffect} from 'react';
import axios from 'axios';
import '../App.css';
import ComponentList from './ComponentList';
import DateSelector from './DateSelector';

export default function Home() {
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
    if (keyword.match(/^[a-z0-9,]+$/i) || keyword === "") {
      setKeywords(keyword);
    }
  }

  useEffect(() => {

    const getLatestListingDate = async () => {
      const latestListingDate = await axios
          .get('https://hwf43ohf0h.execute-api.us-west-2.amazonaws.com/latest')
          .then((res) => formatDate(res.data.body))

      setListingDate(latestListingDate)
      getComponentByDate(latestListingDate);
    }

    getLatestListingDate();
  }, [])


  return (
    <div>
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
      <div className="fixed bottom-0 inset-x-0 z-auto bg-stone-200 p-0 pb-4 border-t-2 border-black">
        <h2 className="text-2xl italic no-underline m-3">Subscribe to Keywords</h2>
        <h2 className="text-3xl no-underline m-5">COMING SOON :)</h2>
      </div>
    </div>
  )
}