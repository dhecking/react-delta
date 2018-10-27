


export function update( data ){
	return { type: 'UPDATE_TIMERS', payload: data }
}

export function clear( data ){
	return { type: 'CLEAR_TIMERS', payload: data }
}




