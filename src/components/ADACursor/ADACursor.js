


import React, { Component } from 'react'
import lodash from 'lodash'
import actions from './../../actions/'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import './ADACursor.css'

const PAD = 12

class ADACursor extends Component {

	resetTimer = null

	hasBeverageSelected(){
		if( this.props.ada.currentElement ){
			let bev = this.props.ada.currentElement.getAttribute('ada-beverage')
			if( bev ) return bev
		}
		return false
	}

	componentDidUpdate( oldProps ){
		if( this.props.ada.enabled !== oldProps.ada.enabled ){
			console.log('enable changed', this.props)
			if( this.props.ada.enabled ){

				// If we are on the ambient page, we need to nav to /home screen:
				if( this.props.location.pathname === "/" ){
					return this.props.history.push('/home')
				}

				window.__FS__DISBLE_TOUCH = true
				clearTimeout( this.resetTimer )
				this.props.dispatch( actions.ada.update({ currentElement: null }) )
				this.resetTimer = setTimeout(() => {
					window.__FS__DISBLE_TOUCH = false
					this.props.dispatch( actions.ada.reset() )
				}, 800 )
			}
		}
		if( this.props.ada.currentElement !== oldProps.ada.currentElement ){
			let bev = this.hasBeverageSelected()
			if( bev ){
				this.props.dispatch( actions.brands.selectBeverage({ bev: bev }))
			}else{
				this.props.dispatch( actions.brands.clearBeverage() )
			}
		}
		if( this.props.ada.pressing !== oldProps.ada.pressing ){
			console.log('Pressing:', this.props.ada.pressing)
			let bev = this.hasBeverageSelected()
			if( bev ){
				if( this.props.ada.pressing ){
					this.props.dispatch( actions.brands.startPour() )
				}else{
					this.props.dispatch( actions.brands.stopPour() )
				}
			}
		}
		if( this.props.ada.lastTouch !== oldProps.ada.lastTouch ){
			let bev = this.hasBeverageSelected()
			if( !bev ){
				if( !lodash.isEmpty( this.props.ada.currentElement ) ){
					setTimeout(() => {
						this.props.ada.currentElement.click()
					}, 100)
				}
			}
		}
	}

	render () {
		const ada = this.props.ada
		if( !ada.enabled ) return false
		let style = {}
		if( !ada.currentElement ){
			style = {
				left: 0,
				top: 0,
				width: 1000,
				height: 1000,
				opacity: 1,
				backgroundColor: "#222",
				transform: 'scale(3.5,3.5)',
			}
		}else{
			const ele = ada.currentElement
			const box = ele.getBoundingClientRect()
			const width = ele.clientWidth + ( PAD * 2 )
			const height = ele.clientHeight + ( PAD * 2 )
			style = {
				left: box.left - PAD,
				top: box.top - PAD,
				width: width,
				height: height,
				borderRadius: height
			}
		}


		return (
			<div style={style} className="ada-cursor"></div>
		)
	}
}



const mapStateToProps = ( state ) => {
	return {
		ada: state.ada,
		settings: state.settings,
	}
}

export default withRouter(connect(mapStateToProps)(ADACursor))
