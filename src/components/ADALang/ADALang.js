
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import './ADALang.css'

class ADALang extends Component {
	render(){
		if( this.props.languages.availableLanguages.length <= 1 ) return null
		let classes = ['ada-lang']
		if( this.props.ada.enabled ) classes.push('enabled')
		return (
			<Link to={"/languages"} ada-enabled="enabled" ada-order={999} className={classes.join(' ')}>
				<div className="bordered">
					<div>{this.props.languages.currentObj.name}</div>
				</div>
			</Link>
		)
	}
}


const mapStateToProps = ({ ada, settings, languages }) => ({ ada, settings, languages })
export default connect(mapStateToProps)(ADALang)
