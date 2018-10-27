
import lodash from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import Logging from '../../logs'
import Translation from './../Translation'

import './CaloricDisplay.css'

const Logs = Logging.getLogger('CaloricDisplay.js')


class CaloricDisplay extends React.Component {


	componentDidMount(){
		Logs.debug('CaloricDisplay did mount')
	}


	renderCup( volumeInfo, cupCals, i ){
		let { cup } = cupCals
		return (
			<tr key={cup.id}>
				<td style={{textAlign:'left'}}>{cup.name}</td>
				<td style={{textAlign:'right'}}>{Math.round(cup.volume * volumeInfo.scale)}{volumeInfo.name}</td>
				<td style={{textAlign:'right'}}>{cupCals.calories}cal</td>
			</tr>
		)
	}

	renderRows(){
		if( this.props.brands.currentCalories.fetching ){
			return (
				<div className="loading">Loading Caloric Data..</div>
			)
		}
		if( !this.props.brands.currentCalories.success ){
			return (
				<div className="loading">No caloric data available</div>
			)
		}
		let volumeInfo = lodash.get( this.props.settings, 'region.volumeInfo', {})
		let cups = lodash.get( this.props.brands, 'currentCalories.calories', [])
		return (
			<table className="caloric-table">
				<tbody>
					{ lodash.map( cups, this.renderCup.bind( this, volumeInfo ) ) }
				</tbody>
			</table>
		)
	}

	render(){
		const brand = this.props.brand
		let titleString = lodash.get( brand, 'caloricTitle', 'caloricTitleText.balance.text' )
		let subTitleString = lodash.get( brand, 'caloricSubtitle', 'caloricSubTitleText.whatYouEat2CDrink26Do.text' )
		return (
			<div className="caloric-display ele">
				<h2><Translation string={titleString} /></h2>
				<Translation string={subTitleString} />
				{ this.renderRows() }
			</div>
		)
	}

}






const mapStateToProps = ({ languages, settings, brands }) => ({ languages, settings, brands })
export default connect(mapStateToProps)(CaloricDisplay)


