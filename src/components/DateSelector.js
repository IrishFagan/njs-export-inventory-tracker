import {useState} from 'react';
import Calendar from 'react-calendar';
import styles from './../App.css'
import 'react-calendar/dist/Calendar.css';

export default function DateSelector({setListingDate, listingDate, frames}) {
  const [openList, setOpenList] = useState(false);

  const handleOpenList = () => {
    setOpenList(!openList);
  }

  const handleClick = (date) => {
    setListingDate(new Date(date))
  }

  return (
    <div>
      <button 
        onClick={handleOpenList}>{listingDate.toDateString()}
      </button>
      {openList ? (
        <Calendar 
          onChange={handleClick}
          value={listingDate}
          className="Calendar"
        />
      ) : null}
    </div>
  )
}
