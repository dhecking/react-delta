

import Logging from './logs'
const Logs = Logging.getLogger('api.js')

const JSON_HEADERS = { 'Content-Type': 'application/json' }
const BASE = `/api`

// const fetchDispenserModel = () => get(`/dispenser/model`)
const fetchSettings = ()=> get(`/paths/system/details`)
const fetchDetails = ()=> get(`/paths/system.service:recipe/details`)
const fetchTroubles = () => get(`/troubles`)
const fetchCMSJSON = () => get(`/ui-config.json`, null, true )
const fetchActiveRegion = () => get(`/regions/active`)
const fetchAvailabilities = () => get(`/beverages/availabilities`)
const fetchCurrentBeverageCalories = ( signal ) => get(`/app/selfServe/api/calories`, null, true )

// Set beverage:
const setBeverage = ( id, signal ) => {
	return requestv2({
		method: 'POST',
		url: `/pour/beverages/${id}/select`,
		signal
	})
	// .catch( e => console.error('IGNORE UNAVAILABLE BEVERAGE ERROR', e))
	.catch( e => Logs.debug('Ignore Unavailable Beverage Error'))
}


// Start pouring beverage:
const startPour = () => {
	return post(`/pour/start`)
}

// Stop pouring beverage:
const stopPour = () => {
	return post(`/pour/stop`)
}

// Clear selected beverage:
const clearSelected = () => {
	return delete0(`/pour/beverages/select`)
}

// Navigate to NCUI
const navigateToNCUI = () => {
	return post(`/navigation`, {"url":"http://localhost:8080/app/ncui/index.html"})
}


// Make sure to unselect beverages when leaving the UI
window.addEventListener( 'beforeunload', () => clearSelected() )


export default {
	startPour,
	stopPour,
	fetchSettings,
	fetchCMSJSON,
	fetchDetails,
	fetchTroubles,
	// fetchDispenserModel,
	fetchActiveRegion,
	fetchAvailabilities,
	fetchCurrentBeverageCalories,
	setBeverage,
	clearSelected,
	navigateToNCUI,
}

// -------------------------------------- utility functions


function get( url, body, noBasePrefixed ){ return request('GET', url, body, noBasePrefixed) }

function post( url, body ){ return request('POST', url, body) }

function delete0( url, body ){ return request('DELETE', url, body) }


function requestv2( params ){
	let { method, url, body, noBasePrefixed, signal } = params
	noBasePrefixed = noBasePrefixed || false
	let options = { method: method, headers: JSON_HEADERS, signal }
	if (body) options['body'] = typeof body !== 'string' ? JSON.stringify(body) : body
	if (!url.startsWith(BASE) && noBasePrefixed === false) url = `${BASE}${url}`
	return new Promise(( resolve, reject ) => {
		return fetch( url, options ).then(( response ) => {
			if (response.ok) return response.json().then( handleResponse(resolve, reject) )
			return response.json().then(( text ) => {
				const error = new Error(response.statusText)
				error.data = text
				reject( error )
			})
		})
	})
}

function request( method, url, body, noBasePrefixed = false ){
	let options = { method: method, headers: JSON_HEADERS }
	if (body) options['body'] = typeof body !== 'string' ? JSON.stringify(body) : body
	if (!url.startsWith(BASE) && noBasePrefixed === false) url = `${BASE}${url}`
	return new Promise(( resolve, reject ) => {
		return fetch( url, options ).then(( response ) => {
			if (response.ok) return response.json().then( handleResponse(resolve, reject) )
			return response.json().then(( text ) => {
				const error = new Error(response.statusText)
				error.data = text
				reject( error )
			})
		})
	})
}

function handleResponse(resolve, reject) {
	return ( json ) => {
		try {
			resolve( parsePayload(json) )
		} catch(e) {
			console.error('ERROR IN RESPONSE', json)
			reject( e )
		}
	}
}

function parsePayload(json) {
	if (json && json.code === 0 && json.message === 'success') return json.data || {}
	if (json) throw new Error({message:json.message, code: json.code})
	throw new Error(json)
}
