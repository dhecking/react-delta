
import lodash from 'lodash'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Logging from './../../logs'
import actions from './../../actions/'
import { getBundleAssetPath } from '../../utils'
import { withRouter } from 'react-router-dom'
import './VideoManager.css'
import FlavorMaskOverlay from './../FlavorMaskOverlay/FlavorMaskOverlay.js'

const Logs = Logging.getLogger('VideoManager.js')




class VideoManager extends Component {

	videoControlMap = {}
	introTimeout = null
	spinTimeout = null
	playTimeout = null

	componentDidMount(){
		window.EventBus.on('video:spinBeverage', this.onSpinEvent.bind( this ))
		window.EventBus.on('video:resetState', this.onResetState.bind( this ))
	}

	getCurrentBrand( refId = this.props.brands.currentBrand ){
		return this.props.brands.brands[ refId ]
	}


	componentDidUpdate( props ){
		Logs.debug('Video manager did update')
		if( props.videoManager.entering !== this.props.videoManager.entering ){
			if( this.props.videoManager.entering ){
				this.enableVideo()
			}
		}
		if( props.videoManager.entered !== this.props.videoManager.entered ){
			if( this.props.videoManager.entered ){
				this.enableLoop()
			}
		}
	}


	onResetState(){
		clearTimeout( this.spinTimeout )
		clearTimeout( this.playTimeout )
		clearTimeout( this.introTimeout )
		const vids = this.getBrandVids()
		try {
			this.stopSpinVideo( this.videoControlMap[ vids.spin ] )
		}catch(e){ }


	}


	onSpinEvent(){
		const vids = this.getBrandVids()
		if( this.videoControlMap[ vids.spin ] ){
			const duration = this.videoControlMap[ vids.spin ].duration
			clearTimeout( this.spinTimeout )
			if( this.props.videoManager.enabled ){
				const calculatedTimer = ( ( duration - .4 ) * 1000 )
				this.spinVideo( this.videoControlMap[ vids.spin ] )
				this.spinTimeout = setTimeout(() => {
					this.stopSpinVideo( this.videoControlMap[ vids.spin ] )
				}, calculatedTimer )
			}
		}
	}


	spinVideo( vid ){
		vid.style.opacity = 1
		vid.style.transform = 'translateY( 0 )'
		vid.currentTime = 0
		vid.play()
	}


	stopSpinVideo( vid ){
		vid.style.transform = ''
		vid.style.opacity = 0
	}


	enableLoop(){
		const vids = this.getBrandVids()
		if( this.videoControlMap[ vids.loop ] ){
			this.videoControlMap[ vids.loop ].loop = true
			this.videoControlMap[ vids.loop ].currentTime = 0
			this.videoControlMap[ vids.loop ].play()
		}
	}


	enableVideo(){
		const vids = this.getBrandVids()
		if( this.videoControlMap[ vids.pour ] ){
			this.videoControlMap[ vids.pour ].currentTime = 0
			clearTimeout( this.introTimeout )
			this.introTimeout = setTimeout(() => {
				this.props.dispatch( actions.videoManager.update({ entered: true }) )
				this.props.dispatch( actions.videoManager.update({ entering: false }) )

				clearTimeout( this.playTimeout )
					this.videoControlMap[ vids.pour ].currentTime = 0
					this.videoControlMap[ vids.pour ].play()
				this.enableLoop()
			}, 200)
		}
	}


	getBrandVids( refId ){
		const brand = this.getCurrentBrand( refId )
		if( !brand ) return false
		let videos = lodash.get( brand, 'display.background.video', {})
		return {
			pour: videos.pourVideo,
			spin: videos.spinVideo,
			loop: videos.loopVideo,
		}
	}


	// Find all the unique video URLS to render so.
	generateVideoMap(){
		return lodash.reject( lodash.uniq( lodash.flatten( lodash.map( this.props.brands.brands, ( brand ) => {
			let vid = lodash.get( brand, 'display.background.video', {} )
			if( !vid ) return []
			return [
				vid.pourVideo, vid.spinVideo, vid.loopVideo
			]
		}) ) ), ( vid ) => lodash.isEmpty( vid ))
	}


	routeCorrect(){
		return lodash.includes( this.props.location.pathname, '/brand/' )
	}


	renderVideo = ( vid, i ) =>{
		let classes = ['vid']
		if( this.routeCorrect() ){
			let vids = this.getBrandVids()
			if( vid === vids.pour ){
				classes.push('pour')
			}else if( vid === vids.loop ){
				classes.push('loop')
			}else if( vid === vids.spin ){
				classes.push('spin')
			}
		}

		const path = getBundleAssetPath()

		return (
			<video
				ref={( c ) => this.videoControlMap[ vid ] = c }
				className={classes.join(' ')}
				src={`${path}${vid}`}
				key={i}
			></video>
		)
	}


	render(){

		let vids = this.generateVideoMap()
		let classes = ['video-box']
		if( this.props.videoManager.enabled ) classes.push('enabled')
		if( this.props.videoManager.entering ) classes.push('entering')
		if( this.props.videoManager.entered ) classes.push('entered')
		if( this.props.videoManager.exiting ) classes.push('exiting')

		if( this.props.ada.enabled ) classes = ['video-box']

		return (
			<div className={classes.join(' ')}>
				{ lodash.map( vids, this.renderVideo ) }

				{ <FlavorMaskOverlay /> }
				{ <FlavorMaskOverlay /> }
			</div>
		)
	}
}



const mapStateToProps = ( state, ownProps ) => {
	return {
		appState: state.appState,
		location: ownProps.location,
		brands: state.brands,
		ada: state.ada,
		settings: state.settings,
		videoManager: state.videoManager,
	}
}

export default withRouter( connect(mapStateToProps)(VideoManager) )





