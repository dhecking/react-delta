
import lodash from 'lodash'
import actions from '../actions/'

const adaDebounced = lodash.debounce(( dispatch, type ) => {
	dispatch({ type: 'ADA_INTERFACE_EVENT', payload: { type: type } })
}, 200, { leading: true, trailing: false, maxWait: 200 })

const releaseDebounced = lodash.debounce(( dispatch ) => {
	dispatch({ type: 'ADA_INTERFACE_EVENT', payload: { type: 'release' } })
}, 200, { leading: true, trailing: true, maxWait: 200 })


let pouringIntervalTimer = null
let pouringIntervalTimerFailsafe = null

export function event( payload ){
	return ( dispatch ) => {
		const { data, headers } = payload
		const eventType = data.msgType

		// If it's an ADA Event:
		if( lodash.first(headers) === 'topic:/dispenser/ada' ){
			// Always trigger a release ( keep from pouring forever )
			if( data.type === 'release' ){
				return releaseDebounced( dispatch )
				// return adaDebounced( dispatch, 'release' )
			}
			return adaDebounced( dispatch, data.type )
		}

		// If troubles has been updated:
		if( lodash.first(headers) === 'topic:/dispenser/trouble' ){
			console.log('Trouble Update....')
			if( eventType === 'trouble' ){
				// Debug Statement:
				// dispatch({ type: 'CARB_USAGE_TROUBLE', payload: data.payload })
				dispatch( actions.settings.fetchTroubles() )
			}
		}

		if( lodash.first( headers ) === 'topic:/dispenser/beverages/availability' ){
			return dispatch( actions.brands.refreshAvailability() )
		}

		if( lodash.first( headers ) === 'topic:/dispenser/pour' || eventType === 'selectAndPour' ){
			console.log('POUR MESSAGE')
			if( data.type === 'start' ){
				dispatch( actions.iconGroups.update({ current: 0 }) )
				console.log('Socket Event POURING START')
				dispatch( actions.iconGroups.update({ current: 0 }) )

				// Timers Config:
				clearInterval( pouringIntervalTimer )
				clearTimeout( pouringIntervalTimerFailsafe )
				pouringIntervalTimerFailsafe = setTimeout(() => {
					console.log('FAILSAFE (45s) >>>>>>>>>>>>>>>>>>>>>>')
					clearInterval( pouringIntervalTimer )
					clearTimeout( pouringIntervalTimerFailsafe )
				}, 45000)
				// Continue passing events while pouring:
				pouringIntervalTimer = setInterval(() => {
					console.log('Timer Loop...')
					window.EventBus.emit('resetTimers', { event: 'is_pouring' })
				}, 1000)
				window.EventBus.emit('resetTimers', { event: 'start_pour' })

				dispatch({ type: 'POURING', payload: { type: 'start' } })
			}else if( data.type === 'stop' ){
				console.log('Socket Event POURING STOP')

				clearInterval( pouringIntervalTimer )
				clearTimeout( pouringIntervalTimerFailsafe )
				window.EventBus.emit('resetTimers', { event: 'stop_pour' })

				dispatch({ type: 'POURING', payload: { type: 'stop' } })
			}
		}

		return dispatch({ type: 'WEBSOCKET_EVENT', payload: payload })
	}
}


export function send( data ){
	return ( dispatch ) => {
		const message = `topic:${data.topic}

${JSON.stringify(data.data)}`
		console.log('Sending socket message:', message)
		window.es.send( message )
		return dispatch({ type: 'SEND_WEBSOCKET_EVENT', payload: {
			topic: data.topic, data: data.data, message: message
		} })
	}
}


export function closed(){
	return { type: 'WEBSOCKET_EVENT', payload: { data: { type: 'websocket_closed' } } }
}


export function opened(){
	return { type: 'WEBSOCKET_EVENT', payload: { data: { type: 'websocket_opened' } } }
}

