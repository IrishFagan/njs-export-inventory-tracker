export default function Component({component, index, listingDate}) {

	const CreatedDate = (component) => {
	  const date = new Date(component.created_at.replace(/-/g, '\/').replace(/T.+/, ''))
	  return date.toDateString();
	}

	if(CreatedDate(component) === listingDate.toDateString()) {
		return(
			<li key={index}>
  		  <img src={component.images[0].src} alt="Frame" width={250} height={200} />
  		  <div>
  		   	{component.tags[1]}
  		  </div>
  		  {component.tags[0]}
  		</li>
		)
	}
}