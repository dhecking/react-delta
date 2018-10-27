

import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import lodash from 'lodash'
import classnames from 'classnames'

import Attract from './../Attract/Attract'

import customerInteractionIndicator from '../../assets/images/customer_interaction_indicator.png'

import Logo from './../Logo/Logo.js'
import BrandLoop from './../BrandLoop/BrandLoop'

import Layer from '../_base/Layer'

import ADALang from './../ADALang/ADALang'
import ToNCUIEgg from './../NCUIegg'
import Filters from './../Filters/Filters'

import actions from './../../actions/'
import Logging from './../../logs'
import './Home.css'
const Log = Logging.getLogger('Home.js')



class Home extends React.Component {

	componentDidMount(){
		Log.debug('Home did mount')
		this.props.dispatch( actions.brands.clearBeverage() )
		this.props.dispatch( actions.iconGroups.update({ current: 0 }) )
		window.EventBus.emit('video:resetState')
		this.props.dispatch( actions.videoManager.reset() )
	}


	renderBrand( forceADA, brand, i ){
		let url = `/brand/${brand.refId}`
		if( brand.isWater ) url += '/water'
		let adaPriorityBase = 600
		let adaEnabled = "enabled"

		if( brand.display.cluster === 'top-cluster' ){
			adaPriorityBase = 200
		}
		if( brand.display.cluster === 'left-cluster' ){
			adaPriorityBase = 400
		}
		if( brand.display.cluster === 'right-cluster' ){
			adaPriorityBase = 300
		}
		if( brand.display.cluster === 'bottom-cluster' ){
			adaPriorityBase = 100
		}

		if( brand.display.cluster === 'water' ){
			adaEnabled = "disabled"
			adaPriorityBase = 900
		}
		if( forceADA ) adaEnabled = "enabled"

		let style = {
			order: ( adaPriorityBase + brand.display.priority )
		}

		return (
			<Link className={brand.display.cluster} style={style} to={url} key={i}>
				<Logo
					id={brand.refId}
					adaEnabled={adaEnabled}
					order={style.order}
					imgSrc={brand.display.icon}
					available={brand.available}
				/>
			</Link>
		)
	}


	getBrands( filter, brands ){
		return lodash.filter( lodash.values( brands ), filter )
	}

	renderLayers() {
		if( !this.props.brands.brandsFetched ) return false
		const clusters = [ 'center', 'inner', 'outer', 'water' ]
		const iconGroups = this.props.iconGroups.groups

		const brandLayers = {}
		// Loop through Icon Groups / Filters:
		lodash.map( iconGroups, ( group ) => {
			let brandsInGroup = lodash.map( group.brands, ( brandId ) => lodash.get( this.props.brands.brands, brandId, null ))
			// Loop through Clusters
			lodash.map( clusters, ( cluster ) => {
				let brandsInCluster = lodash.filter( brandsInGroup, ( b ) => ( b.display.cluster === cluster && b.visible ) )

				if(brandsInCluster.length) {
					brandLayers[cluster] = lodash.sortBy( brandsInCluster, ( b ) => b.display.priority )
				}
			})
		})

		return (
			<div>
				{ brandLayers['center'] && <Layer index={0} groups={brandLayers['center']} offset={0} /> }
				{ brandLayers['inner']  && <Layer index={1} groups={brandLayers['inner']}  offset={0} /> }
				{ brandLayers['outer']  && <Layer index={2} groups={brandLayers['outer']}  offset={0} /> }
				{ brandLayers['water']  &&
					brandLayers['water'].map(function(brand, i){
						const style = { order: 900 }
						return (
							<Link className={brand.display.cluster} style={style} to={'/brand/water'} key={i}>
								<Logo
									id={brand.refId}
									adaEnabled={false}
									order={ style.order }
									imgSrc={brand.display.icon}
									available={brand.available}
								/>
							</Link>
						);
					})
				}
			</div>
		)
	}

	renderSpecialty(){
		if( this.props.brands.specialtyBrands.length < 1 ) return null
		return (
			<div className="specialty-brands">
				<BrandLoop
					brands={this.getBrands({ visible: true }, this.props.brands.specialtyBrands)}
					interval={2000}
					orderBase={700}
					selectionPage={'/specialty'}
					type={"specialty"}
					adaText={"featured drinks"}
					/>
			</div>
		)
	}


	renderPromotions(){
		if( !this.props.settings.deviceMgmt.details.promosEnabled ) return null
		if( this.props.brands.promotions.length < 1 ) return null
		return (
			<div className="promotional-brands">
				<BrandLoop
					brands={this.getBrands({ visible: true }, this.props.brands.promotions)}
					interval={2000}
					orderBase={800}
					selectionPage={'/promotions'}
					type={"promotion"}
					adaText={"promos"}
					/>
			</div>
		)
	}


	render() {
		const currentFilter = lodash.get(this.props.iconGroups, 'currentObj', this.props.iconGroups.groups[0])
		const isVert = this.props.settings.hardware.model === 'MLobby' // Need a better way to determine orientation
		const isCluster = true // Temp hardcoded value
		let classes = classnames(
			`layout_${(isCluster)? 'cluster': 'circle'}`,
			[ currentFilter.name ]
		)
		const troubles = this.props.settings.hasTroubles
		const isClusters = true

		return (
			<div className="home">
				{ isVert && <Attract attractType={'ambient'} settings={this.props.settings} /> }
				<ADALang />
				<div className={classes}>

					{/* RENDER BRANDS */}
					{	isClusters &&
						lodash.map( this.getBrands({ visible: true }, this.props.brands.brands), this.renderBrand.bind( this, false ) )
					}

					{	!isClusters &&
						this.renderLayers( lodash.map( this.getBrands({ visible: true }, this.props.brands.brands) ))
					}

					{/* FILTER TABS */}
					<Filters />

					{/* HIDDEN NCUI EGG */}
					<ToNCUIEgg />

					<div className="bottom-row">

						{/* SPECIALTY BRANDS: */}
						{ this.renderSpecialty() }

						{/* PROMOTIONS BRANDS: */}
						{ this.renderPromotions() }

						<div className="water-brand">
							<div className="brand-loop">
								<div className="brands">
									{/* RENDER WATER FOR ADA */}
									{ lodash.map( this.getBrands({ visible: true, display: { cluster: 'water' } }, this.props.brands.brands), this.renderBrand.bind( this, true ) ) }
								</div>
							</div>
						</div>

					</div>

					{ troubles && <img className="cii" src={customerInteractionIndicator} alt="" /> }

				</div>

			</div>
		)
	}

}





const mapStateToProps = ( state ) => {
	return {
		brands: state.brands,
		languages: state.languages,
		iconGroups: state.iconGroups,
		settings: state.settings,
	}
}

export default connect(mapStateToProps)(Home)

