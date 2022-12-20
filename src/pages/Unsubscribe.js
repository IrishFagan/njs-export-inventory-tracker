import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios'

export default function Unsubscribe() {
	const [queryParams] = useSearchParams();
	const [keywords, setKeywords] = useState(null);

	useEffect(() => {
		const getKeywords = () => {
			if(queryParams.get('email')) {
				axios
					.get(`https://api.njs.bike/get/keywords?email=${queryParams.get('email')}`)
					.then(res => setKeywords(res.data.body));
			}
		};

		getKeywords();
	}, [])


	return (
		queryParams.get('email') === null ? 
		<h2 className="justify-center">Error: Missing parameter 'Email' - Please follow the provided link again</h2> :
		<div>
			<ul>
				{keywords === null ? <li>loading...</li> :
					keywords.map((keyword, i) =>
					<li key={i}>
						{keyword.keyword}
					</li>
				)}
			</ul>
		</div>
	)
}