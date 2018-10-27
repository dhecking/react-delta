
import React from 'react'
import lodash from 'lodash'
import { connect } from 'react-redux'
// import Translation from './Translation'
import Logging from './../../logs'
import actions from './../../actions/'
import { withRouter } from 'react-router-dom'
import BackButton from './../BackButton/BackButton'

import './LanguageSelection.css'

const Logs = Logging.getLogger('LanguageSelection.js')


class LanguageSelection extends React.Component {

	componentDidMount(){
		this.props.dispatch( actions.brands.clearBeverage() )
	}

	selectLanguage( code ){
		Logs.info('Selected Language:', code)
		this.props.dispatch( actions.languages.update({ current: code }))
		this.props.history.push('/home')
	}

	renderLanguage( lang, i ){
		let classes = ['language']
		if( lang.code === this.props.languages.current ) classes.push('active')
		return (
			<div ada-enabled="enabled" ada-order={i} onClick={() => {
				this.selectLanguage( lang.code )
			}} className={classes.join(' ')} key={i}>
				{lang.displayName}
			</div>
		)
	}

	render(){
		return (
			<div className="languageSelection">
				<BackButton />
				<div className="languages">
					{lodash.map( lodash.values( this.props.languages.langs ), this.renderLanguage.bind( this ))}
				</div>
			</div>
		)
	}

}



const mapStateToProps = ({ languages }) => ({ languages })
export default connect(mapStateToProps)(withRouter(LanguageSelection))





