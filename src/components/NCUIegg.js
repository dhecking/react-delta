
import React from 'react'
import api from '../api'
import Logging from '../logs'
const Log = Logging.getLogger('NCUIegg.js')


const NCUI_EGG_TIMEOUT = 4000


// Hidden button for navigating to NCUI on holding down for X Seconds
export default class ToNCUIEgg extends React.PureComponent {

	toNCUITimeout = null

	componentWillUnmount(){
		clearTimeout(this.toNCUITimeout)
	}

	toNCUIStart(){
		Log.info('Starting NCUI handshake timeout')
		clearTimeout(this.toNCUITimeout)
		this.toNCUITimeout = setTimeout(() => {
			Log.info('CALLING NAvIGATE API TO NCUI')
			api.navigateToNCUI()
		}, NCUI_EGG_TIMEOUT)
	}

	toNCUIEnd(){
		Log.info('Clearing NCUI handshake timeout')
		clearTimeout(this.toNCUITimeout)
	}

	render(){
		return (
			<div onTouchStart={()=>{ this.toNCUIStart() }} onTouchEnd={()=>{ this.toNCUIEnd() }} className="toTTP"></div>
		)
	}

}




