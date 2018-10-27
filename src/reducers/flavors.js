

const initialState = {
	flavors: {}
}


export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'FETCH_CMS_JSON':
			state = Object.assign({}, state, { flavors: action.payload.flavors })
			break
		case 'CLEAR_FLAVORS':
			state = Object.assign({}, initialState, action.payload)
			break
		case 'UPDATE_FLAVORS':
			state = Object.assign({}, state, action.payload)
			break
		default:
			break
	}

	return state

}