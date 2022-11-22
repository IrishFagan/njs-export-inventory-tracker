import './../App.css'

export default function Component({component, ID, listingDate}) {

	return(
		<li>
			<a 
				className="flex justify-center grid" 
				href={`https://www.njs-export.com/products/${component.Handle}`}
			>
	 		  <img 
	 		  	className="mx-auto rounded-md shadow-lg m-3"
	 		  	src={component.Image} alt="Frame" width={250} height={200}
	 		  />
  	  	<div>
  	  	 	{component.Title}
  	  	</div>
  	  	{component.Available ? null : "SOLD OUT"}
	 		</a>
  	</li>
	)
}