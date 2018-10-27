

import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import './CarbResetModal.css'

const ESTIMATED_TIMEOUT = 10

class CarbResetModal extends PureComponent {

	rotateInterval = null
	state = {
		enabled: false,
		angle: 0
	}

	componentWillUnmount(){
		clearInterval( this.rotateInterval )
	}

	componentDidUpdate( props ){
		const { hasCarbUsageTrouble } = this.props.settings
		console.log('CarbResetModal Received Props', hasCarbUsageTrouble, props.settings.hasCarbUsageTrouble)
		if( hasCarbUsageTrouble !== this.state.enabled ){
			console.log('carb trouble changed....')
			this.rotate()
			this.setState({
				angle: 0,
				enabled: hasCarbUsageTrouble
			})
			if( hasCarbUsageTrouble === false ){
				clearInterval( this.rotateInterval )
			}
		}
	}

	rotate(){
		const increment = 360 / ESTIMATED_TIMEOUT
		const fn = () => {
			console.log('angle', this.state.angle)
			if (Math.ceil(this.state.angle) >= 1359) clearInterval( this.rotateInterval )
			this.setState({ angle: ( this.state.angle + increment ) })
		}
		fn()
		this.rotateInterval = setInterval(fn, 1000)
	}

	onClick( e ){
		e.preventDefault()
		console.log('clicked overlay...')
	}

	render(){
		if( !this.state.enabled ) return null
		let style = {
			transform: `rotate(${this.state.angle}deg)`
		}
		return (
			<div className="carb-reset timeout">
				<div className="overlay" onClick={( e )=>this.onClick( e )}></div>
				<div className="outer">
					<div className="inner">
						<div className="bg">
							<div className="text">
								<div className="title">Recharging</div>
								<div className="subtitle">Please wait...</div>
							</div>
							<div className="tip" style={style}></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

}


const mapStateToProps = ( state ) => {
	return {
		settings: state.settings,
		timers: state.timers,
	}
}

export default connect(mapStateToProps)(CarbResetModal)

