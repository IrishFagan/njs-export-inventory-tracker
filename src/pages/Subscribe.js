import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Subscribe() {
	const [queryParams] = useSearchParams();

	const email = queryParams.get('email');
	const keywords = queryParams.get('keywords');
	const hash = queryParams.get('hash');

	axios
		.get(`https://api.njs.bike/subscribe?email=${email}&hash=${hash}&keywords=${keywords}`)
		.then(res => console.log(res.data));
}