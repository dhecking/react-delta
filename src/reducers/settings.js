
import {
	FETCH_SETTINGS_COMPLETE,
	CLEAR_SETTINGS,
	UPDATE_SETTINGS,
	FETCH_REGION_COMPLETE
} from './../actions/settings'



const initialState = {
	homeScreen: {},
	hardware: {
		model: ''
	},
	videoEnabled: false,
	language: {},
	cmsFetched: false,
	deviceMgmt: {
		config: {
			screenIdleSelectionMS: 6000,
		},
		details: {
			promosEnabled: false
		}
	},
	region: {},
	deviceMgmtFetched: false,
	regionFetched: false,
	hasTroubles: false,
	troubles: [],
	hasCarbUsageTrouble: false,
}


export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'FETCH_CMS_JSON':
			const { homeScreen, hardware } = action.payload
			const { videoEnabled, language } = action.payload.settings
			state = Object.assign({}, state, { homeScreen, hardware, videoEnabled, language, cmsFetched: true })
			break
		case 'FETCH_TROUBLES_COMPLETE':
			let hasTroubles = false
			if( action.payload.length > 0 ){
				hasTroubles = true
			}
			state = Object.assign({}, state, { hasTroubles, troubles: action.payload })
			break
		case 'CARB_USAGE_TROUBLE':
			console.log('CARB_USAGE_TROUBLE', action.payload)
			state = Object.assign({}, state, { hasCarbUsageTrouble: action.payload })
			break
		case CLEAR_SETTINGS:
			state = Object.assign({}, initialState, action.payload)
			break
		case UPDATE_SETTINGS:
			state = Object.assign({}, state, action.payload)
			break
		case FETCH_SETTINGS_COMPLETE:
			state = Object.assign({}, state, {
				deviceMgmt: action.payload,
				deviceMgmtFetched: true,
			})
			break
		case FETCH_REGION_COMPLETE:
			state = Object.assign({}, state, {
				region: action.payload,
				regionFetched: true
			})
			break
		default:
			break
	}

	return state

}
