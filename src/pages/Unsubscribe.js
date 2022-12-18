import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios'

export default function Unsubscribe() {
	const [queryParams] = useSearchParams();
	const [keywords, setKeywords] = useState([]);

	useEffect(() => {
		const getKeywords = () => {
			axios
				.get(`https://api.njs.bike/unsubscribe?email=${queryParams.get('email').replace('@','%40')}`)
				.then(res => setKeywords(res.data.body));
		};

		getKeywords();
	}, [])

	return (
		<div>
			<ul>
				{keywords.map((keyword, i) =>
					<li key={i}>
						{keyword.keyword}
					</li>
				)}
			</ul>
		</div>
	)
}