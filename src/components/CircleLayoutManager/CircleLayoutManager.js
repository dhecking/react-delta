import React from 'react'
import { connect } from 'react-redux'
import lodash from 'lodash'
import { Link } from 'react-router-dom'

import LayoutGroups from './../../layouts/layoutGroups'
import Layer from '../_base/Layer'
import Circle from '../_base/Circle'


import Logging from './../../logs'

const Log = Logging.getLogger('ClustersLayoutManager.js')

// const COKE_GROUP_ID = '168426'
// const WATER_GROUP_ID = '168A65'

// This will be used to generate GPU accelerated scaling instead of
// using width/height sizing.
// const INITIAL_LOGO_SIZE = 230

class CircleLayoutManager extends React.Component {

	componentDidMount(){
		Log.debug('Cluster Layout Manager did mount')
		// this.getAppropriateLayout()
	}

	generateIconLayers(){
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
		return brandLayers
	}

	getAppropriateLayout( cluster, numberOfBrands ){
		let LG = LayoutGroups[ this.props.settings.hardware.model ]
		if( cluster === 'center' ) return LG.center

		if( cluster === 'inner' ){
			if( numberOfBrands <= 1 ) return LG.inner.inner1
			if( numberOfBrands <= 2 ) return LG.inner.inner2
			if( numberOfBrands <= 3 ) return LG.inner.inner3
			if( numberOfBrands <= 4 ) return LG.inner.inner4
			if( numberOfBrands <= 5 ) return LG.inner.inner5
			if( numberOfBrands <= 6 ) return LG.inner.inner6
			if( numberOfBrands <= 7 ) return LG.inner.inner7
			return LG.center.center8
		}
		if( cluster === 'water' ) return LG.water
	}

	render() {
		const layers = this.generateIconLayers()
		return (
			<div>
				<div className="cluster">
					{
						//this.props.appLoading && <div className="la-ball-clip-rotate la-2x"><div></div></div>
					}
					{
						//!this.props.loadinGroups && this.props.groups.length === 0 && <h1>No available beverages.</h1>
					}

					<h1>TESTING</h1>

					{ layers && layers.center &&
						<Layer
							index={0}
							groups={layers['center']}
							offset={0} />
					}

					{ layers && layers.inner &&
						<Layer
							index={0}
							groups={layers['inner']}
							offset={0} />
					}

					{ layers && layers.outer &&
						<Layer
							index={0}
							groups={layers['outer']}
							offset={0} />
					}
				</div>

				{
				// <Link to="/ce" className="ce hidden" />
				// <div className="water">
				// 	{ this.water && <Circle size={160} group={this.water} /> }
				// </div>
				}
			</div>
		)
	}
}

const mapStateToProps = (store)=> {
	return ({
    groups: 		store.groups,
    beverages: 	store.beverages,
		appLoading: store.appLoading,
		brands: 		store.brands,
		iconGroups: store.iconGroups,
		settings: 	store.settings,
})
}

export default connect(mapStateToProps)(CircleLayoutManager)
