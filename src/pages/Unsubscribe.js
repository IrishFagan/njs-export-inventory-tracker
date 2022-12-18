import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Unsubscribe() {
	const [queryParams] = useSearchParams();

	console.log(queryParams.get('email'))

	return (
		<div>
			<ul>
				List of keywords :)
			</ul>
		</div>
	)
}