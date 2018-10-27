

const initialState = {
	timeouts: {
		stillDeciding: 10000,
		toStillDeciding: 9000,
		homeAdaReset: 20000,
		homeToAmbient: 30000
	},
	stillDecidingActive: false,
	isPouring: false,
	hasPoured: false,
}


export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'CLEAR_TIMERS':
			state = Object.assign({}, initialState, action.payload)
			break
		case 'UPDATE_TIMERS':
			state = Object.assign({}, state, action.payload)
			break
		case 'POURING':
			const { type } = action.payload
			if( type === 'start' ){
				state = Object.assign({}, state, { isPouring: true, hasPoured: true })
			}else if( type === 'stop' ){
				state = Object.assign({}, state, { isPouring: false, hasPoured: true })
			}
			break
		default:
			break
	}

	return state

}
