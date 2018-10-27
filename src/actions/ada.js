


export function update( data ){
	return { type: 'UPDATE_ADA', payload: data }
}

export function clear( data ){
	return { type: 'CLEAR_ADA', payload: data }
}

export function setElement( ele ){
	return { type: 'SET_ADA_ELEMENT', payload: { ele } }
}

export function reset( data ){
	return { type: 'ADA_INTERFACE_EVENT', payload: { type: 'reset' } }
}




