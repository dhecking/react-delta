

import React from 'react'
import lodash from 'lodash'
import { connect } from 'react-redux'
import Logging from './../../logs'
import actions from './../../actions/'
import { getBundleAssetPath } from '../../utils'
import './../styles/Flavors.css'
import './Brand.css'
import { withRouter } from 'react-router-dom'

import BrandFamily from './../BrandFamily/BrandFamily.js'
import FlavorLogo from './../FlavorLogo/FlavorLogo.js'
import Translation from './../Translation'
import CaloricDisplay from './../CaloricDisplay/CaloricDisplay'
import BackButton from './../BackButton/BackButton'
import CarbResetModal from './../CarbResetModal/CarbResetModal.js'
import FlavorMaskOverlay from './../FlavorMaskOverlay/FlavorMaskOverlay.js'

const Logs = Logging.getLogger('Brands.js')


class Brand extends React.Component {

	startAnimTimer = null
	stopAnimTimer = null
	state = {
		spinning: false
	}

	constructor( props ){
		super()
		this.selectBeverageDebounced = lodash.debounce(
			this.selectBeverage.bind( this ),
			180, { leading: true, trailing: false, maxWait: 180 }
		)
	}

	componentDidMount(){
		// if( !this.props.brands.cmsFetched ) return false
		Logs.debug('Brand page did mount')
		// let bev = this.getDefaultBeverage().refId
		this.props.dispatch( actions.brands.selectBrand({ brand: this.getBrand().refId }))
		this.props.dispatch( actions.timers.update({ hasPoured: false }) )

		this.setLoadTimer()

	}

	componentWillUnmount(){
		clearTimeout( this.startAnimTimer )
		clearTimeout( this.stopAnimTimer )
	}


	setLoadTimer(){
		setTimeout(() => {
			let bev = this.getDefaultBeverage().refId
			this.props.dispatch( actions.brands.selectBeverage({ bev: bev }))
			// Video Manager only enabled for Normal Brands:
			if( !this.isSpecialtyBrand() && !this.isPromotionBrand() ){
				this.props.dispatch( actions.videoManager.enable( this.getBrand().refId ) )
			}
		}, 500)
	}


	UNSAFE_componentWillReceiveProps( nextProps ){
		// If we disable ADA, we should re-route home:
		if( this.props.ada.enabled !== nextProps.ada.enabled ){
			if( nextProps.ada.enabled === false ){
				this.props.history.push('/home')
			}
		}
	}


	beverageChangeAnimation(){
		window.EventBus.emit('video:spinBeverage')
		this.setState({ spinning: false })
		clearTimeout( this.startAnimTimer )
		clearTimeout( this.stopAnimTimer )
		this.startAnimTimer = setTimeout(() => {
			this.setState({ spinning: true })
			this.stopAnimTimer = setTimeout(() => {
				this.setState({ spinning: false })
			}, 1200)
		}, 150)
	}


	getDefaultBeverage(){
		const brand = this.getBrand()
		const bevs = brand.beverages
		const orderedBevs = lodash.sortBy( lodash.values( bevs ), ( bev ) => bev.display.priority )
		let i = lodash.findIndex( orderedBevs, { default: true })
		return orderedBevs[ i ]
	}


	isSpecialtyBrand(){
		return ( this.props.specialtyType === 'specialty' )
	}


	isPromotionBrand(){
		return ( this.props.specialtyType === 'promotion' )
	}

	isWaterBrand(){
		return ( this.props.specialtyType === 'water' )
	}

	getBrand(){
		if( this.isSpecialtyBrand() ) return this.props.brands.specialtyBrands[ this.props.brandId ]
		if( this.isPromotionBrand() ) return this.props.brands.promotions[ this.props.brandId ]
		return this.props.brands.brands[ this.props.brandId ]
	}


	getBev(){
		const brand = this.getBrand()
		return brand.beverages[ this.props.brands.currentBev ]
	}


	renderSRA(brand){
		let langString = lodash.get( brand, 'content.nutrition', null )
		if( !langString ) return null
		return (
			<div className="related">
				<p className="related-title">
					<Translation string={langString} />
				</p>
			</div>
		)
	}

	renderSidebar(isVert){
		const brand = this.getBrand()
		return (
			<div className="sidebar">
				{ this.props.settings.deviceMgmt.config.caloricDisplayEnabled && <CaloricDisplay brand={brand} /> }
				{ this.renderSRA(brand) }
				{ !isVert && this.renderRelatedBrands() }
			</div>
		)
	}


	renderRelatedBrands(){
		const brand = this.getBrand()
		const related = lodash.get( brand, 'relatedBrands', [] )
		if( lodash.isEmpty( related ) ) return null
		let langString = lodash.get( brand, 'brandFamily', 'brandFamilyText.discoverAnotherMemberOfTheFamily.text' )

		return (
			<div className="related">
				<p className="related-title">
					<Translation string={langString} />
				</p>
				<BrandFamily
					family={related}
					orderBase={200}
					brands={this.props.brands.brands}
					layout={this.props.settings.layout}  />
			</div>
		)
	}


	selectBeverage( refId, event ){
		if( refId === this.props.brands.currentBev ) return false
		if( !this.props.ada.enabled ) this.beverageChangeAnimation()
		if( this.props.ada.enabled ){
			this.props.dispatch( actions.ada.setElement( event.currentTarget ) )
		}else{
			this.props.dispatch( actions.brands.selectBrand({ brand: this.getBrand().refId }))
			this.props.dispatch( actions.brands.selectBeverage({ bev: refId }))
		}

	}



