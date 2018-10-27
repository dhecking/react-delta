

const initialState = {
	entering: false,
	entered: false,
	looping: false,
	exiting: false,
	enabled: false,
	brand: null
}


export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'CLEAR_VIDEO':
			state = Object.assign({}, initialState, action.payload)
			break
		case 'UPDATE_VIDEO':
			state = Object.assign({}, state, action.payload)
			break
		default:
			break
	}

	return state

}