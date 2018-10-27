

import lodash from 'lodash'

const initialState = {
	enabled: false,
	currentElement: null,
	pressing: false,
	lastTouch: 0
}

export default function reducer( state = initialState, action ){

	switch ( action.type ){
		case 'ADA_INTERFACE_EVENT':
			window.EventBus.emit('resetTimers', { event: 'ADA' })

			const { type } = action.payload

			if( window.__FS__DISBLE_TOUCH && type !== 'handicap' ){
				window.__FS__DISBLE_TOUCH = false
			}

			if( window.__FS__DISBLE_TOUCH && type !== 'release' ){
				console.log('cant move while animating')
				break
			}
			if( type === 'handicap' ){
				state = Object.assign({}, state, { enabled: !state.enabled })
			}
			if( state.enabled ){
				let elements = document.querySelectorAll('[ada-enabled="enabled"]')
				elements = lodash.sortBy( elements, ( el ) => parseInt( el.getAttribute("ada-order"), 10))
				if( type === 'reset' ){
					let setToEle = lodash.first( document.querySelectorAll('[ada-enabled="enabled"][ada-default="true"]') )
					if( !setToEle ) setToEle = lodash.first( elements )
					state = Object.assign({}, state, { currentElement: setToEle })
				}
				if( type === 'right' || type === 'left' ){
					let ele = lodash.first( elements )
					if( state.currentElement ){
						let index = lodash.indexOf( elements, state.currentElement )
						if( index !== -1 ){
							if( type === 'right' ){
								if( index+1 < elements.length ){
									ele = elements[ index+1 ]
								}
							}else{
								ele = elements[ index-1 ]
								if( index-1 < 0 ){
									ele = elements[ elements.length-1 ]
								}
							}
						}
					}
					state = Object.assign({}, state, { currentElement: ele })
				}
				if( type === 'touch' ){
					state = Object.assign({}, state, {
						pressing: true,
						// MS timestamp of touch, used to force update incase of touch/release
						// happening too fast to trigger a pressing:true/false change:
						lastTouch: ( new Date() ).getTime()
					})
				}
				if( type === 'release' ){
					state = Object.assign({}, state, { pressing: false })
				}
			}
			break
		case 'SET_ADA_ELEMENT':
			window.EventBus.emit('resetTimers', { event: 'ADA' })
			state = Object.assign({}, state, {
				currentElement: action.payload.ele
			})
			break
		case 'CLEAR_ADA':
			state = Object.assign({}, initialState, action.payload)
			break
		case 'UPDATE_ADA':
			window.EventBus.emit('resetTimers', { event: 'ADA' })
			state = Object.assign({}, state, action.payload)
			break
		default:
			break
	}

	return state

}
