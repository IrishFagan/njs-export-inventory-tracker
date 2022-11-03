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
    setListingDate(date.toDateString())
  }

  return (
    <div>
      <button 
        onClick={handleOpenList}>{listingDate}
      </button>
      {openList ? (
        <Calendar 
          onChange={handleClick}
          value={new Date(listingDate)}
          className="Calendar"
        />
      ) : null}
    </div>
  )
}
