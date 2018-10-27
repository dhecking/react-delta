
import React from 'react'
import { connect } from 'react-redux'
import Translation from './../Translation'
import Logging from '../../logs'
import actions from './../../actions/'
import { withRouter } from 'react-router-dom'

import './Filters.css'

const Logs = Logging.getLogger('Filters.js')


class Filters extends React.Component {

	updateFilter( i ){
		Logs.debug('Update filter:', i)
		this.props.dispatch( actions.iconGroups.update({ current: i }) )
	}

	renderFilter( filter, i ){
		const classes = i === this.props.iconGroups.current ? 'active' : ''
		return (
			<Filter onTap={() => this.updateFilter( i )} className={classes} key={i}>
				<Translation string={filter.display.languageString} />
			</Filter>
		)
	}

	render(){
		let langSelect = null
		if( this.props.languages.availableLanguages.length > 1 ){
			langSelect = (
				<Filter onTap={() => this.props.history.push('/languages')} className={"language"} key={99}>
					{this.props.languages.currentObj.displayName}
				</Filter>
			)
		}
		return (
			<ul className="filters">
				{ this.props.iconGroups.groups.map( this.renderFilter.bind( this ) )}
				{ langSelect }
			</ul>
		)
	}

}




export const Filter = ({children, onTap, className}) => (
	<li className={`filter ${className}`} onClick={onTap}>
		{children}
	</li>
)



const mapStateToProps = ({ iconGroups, languages }) => ({ iconGroups, languages })
export default connect(mapStateToProps)(withRouter(Filters))





