import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios'

export default function Unsubscribe() {
	const [queryParams] = useSearchParams();
	const [keywords, setKeywords] = useState(null);
	const [isChecked, setIsChecked] = useState([])

	const handleOnChange = (index) => {
		setIsChecked(
			isChecked.map((checkbox, i) => i === index ? !checkbox : checkbox
		))
	}

	const strip = (array, value) => {
		return array.filter(item => item !== value);
	}

	const checkAll = () => {
		setIsChecked([...isChecked].fill(true))
	}

	const handleUnsubscribe = () => {
		var checkedIndex = isChecked.map((checkbox, index) => checkbox === true ? index : '');
		checkedIndex = strip(checkedIndex, '');
		var unsubKeywords = keywords.map((keyword, index) => checkedIndex.includes(index) ? keyword.keyword : '');
		unsubKeywords = strip(unsubKeywords, '');
		axios
			.get(`https://api.njs.bike/unsubscribe?email=${queryParams.get('email')}&keywords=${unsubKeywords.join(',')}`)
			.then(res => console.log(res.data.body))
		window.location.reload(false);
	}
	
	useEffect(() => {
		const getKeywords = () => {
			if(queryParams.get('email')) {
				axios
					.get(`https://api.njs.bike/get/keywords?email=${queryParams.get('email')}`)
					.then(res => {
						setKeywords(res.data.body)
						setIsChecked(new Array(res.data.body.length).fill(false))
					});
			}
		};

		getKeywords();
	}, [])


	return (
		queryParams.get('email') === null ? 
		<h2 className="justify-center">Error: Missing parameter 'Email' - Please follow the provided link again</h2> :
		<div>
			<ul>
				{ !keywords ? <li>loading...</li> :
					keywords.map((keyword, index) =>
					<li className="align-left" key={index}>
						<input
							checked={isChecked[index]}
							type="checkbox"
							onChange={() => handleOnChange(index)}
						/>
						{keyword.keyword}
					</li>
				)}
			</ul>
			<button onClick={() => handleUnsubscribe()} >
			Unsubscribe
			</button>
			<button onClick={() => {checkAll()}} >
			Check All
			</button>
		</div>
	)
}