/*
* This file is used to implement API calls.
*/

/* HOW TO USE:

GET REQUESTS
const query = {
	userId: userId
}
async function getUserPosts(userId) {
	await getFetch('https://sample-url', query).then((val) => {})
}

POST REQUESTS
const newUser = {
	firstName: "Juan",
	lastName: "dela Cruz",
}
function postUser() {
	postFetch('https://sample-url', newUser).then((val) => {})
}

*/

const getFetch = async (url, params) => {

	let newURL = '';

	// If there are parameters given, reconstruct the query string and combine it with the given base url.
	if (params) {
		// reconstruct the query
		const queryString = Object.entries(params).map(param => {
			return `${param[0]}=${param[1]}`;
		}).join('&');

		newURL = `${url}?${queryString}`;
	} else {
		newURL = url;
	}

	// using the fetch function
	return await fetch(newURL, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
			
	}).then((res) => {
		return res.json();

	}).catch((err) => {
		console.error(err);
	});
}

const postFetch = async (url, obj) => {
		
	return fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		//credentials: 'include',
		body: JSON.stringify(obj)

	}).then((res) => {
		return res.json();

	}).catch((err) => {
		console.error(err);
	});
}

export { getFetch, postFetch };