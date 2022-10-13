export default function Component({component, index, todayDate}) {

	const CreatedDate = (component) => {
	  const date = new Date(component.created_at)
	  return date.setHours(0,0,0,0);
	}

	if(CreatedDate(component) === todayDate.setHours(0,0,0,0)) {
		return(
			<li key={index}>
  		  <img src={component.images[0].src} alt="Frame" width={250} height={200} />
  		  {component.tags[1]}
  		  {component.tags[0]}
  		</li>
		)
	}
}