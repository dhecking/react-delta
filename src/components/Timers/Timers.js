

import React, { Component } from 'react'
import { connect } from 'react-redux'
import StillDecidingModal from './../StillDecidingModal/StillDecidingModal'
import { withRouter } from 'react-router-dom'
import actions from './../../actions/'
import Logging from '../../logs'

import './Timers.css'

const Log = Logging.getLogger('Timers.js')

/*

screenAmbientUpdateMS: 			5000
screenAttractEnabled: 			true
screenIdleExitAdaToHomeMS: 		30000
screenIdleSelectionMS: 			6000
screenIdleToAdaHomeMS: 			30000
screenIdleToAmbientMS: 			1200000
screenIdleToAttractMS: 			60000
screenIdleToHomeAfterPourMS: 	9000
screenIdleToHomeMS: 			6000
screenIdleToLowPowerMS: 		3600000

 */




class Timers extends Component {

	state = {
		lastEvent: ( new Date() ).getTime(),
		timersEnabled: true
	}

	constructor(){
		super()
		Log.debug('Timers Started')
		window.EventBus.on('resetTimers', (e) => {
			setTimeout( this.onResetTimersEvent.bind( this ), 50 )
		})
		setInterval( this.timerSweep.bind( this ), 1000 )
	}

	componentDidMount(){
		if( process.env.NODE_ENV === 'development' ){
			// If we want to disable timers during dev:
			// this.setState({ timersEnabled: false })
		}
	}


	onResetTimersEvent(){
		const { timers } = this.props
		if( timers.stillDecidingActive ) this.props.dispatch( actions.timers.update({ stillDecidingActive: false }))
		this.setState({ lastEvent: ( new Date() ).getTime() })
	}


	timerSweep(){
		if( !this.state.timersEnabled ) return false

		// We run this once a second to check the last
		// event vs timeouts and update state accordingly
		const timeouts = this.props.settings.deviceMgmt.config
		const { timers, ada } = this.props
		const now = ( new Date() ).getTime()
		const sinceLastEvent = ( now - this.state.lastEvent )
		const route = this.currentPage( this.props.location.pathname )
		Log.debug('Timer sweep, last event:', Math.round( sinceLastEvent / 1000 ), 's ago. Current on:', route )

		if( route === 'brand' ){
			if( timers.hasPoured ){
				if( ada.enabled ){
					if( sinceLastEvent >= timeouts.screenIdleToAdaHomeMS ){
						window.EventBus.emit('resetTimers', { event: 'timeout_expired', timeout: 'hasPoured' })
						this.props.history.push('/home')
					}
				}else{
					if( sinceLastEvent >= timeouts.screenIdleToHomeAfterPourMS ){
						window.EventBus.emit('resetTimers', { event: 'timeout_expired', timeout: 'hasPoured' })
						this.props.history.push('/home')
					}
				}
			}else if( sinceLastEvent >= timeouts.screenIdleSelectionMS ){
				if( !timers.stillDecidingActive ){
					Log.debug('Triggering Still Deciding?...')
					this.props.dispatch( actions.timers.update({ stillDecidingActive: true }))

				}else if( sinceLastEvent >= ( timeouts.screenIdleToHomeMS + timeouts.screenIdleSelectionMS ) ){
					Log.debug('Still Deciding Completed. Redirect home....')
					window.EventBus.emit('resetTimers', { event: 'timeout_expired', timeout: 'stillDeciding' })
					this.props.dispatch( actions.iconGroups.update({ current: 0 }) )
					this.props.history.push('/home')
				}
			}
		}

		else if( route !== 'default' ){
			if( ada.enabled ){
				if( sinceLastEvent >= timeouts.screenIdleExitAdaToHomeMS ){
					this.props.dispatch( actions.ada.update({ enabled: false }))
				}
			}else{
				if( route !== 'home' ){
					if( sinceLastEvent >= timeouts.screenIdleToHomeMS ){
						window.EventBus.emit('resetTimers', { event: 'timeout_expired', timeout: 'idle_to_home' })
						this.props.history.push('/home')
					}
				}else if( sinceLastEvent >= timeouts.screenIdleToAmbientMS ){
					// This event should be used to trigger refreshing of API states since no one is at the machine
					window.EventBus.emit('resetTimers', { event: 'timeout_expired', timeout: 'stillDeciding' })
					this.props.history.push('/')
				}
			}
		}

	}


	currentPage( url ){
		if( /^\/brand\//.test( url ) ) return 'brand'
		if( /^\/home/.test( url ) ) return 'home'
		if( /^\/languages/.test( url ) ) return 'languages'
		if( /^\/promotions/.test( url ) ) return 'promotions'
		if( /^\/specialty/.test( url ) ) return 'specialty'
		return 'default'
	}


	render(){
		return (
			<div className="timers">
				<StillDecidingModal />
			</div>
		)
	}

}


const mapStateToProps = ( state ) => {
	return {
		brands: state.brands,
		ada: state.ada,
		settings: state.settings,
		timers: state.timers,
	}
}

export default connect( mapStateToProps )(withRouter( Timers ))
