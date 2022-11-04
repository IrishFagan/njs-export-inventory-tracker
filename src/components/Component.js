import './../App.css'

export default function Component({component, index, listingDate}) {

	return(
		<li className="list" key={index}>
			<a href={`https://www.njs-export.com/products/${component.Handle}`}>
	 		  <img src={component.Image} alt="Frame" width={250} height={200} />
	 		</a>
  	  <div>
  	   	{component.Title}
  	  </div>
  	  {component.Available ? null : "SOLD OUT"}
  	</li>
	)
}