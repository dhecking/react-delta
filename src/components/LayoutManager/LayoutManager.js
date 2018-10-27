

import React from 'react'
import { connect } from 'react-redux'
import lodash from 'lodash'
import LayoutGroups from './../../layouts/layoutGroups'
import Logging from './../../logs'

import './LayoutManager.css'

const Log = Logging.getLogger('LayoutManager.js')

// Hidden button for navigating to NCUI on holding down for X Seconds
class LayoutManager extends React.Component {

	componentDidMount(){
		Log.debug('Layout Manager did mount')
		this.genIconPositionStyles()
	}


	/**
	 *  Generate Icon Position Styles
	 *  This goes through each "tab" of beverages and generates the positions of them in
	 *  css to be injected (once) into the page, letting the browser handle the positioning
	 *  and transitions between the tabs without having to re-render icons between "tabs".
	 *
	 *  @return {Cluster} Returns context of cluster for chaining methods.
	 */
	genIconPositionStyles(){
		if( !this.props.brands.brandsFetched ) return false
		const clusters = [ 'top-cluster', 'left-cluster', 'right-cluster', 'bottom-cluster', 'water' ]
		const model = this.props.settings.hardware.model
		const iconGroups = this.props.iconGroups.groups

		// Loop through Icon Groups / Filters:
		let generatedStyleMap = lodash.map( iconGroups, ( group ) => {
			let brandsInGroup = lodash.map( group.brands, ( brandId ) => lodash.get( this.props.brands.brands, brandId, null ))

			// Loop through Clusters
			return lodash.map( clusters, ( cluster ) => {

				let brandsInCluster = lodash.filter( brandsInGroup, ( b ) => ( b.display.cluster === cluster && b.visible ) )
				const LG = LayoutGroups[ this.props.settings.hardware.model ]

				let clusterType = cluster.substring(0, cluster.indexOf('-cluster'))
				if(clusterType === 'bottom') clusterType = 'center'

				const clusterMax = !!clusterType ? Object.keys(LG[clusterType]).length : 1
				const clusterLayout = this.getAppropriateLayout( LG, cluster, clusterType, clusterMax, brandsInCluster.length )
				brandsInCluster = lodash.sortBy( brandsInCluster, ( b ) => b.display.priority )

				// Loop through Brands
				return lodash.map( brandsInCluster, ( brand, i ) => {
					let brandStyle = ''
					if (i < clusterMax && !!clusterLayout) {
						let layout = clusterLayout[ i ]

						brandStyle = `.hw-${model} .${group.name} .logo-${brand.refId} { \n`
						brandStyle +=   `transform: translate( ${layout.left}px, ${layout.top}px ) scale( 1, 1 ); \n`
						brandStyle +=   `width: ${layout.size}px; \n`
						brandStyle +=   `height: ${layout.size}px; \n`
						brandStyle +=   `opacity: 1; \n`
						brandStyle += `}\n`
					}
					return brandStyle
				}).join('\n')

			}).join('\n')

		}).join('\n')

		// this.injectStylesIntoPage( generatedStyleMap )
		return generatedStyleMap
	}


	getAppropriateLayout( LG, cluster, clusterType, clusterMax, numberOfBrands ){
		if( cluster === 'water' ){
			return LG.water
		}

		if( numberOfBrands > clusterMax) return LG[clusterType][`${clusterType}${clusterMax}`]
		return LG[clusterType][`${clusterType}${numberOfBrands}`]
	}


	render(){
		return (
			<style>
				{this.genIconPositionStyles()}
			</style>
		)
	}

}


const mapStateToProps = ( state ) => {
	return {
		brands: state.brands,
		iconGroups: state.iconGroups,
		settings: state.settings,
	}
}

export default connect(mapStateToProps)(LayoutManager)

