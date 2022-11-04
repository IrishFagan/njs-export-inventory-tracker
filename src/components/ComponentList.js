import Component from './Component';

export default function ComponentList({componentName, component, listingDate}) {
	return(
		<div>
			<h2>{componentName}</h2>
    	<ul>
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