

import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Attract from './../Attract/Attract'
import './IdleScreen.css'
import actions from '../../actions/'

class IdleScreens extends React.Component {

	componentDidMount(){
		this.props.dispatch( actions.brands.clearBeverage() )
	}

	renderScreen( type ){
		const { settings } = this.props
		if( !settings.homeScreen[type] ) return null
		return (
			<Link to="home" key={type}>
				<Attract attractType={type} settings={settings} />
			</Link>
		)
	}

	render() {
		if( !this.props.settings.deviceMgmtFetched ) return false
		return (
			<div className="idle-screens">
				{ this.renderScreen('attract') }
				{ this.renderScreen('ambient') }
			</div>
		)
	}

}



const mapStateToProps = ( state ) => {
	return {
		settings: state.settings,
	}
}

export default connect(mapStateToProps)(IdleScreens)

