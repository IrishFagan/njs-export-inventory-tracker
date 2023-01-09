import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Subscribe() {
	const [queryParams] = useSearchParams();
	const [email] = useState(queryParams.get('email'));
	const [keywords] = useState(queryParams.get('keywords'));
	const [hash] = useState(queryParams.get('hash'));
	const [status, setStatus] = useState(null);

	useEffect(() => {

		if(keywords !== null &&
			 email !== null &&
			 hash !== null) {

			axios
				.get(`https://api.njs.bike/subscribe?email=${email}&hash=${hash}&keywords=${keywords}`)
				.then(res => setStatus(res.data.body));
		}
	}, [])

	if(keywords === null ||
		 email === null ||
		 hash === null) {
		return (
			<div>
				<h2>Error - Invalid parameters. Please fill out the subscription form again</h2>
			</div>
		)
	} else {
		return (
			<div>
				{ !status ? <p className="flex justify-center">loading...</p> :
				<h2>{ status }</h2>
				}
			</div>
		)
	}
}