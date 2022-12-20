import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Subscribe() {
	const [queryParams] = useSearchParams();
	const [status, setStatus] = useState("");

	const email = queryParams.get('email');
	const keywords = queryParams.get('keywords');
	const hash = queryParams.get('hash');

	axios
		.get(`https://api.njs.bike/subscribe?email=${email}&hash=${hash}&keywords=${keywords}`)
		.then(res => setStatus(res.data.body));

	return (
		<div>
			{ status === "" ? <p className="flex justify-center">loading...</p> :
			<h2>{ status }</h2>
			}
		</div>
	)
}