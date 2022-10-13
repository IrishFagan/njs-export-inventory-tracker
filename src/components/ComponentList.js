import './../App.css'
import Component from './Component';

export default function ComponentList({componentName, component, listingDate}) {
	return(
		<div>
			<h2>{componentName} - {listingDate.toDateString()}</h2>
    	<ul>
    	{component.map((individualComponent, i) =>
    	  <Component
    	    component={individualComponent}
    	    index={i}
    	    listingDate={listingDate}
    	  />
    	)}
    	</ul>
    </div>
	)
}