	renderGlass(){
		const videoEnabled = this.props.settings.videoEnabled;
		if( videoEnabled || ( this.isSpecialtyBrand() || this.isPromotionBrand() ) ) return null;
		if( this.props.ada.enabled ) return null;
		if( this.isWaterBrand() ) return null;
		const brand = this.getBrand();
		const path = getBundleAssetPath();
		let glassImage = lodash.get(brand.display.background, 'image', '' ) ;
		return (
			<div className="glass-container">
				<img src={`${path}${glassImage}`} className="glass-image" alt=""/>
				<FlavorMaskOverlay />
			</div>
		);
	}


	renderLogo(){
		if( this.props.ada.enabled ) return null
		if ( this.props.specialtyType === "water") return null
		const brand = this.getBrand()
		const bev = this.getBev()
		const flav = lodash.get(bev, 'flavorId', false)
		const path = getBundleAssetPath()
		let label = null

		if( flav && ( !this.isSpecialtyBrand() && !this.isPromotionBrand() ) ){
			const flavObj = this.props.flavors.flavors[ flav ]
			const languageString = lodash.get( flavObj, 'display.languageString', null )
			label = (
				<div className="flavor-label-container">
					<div className="flavor-label">
						<Translation string={languageString} />
					</div>
				</div>
			)
		}

		return (
			<div className="logo-container">
				<div className="logo-box">
					<img src={path + brand.display.logo} className="brand-logo" alt=""/>
				</div>
				{label}
			</div>
		)
	}


	renderBeverage = ( bev, i ) => {
		const brand = this.getBrand()
		const selected = ( `${this.props.brands.currentBev}` === `${bev.refId}` )
		let flavor = null
		if( bev.flavorId ){
			flavor = this.props.flavors.flavors[ bev.flavorId ]
		}
		// const size = this.props.settings.layout.flavor
		return (
			<FlavorLogo
				imgSrc={bev.display.icon}
				onTap={( e ) => this.selectBeverageDebounced( bev.refId, e ) }
				selected={selected}
				animate={false}
				beverage={bev}
				brand={brand}
				ada={this.props.ada.enabled}
				order={bev.priority || i}
				defaultColor={bev.color}
				flavor={flavor}
				model={this.props.settings.hardware.model}
				key={i}
				/>
		)
	}

	renderBeverageList(){
		const brand = this.getBrand()
		const bevs = brand.beverages
		const orderedBevs = lodash.sortBy( lodash.values( bevs ), ( bev ) => bev.display.priority )

		if(this.props.settings.hardware.model === 'MLobby' && orderedBevs.length >= 5) {
			const midPoint = Math.floor(orderedBevs.length/2)
			let row1 = orderedBevs.slice(0, midPoint)
			let row2 = orderedBevs.slice(midPoint)

			return (
				<div className="beverage-list multirow">
					<div className={`row bevs-${row1.length}`} >
						<div className="contents">
							{ lodash.map( row1, this.renderBeverage ) }
						</div>
					</div>
					<div className={`row bevs-${row2.length}`} >
						<div className="contents">
							{ lodash.map( row2, this.renderBeverage ) }
						</div>
					</div>
				</div>
			)

		}

		return (
			<div className={`beverage-list row bevs-${orderedBevs.length}`} >
				<div className="contents">
					{ lodash.map( orderedBevs, this.renderBeverage ) }
				</div>
			</div>
		)
	}



	render(){
		if( !this.props.settings.deviceMgmtFetched ) return false
		if( !this.props.brands.brandsFetched ) return false
		const brand = this.getBrand()

		const path = getBundleAssetPath()

		const isVert = this.props.settings.hardware.model === 'MLobby' // Need a better way to determine orientation

		let classes = ['brand', 'flavors']
		if( this.state.spinning ) classes.push('spinning')
		if( this.isSpecialtyBrand() ) classes.push('specialty-page')
		if( this.isPromotionBrand() ) classes.push('promotion-page')
		if( this.isWaterBrand() ) classes.push('water-page')

		let style = {}
		if( !this.props.ada.enabled ){
			let bgImage = lodash.get( brand, 'display.background.images.default', false )
			if( bgImage ){
				style.backgroundSize = 'cover'
				style.backgroundImage = `url(${path}${bgImage})`
			}
		}

		let toUrl = '/home'
		if( this.isPromotionBrand() ){
			let proms = lodash.filter( this.props.brands.promotions, { visible: true })
			if( proms.length > 1 ){
				toUrl = '/promotions'
			}
		}
		if( this.isSpecialtyBrand() ){
			let proms = lodash.filter( this.props.brands.specialtyBrands, { visible: true })
			if( proms.length > 1 ){
				toUrl = '/specialty'
			}
		}

		return (
			<div style={style} className={classes.join(' ')}>

				<BackButton toUrl={toUrl} />

				{/* RELATED BRANDS / FAMILY */}
				{ this.renderSidebar(isVert) }

				{/* BRAND LOGO */}
				{ this.renderLogo() }

				{/* RENDER BEVERAGES ROW */}
				{ this.renderBeverageList() }

				{/* RENDER GLASS */}
				{ this.renderGlass() }

				<CarbResetModal />

			</div>
		)
	}


}



const mapStateToProps = ( state ) => {
	return {
		ada: state.ada,
		brands: state.brands,
		flavors: state.flavors,
		settings: state.settings,
		languages: state.languages,
	}
}

export default withRouter(connect(mapStateToProps)(Brand))

