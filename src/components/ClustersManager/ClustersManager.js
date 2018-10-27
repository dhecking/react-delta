

import React from 'react'
import { connect } from 'react-redux'
import lodash from 'lodash'
import LayoutGroups from './../../layouts/layoutGroups'
import Logging from './../../logs'

const Log = Logging.getLogger('ClustersLayoutManager.js')


// This will be used to generate GPU accelerated scaling instead of
// using width/height sizing.
const INITIAL_LOGO_SIZE = 230


// Hidden button for navigating to NCUI on holding down for X Seconds
class ClustersLayoutManager extends React.Component {


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
				const clusterLayout = this.getAppropriateLayout( cluster, brandsInCluster.length )
				brandsInCluster = lodash.sortBy( brandsInCluster, ( b ) => b.display.priority )

				// Loop through Brands
				return lodash.map( brandsInCluster, ( brand, i ) => {
					let layout = clusterLayout[ i ]
					let scale = ( layout.size / INITIAL_LOGO_SIZE )
					let brandStyle = `.hw-${model} .${group.name} .logo-${brand.refId} { \n`
						brandStyle +=   `transform: translate( ${layout.left}px, ${layout.top}px ) scale( 1, 1 ); \n`
						brandStyle +=   `width: ${layout.size}px; \n`
						brandStyle +=   `height: ${layout.size}px; \n`
						brandStyle +=   `opacity: 1; \n`
						brandStyle += `}\n`
					return brandStyle
				}).join('\n')

			}).join('\n')

		}).join('\n')

		// this.injectStylesIntoPage( generatedStyleMap )
		return generatedStyleMap
	}


	getAppropriateLayout( cluster, numberOfBrands ){
		console.log(cluster, numberOfBrands)
		let LG = LayoutGroups[ this.props.settings.hardware.model ]
		if( cluster === 'top-cluster' ){
			if( numberOfBrands <= 1 ) return LG.top.top1
			if( numberOfBrands <= 2 ) return LG.top.top2
			if( numberOfBrands <= 3 ) return LG.top.top3
			if( numberOfBrands <= 4 ) return LG.top.top4
			if( numberOfBrands <= 5 ) return LG.top.top5
			if( numberOfBrands <= 6 ) return LG.top.top6
			if( numberOfBrands <= 7 ) return LG.top.top7
			if( numberOfBrands <= 8 ) return LG.top.top8
			if( numberOfBrands <= 9 ) return LG.top.top9
			if( numberOfBrands <= 10 ) return LG.top.top10
			if( numberOfBrands <= 11 ) return LG.top.top11
			return LG.top.top12
		}
		if( cluster === 'left-cluster' ){
			if( numberOfBrands <= 1 ) return LG.left.left1
			if( numberOfBrands <= 2 ) return LG.left.left2
			if( numberOfBrands <= 3 ) return LG.left.left3
			if( numberOfBrands <= 4 ) return LG.left.left4
			if( numberOfBrands <= 5 ) return LG.left.left5
			if( numberOfBrands <= 6 ) return LG.left.left6
			return LG.left.left7
		}
		if( cluster === 'right-cluster' ){
			if( numberOfBrands <= 1 ) return LG.right.right1
			if( numberOfBrands <= 2 ) return LG.right.right2
			if( numberOfBrands <= 3 ) return LG.right.right3
			if( numberOfBrands <= 4 ) return LG.right.right4
			if( numberOfBrands <= 5 ) return LG.right.right5
			if( numberOfBrands <= 6 ) return LG.right.right6
			return LG.right.right7
		}
		if( cluster === 'bottom-cluster' ){
			if( numberOfBrands <= 1 ) return LG.center.center1
			if( numberOfBrands <= 2 ) return LG.center.center2
			if( numberOfBrands <= 3 ) return LG.center.center3
			if( numberOfBrands <= 4 ) return LG.center.center4
			if( numberOfBrands <= 5 ) return LG.center.center5
			if( numberOfBrands <= 6 ) return LG.center.center6
			if( numberOfBrands <= 7 ) return LG.center.center7
			return LG.center.center8
		}
		if( cluster === 'water' ){
			return LG.water
		}
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

export default connect(mapStateToProps)(ClustersLayoutManager)

