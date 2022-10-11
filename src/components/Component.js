export default function Component({component, key, todayDate}) {

	const getCreatedDate = (component) => {
	  const date = new Date(component.created_at)
	  return date.setHours(0,0,0,0);
	}

	if(getCreatedDate(component) === todayDate) {
		return(
			<li key={key}>
  		  <img src={component.images[0].src} alt="Frame" width={250} height={200} />
  		  {getCreatedDate(component)}
  		  {component.tags[1]}
  		  {component.tags[0]}
  		</li>
		)
	} else {
		
	}
}