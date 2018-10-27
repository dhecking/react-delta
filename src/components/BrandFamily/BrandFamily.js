


import React, { PureComponent } from 'react'
import lodash from 'lodash'
import { Link } from 'react-router-dom'
import Logo from './../Logo/Logo.js'

import './BrandFamily.css'



class BrandFamily extends PureComponent {

	getBrand( refId ){
		return this.props.brands[ refId ]
	}

	renderBrand( brand, i ){
		brand = this.getBrand( brand )
		if( !brand || !brand.visible ) return null
		// const { layout } = this.props
		// const familyStyle = layout.family
		const onTap = this.props.onTap
		return (
			<Link to={`/brand/${brand.refId}`} key={i}>
				<Logo
					id={brand.refId}
					order={this.props.orderBase+i}
					imgSrc={brand.display.icon}
					available={brand.available}
					onTap={ ( e ) => {
						if( onTap ) onTap( brand, e )
					}}
					/>
			</Link>
		)
	}

	render(){
		const { family } = this.props
		return (
			<div className="row">
				{ lodash.map( lodash.values( family ), this.renderBrand.bind( this ))}
			</div>
		)
	}
}

export default BrandFamily
