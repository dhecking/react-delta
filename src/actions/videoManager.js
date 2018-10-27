


export function update( data ){
	return { type: 'UPDATE_VIDEO', payload: data }
}


export function reset(){
	return {
		type: 'UPDATE_VIDEO',
		payload: {
			entering: false,
			entered: false,
			looping: false,
			exiting: false,
			enabled: false,
		}
	}
}

export function disable(){
	return {
		type: 'UPDATE_VIDEO',
		payload: {
			entering: false,
			entered: false,
			looping: false,
			exiting: true,
			// enabled: false,
		}
	}
}


export function exiting(){
	return {
		type: 'UPDATE_VIDEO',
		payload: {
			entering: false,
			entered: false,
			looping: false,
			exiting: true,
			// enabled: false,
		}
	}
}


export function enable( brandId ){
	return {
		type: 'UPDATE_VIDEO',
		payload: {
			exiting: false,
			entering: true,
			entered: false,
			enabled: true,
			brand: brandId
		}
	}
}

export function clear( data ){
	return { type: 'CLEAR_VIDEO', payload: data }
}




