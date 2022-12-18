import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios'

export default function Unsubscribe() {
	const [queryParams] = useSearchParams();
	const [keywords, setKeywords] = useState([]);

	useEffect(() => {
		const getKeywords = () => {
			if(queryParams.get('email')) {
				axios
					.get(`https://api.njs.bike/unsubscribe?email=${queryParams.get('email').replace('@','%40')}`)
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
				{keywords.length === 0 ? <li>loading...</li> :
					keywords.map((keyword, i) =>
					<li key={i}>
						{keyword.keyword}
					</li>
				)}
			</ul>
		</div>
	)
}