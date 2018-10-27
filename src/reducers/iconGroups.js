
import lodash from 'lodash'

const initialState = {
	groups: {},
	current: 0
}

function setCurrent( state, current ){
	state.current = current
	state.currentObj = state.groups[ state.current ]
	return state
}



export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'FETCH_CMS_JSON':
			state = Object.assign({}, state, { groups: action.payload.iconGroups })
			state.current = lodash.findIndex( state.groups, { default: true })
			break
		case 'CLEAR_ICONGROUPS':
			state = Object.assign({}, initialState, action.payload)
			break
		case 'UPDATE_ICONGROUPS':
			state = Object.assign({}, state, action.payload)
			break
		default:
			break
	}

	state = setCurrent( state, state.current )
	return state

}