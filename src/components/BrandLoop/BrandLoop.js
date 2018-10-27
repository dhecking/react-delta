
import lodash from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Logging from '../../logs'
import Logo from './../Logo/Logo.js'

import './BrandLoop.css'

const Logs = Logging.getLogger('BrandLoop.js')

class BrandLoop extends React.Component {

	loopInterval = null
	state = {
		current: 0
	}

	orderIncr = 0
	constructor( props ){
		super()
		this.orderIncr = props.orderBase
	}

	componentDidMount(){
		Logs.debug('Brand Loop did mount')
		this.orderIncr = this.props.orderBase
		clearInterval( this.loopInterval )
		this.loopInterval = setInterval(() => {
			this.onInterval()
		}, 3000)
	}

	componentWillUnmount(){
		clearInterval( this.loopInterval )
	}

	onInterval(){
		let count = this.props.brands.length
		let current = this.state.current
		current++
		if( current >= count ){
			current = 0
		}
		this.setState({ current })
	}

	getLink( brand ){
		if( lodash.keys( this.props.brands ).length > 1 ){
			return `${this.props.selectionPage}`
		}
		return `brand/${brand.refId}/${this.props.type}`
	}

	checkAvailability() {
		let available = false;
		const { brands } = this.props
		for(let b = 0; b < brands.length; b++) {
			if(brands[b].available && !available) available = true
		}
		return available
	}

	renderBrand( brand, i, e ){
		this.orderIncr++
		let adaEnabled = "disabled"
		if( brand.available && this.adaEnabledCount === 0 ){
			this.adaEnabledCount++
			adaEnabled = "enabled"
		}

		return (
			<Link to={this.getLink( brand )} key={brand.refId}>
				<Logo
					className={`brand-${i}`}
					id={brand.refId}
					order={this.orderIncr}
					adaEnabled={adaEnabled}
					imgSrc={brand.display.icon}
					available={brand.available}
					linkOverride={true}
					isPromo={true}
				/>
			</Link>
		)
	}

	render(){
		this.adaEnabledCount = 0
		let count = this.props.brands.length
		let classes = ['brand-loop']
		classes.push(`iter-${this.state.current}`)
		classes.push(`count-${count}`)
		this.orderIncr = this.props.orderBase
		return (
			<div className={classes.join(' ')}>

				<div className="brands">
					{/* RENDER BRANDS */}
					{ lodash.map( lodash.sortBy( this.props.brands, ( b ) => b.display.priority ), this.renderBrand.bind( this ) ) }
				</div>

			</div>
		)
	}

}






const mapStateToProps = ({ languages, ada }) => ({ languages, ada })
export default connect(mapStateToProps)(BrandLoop)


