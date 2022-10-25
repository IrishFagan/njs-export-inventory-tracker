import './../App.css'

export default function Component({component, index, listingDate}) {

	const CreatedDate = (component) => {
	  const date = new Date(component.created_at.replace(/-/g, '\/').replace(/T.+/, ''))
	  return date.toDateString();
	}

	if(CreatedDate(component) === listingDate.toDateString()) {
		return(
			<li className="list" key={index}>
				<a href={`https://www.njs-export.com/products/${component.handle}`}>
	  		  <img src={component.image} alt="Frame" width={250} height={200} />
	  		</a>
  		  <div>
  		   	{component.title}
  		  </div>
  		  {component.available ? null : "SOLD OUT"}
  		</li>
		)
	}
}