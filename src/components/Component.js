import './../App.css'

export default function Component({component, index, listingDate}) {

	const CreatedDate = (component) => {
	  const date = new Date(component.PutRequest.Item.CreatedDate.replace(/-/g, '\/').replace(/T.+/, '')).toDateString()
	  return date;
	}

	if(CreatedDate(component) === listingDate) {
		return(
			<li className="list" key={index}>
				<a href={`https://www.njs-export.com/products/${component.PutRequest.Item.Handle}`}>
	  		  <img src={component.PutRequest.Item.Image} alt="Frame" width={250} height={200} />
	  		</a>
  		  <div>
  		   	{component.PutRequest.Item.Title}
  		  </div>
  		  {component.PutRequest.Item.Available ? null : "SOLD OUT"}
  		</li>
		)
	}
}