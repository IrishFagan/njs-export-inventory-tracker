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
        <div>
          {frames.map((frame, index) => (
            <li onClick={() => {setListingDate(new Date(frame.created_at.replace(/-/g, '\/').replace(/T.+/, '')))}}>{(new Date(frame.created_at.replace(/-/g, '\/').replace(/T.+/, ''))).toDateString()}</li>
          ))}
        </div>
      ) : null}
    </div>
  )
}
