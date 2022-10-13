import Component from './Component';

export default function ComponentList({componentName, component, todayDate}) {
	return(
		<div>
			<h2>{componentName}</h2>
    	<ul>
    	  {component.map((individualComponent, i) =>
    	    <Component
    	      component={individualComponent}
    	      index={i}
    	      todayDate={todayDate}
    	    />
    	  )}
    	</ul>
    </div>
	)
}