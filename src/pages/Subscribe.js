import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Subscribe() {
	const [queryParams] = useSearchParams();
	const [email, setEmail] = useState(null);
	const [keywords, setKeywords] = useState(null);
	const [hash, setHash] = useState(null);
	const [status, setStatus] = useState(null);

	useEffect(() => {
		setEmail(queryParams.get('email'));
		setKeywords(queryParams.get('keywords'));
		setHash(queryParams.get('hash'));

		if(keywords !== null &&
			 email !== null &&
			 hash !== null) {
			axios
				.get(`https://api.njs.bike/subscribe?email=${email}&hash=${hash}&keywords=${keywords}`)
				.then(res => setStatus(res.data.body));
		}
	}, [])

	return (
		<div>
			{ !status ? <p className="flex justify-center">loading...</p> :
			<h2>{ status }</h2>
			}
		</div>
	)
}