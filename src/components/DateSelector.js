import {useState} from 'react';

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
      <button onClick={handleOpenList}>{listingDate.toDateString()}</button>
      {openList ? (
        <ui className="dropdown">
          {frames.map((frame, index) => (
            <li className="dropdown-item" onClick={() => {setListingDate(new Date(frame.created_at.replace(/-/g, '\/').replace(/T.+/, '')))}}>{(new Date(frame.created_at.replace(/-/g, '\/').replace(/T.+/, ''))).toDateString()}</li>
          ))}
        </ui>
      ) : null}
    </div>
  )
}
