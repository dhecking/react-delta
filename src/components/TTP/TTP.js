
import lodash from 'lodash'
import React, {Component} from 'react'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'

import freeStyleLogo from '../../assets/images/free-style-logo.png'
import chooseYourDringImage from '../../assets/images/TTP-Choose-your-drink-Icon.png'
import touchToPourImage from '../../assets/images/TTP-Touch-To-Pour-Icon.png'
import FlavorLogo from './../FlavorLogo/FlavorLogo.js'

import './TTP.css'

class TTP extends Component {

	bevTimer = null
	state = {
		entering: false,
		hasBev: false,
		isLooping: false
	}

	isSpecialtyBrand(){
		return ( this.props.specialtyType === 'specialty' )
	}

	isPromotionBrand(){
		return ( this.props.specialtyType === 'promotion' )
	}

	findBrand( brandId ){
		let brand = lodash.find( this.props.brands.brands, ( brand ) => { return brand.refId === brandId })
		if( !brand ) brand = lodash.find( this.props.brands.specialtyBrands, ( brand ) => { return brand.refId === brandId })
		if( !brand ) brand = lodash.find( this.props.brands.promotions, ( brand ) => { return brand.refId === brandId })
		if( !brand ) brand = lodash.find( this.props.brands.limitedTimeOffers, ( brand ) => { return brand.refId === brandId })
		return brand
	}

	getBrand(){
		if( !this.props.brands.currentBrand ) return null
		return this.findBrand( this.props.brands.currentBrand )
	}


	getBev(){
		if( !this.props.brands.currentBev ) return null
		const brand = this.getBrand()
		if( !brand ) return false
		console.log('brand:', brand)
		return brand.beverages[ this.props.brands.currentBev ]
	}


	getFlavor( bev ){
		if( !bev || !bev.flavorId ) return null
		return this.props.flavors.flavors[ bev.flavorId ]
	}


	getWaveColor(){
		let { flavor, defaultColor } = this.props
		if( defaultColor && !/^#/.test( defaultColor ) ) defaultColor = `#${defaultColor}`
		if( flavor ) return `#${flavor.display.mainColor}`
		if( defaultColor ) return defaultColor
		return null
	}


	currentPage( url ){
		if( /^\/brand\//.test( url ) ) return 'brand'
		if( /^\/home/.test( url ) ) return 'home'
		if( /^\/languages/.test( url ) ) return 'languages'
		return 'default'
	}


	simulatePourStart(){
		console.log('Simulate Pour Start')
	}


	simulatePourStop(){
		console.log('Simulate Pour Stop')
	}

	componentWillUnmount(){
		clearTimeout( this.bevTimer )
	}

	componentWillReceiveProps( nextProps ){
		if( this.props.brands.currentBev !== nextProps.brands.currentBev ){
			clearTimeout( this.bevTimer )
			this.setState({ hasBev: false })
			this.bevTimer = setTimeout(() => {
				this.setState({ hasBev: true })
			}, 100)
		}
	}


	render(){
		const carbUsageTrouble = false
		const route = this.currentPage( this.props.location.pathname )
		const beverage = this.getBev()

		let flavorIcon = null
		if( beverage && !carbUsageTrouble ){
			flavorIcon = this.renderIcon()
		}

		let classes = ['haptic-button']
		if(route !== 'default' || carbUsageTrouble){
			classes.push('is-idle')
		}
		if( route === 'default' ){
			classes.push('is-default')
		}
		if( flavorIcon && route === 'brand' ){
			classes.push('is-beverage')
		}
		if( this.state.isLooping ){
			classes.push('is-looping')
		}
		return (
			<div className={classes.join(' ')}>
				<CSSTransition
					classNames="ttp-trans"
					timeout={500}
					in={(flavorIcon!=null && this.state.hasBev)}
					onEntered={() => {
						this.setState({ isLooping: true })
					}}
					onExit={() => {
						this.setState({ isLooping: false })
					}}
					unmountOnExit
					appear
					enter
					exit >
						<div className="ttp-trans-wrapper">
							{ flavorIcon }
						</div>
				</CSSTransition>
				<div className="default state-display">
					<img alt="" className="default-image" src={freeStyleLogo} />
				</div>
				<div className="idle state-display">
					<img alt="" className="default-image" src={chooseYourDringImage} />
				</div>
				<div className="push-pour state-display">
					<img alt="" className="default-image" src={touchToPourImage} />
				</div>
				{process.env.NODE_ENV === 'development' && (
					 <a style={{width:'100%',height:'100%',position:'absolute',zIndex:100}}
						 onTouchStart={this.simulatePourStart.bind(this)}
						 onTouchEnd={this.simulatePourStop.bind(this)}>
							<span style={{fontSize: '0px', color: 'transparent', position: 'absolute'}}>
								Hold to Pour
							</span>
						</a>
				)}
			</div>
		)
	}


	renderIcon(){
		const brand = this.getBrand()
		const beverage = this.getBev()
		const flavor = this.getFlavor( beverage )
		if( !beverage ) return null
		return (
			<FlavorLogo
				isTTP={true}
				imgSrc={beverage.display.icon}
				selected={true}
				animate={false}
				beverage={beverage}
				brand={brand}
				ada={false}
				adaDisabled={true}
				order={1}
				defaultColor={beverage.color}
				flavor={flavor}
				key={1}
				/>
		)
	}


}





const mapStateToProps = ( state ) => {
	return {
		brands: state.brands,
		flavors: state.flavors,
		ada: state.ada,
		languages: state.languages,
		settings: state.settings,
	}
}

export default connect(mapStateToProps)(TTP)

