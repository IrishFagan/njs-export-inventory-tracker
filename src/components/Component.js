import './../App.css'

export default function Component({component, ID, listingDate}) {

	return(
		<li>
			<a className="flex justify-center" href={`https://www.njs-export.com/products/${component.Handle}`}>
	 		  <img className="rounded-md shadow-lg" src={component.Image} alt="Frame" width={250} height={200} />
	 		</a>
  	  <div>
  	   	{component.Title}
  	  </div>
  	  {component.Available ? null : "SOLD OUT"}
  	</li>
	)
}