import Component from './Component';

export default function ComponentList({componentName, component, todayDate}) {
	return(
		<div>
			<h2>{componentName} - {new Date(todayDate).toString()}</h2>
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