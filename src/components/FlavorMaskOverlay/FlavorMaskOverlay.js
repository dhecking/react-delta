
import lodash from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import './FlavorMaskOverlay.css'

class FlavorMaskOverlay extends Component {

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


	renderGlassMask(liquidColor) { return (
		<svg className="glass-mask" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xmlSpace="preserve" >
			<path className="st0" d="M94.9,878.5c-7.3-151.9-48.9-232-84.6-403.3C-2.6,373-18.9,271.5,78.1,2.5c40.8-0.3,585.1-3.2,686.8-1.4
			C852.4,202,858.9,315,838.2,468.8c-39.3,169.9-76.4,314.6-83.4,409.7C601.9,881.8,94.9,878.,94.9,878.5z" fill="url(#grad1)" ></path>
			<defs>
				<linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style={{stopColor:'transparent',stopOpacity:1}} />
					<stop offset="14%" style={{stopColor:liquidColor,stopOpacity:.8}} />
					<stop offset="70%" style={{stopColor:liquidColor,stopOpacity:.8}} />
				</linearGradient>
			</defs>
		</svg>
	)}

	renderGlassMaskFull(liquidColor) { return (
		<svg className="glass-mask glass-mask--full" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xmlSpace="preserve" >
			<path className="st0" d="M421,377.1c17.4-74.1,25.5-104.3,25.5-189.2C446.5,94.3,405,2.4,405,2.4S367.3,0,229.1,0
			C61.9,0,43.4,2.1,43.4,2.1S0.5,95,0.5,188.6c0,70.7,2,113.3,20.2,169.5C38.9,414.4,49.5,508.3,51,575.7c1.5,67.4,0.8,214.4,0,235.2
			c-0.7,19.1-5.8,61,127.9,68c0,0.7,0,1,0,1h41.5h2.4h41.5c0,0,0-0.3,0-1c133.7-7.1,128.6-48.9,127.9-68c-0.8-20.9,0.6-167.8,0-235.2
			C391.3,481.2,407.4,434.8,421,377.1z" fill="url(#grad1)"></path>
			<defs>
				<linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" style={{stopColor:'transparent',stopOpacity:1}} />
					<stop offset="10%" style={{stopColor:liquidColor,stopOpacity:.8}} />
					<stop offset="87.5%" style={{stopColor:liquidColor,stopOpacity:.8}} />
					<stop offset="100%" style={{stopColor:'transparent',stopOpacity:1}} />
				</linearGradient>
			</defs>
		</svg>
	)}

	render(){

		if( this.props.ada.enabled ) return false
		const { flavors, model } = this.props

		const beverage = this.getBev()
		const brand = this.getBrand()
		if( !beverage || !brand ) return null

		const hideColor = lodash.get( brand, 'display.background.video.hideColorOverlay', false )
		const { isFlavored } = beverage

		if( hideColor || !isFlavored ) return null

		const flavor = flavors[beverage.flavorId]
		const { display: { liquidColor } } = flavor

		const showFull = (model === 'MLobby') || (model === '7100')

		return showFull ? this.renderGlassMaskFull(liquidColor) : this.renderGlassMask(liquidColor);
	}
}

const mapStateToProps = ( state ) => {return {
	brands: state.brands,
	ada: state.ada,
	flavors: state.flavors.flavors,
	model: state.settings.hardware.model
}}

export default connect(mapStateToProps)(FlavorMaskOverlay)
