import Component from './Component';

export default function ComponentList({componentName, component, listingDate}) {
	return(
		<div>
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