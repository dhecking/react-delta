

import lodash from 'lodash'

const initialState = {
	langs: {},
	current: "en-us",
	currentObj: {},
	mappings: {}
}

function setCurrent( state, lang ){
	state.current = lang
	state.mappings = state.langs[ state.current ].translations
	state.currentObj = state.langs[ state.current ]
	return state
}





export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'FETCH_CMS_JSON':
			state = Object.assign({}, state, {
				langs: action.payload.languages,
				current: action.payload.settings.language.defaultLanguage,
				...action.payload.settings.language
			})
			state = setCurrent( state, state.current )
			break
		case 'CLEAR_LANG':
			state = Object.assign({}, initialState, action.payload)
			break
		case 'UPDATE_LANG':
			state = Object.assign({}, state, action.payload)
			break
		default:
			break
	}

	if( !lodash.isEmpty( state.langs ) ){
		state = setCurrent( state, state.current )	
	}

	return state

}