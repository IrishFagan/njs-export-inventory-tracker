import Component from './Component';

export default function ComponentList({componentName, component, listingDate}) {
	return(
		<div>
    	<ul className="grid grid-cols-3 place-content-evenly gap-5 my-3 mx-8">
    	{component.map((individualComponent) =>
    	  <Component
    	  	key={individualComponent.ID}
    	    component={individualComponent}
    	    listingDate={listingDate}
    	  />
    	)}
    	</ul>
    </div>
	)
}