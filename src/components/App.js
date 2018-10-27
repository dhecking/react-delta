

import React from 'react'
import lodash from 'lodash'
import { HashRouter as Router, Route, Redirect, Switch } from "react-router-dom"
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'

import './styles/App.css'

import actions from '../actions/index'

import IdleScreens    				from './IdleScreen/IdleScreen.js'
import Brand        					from './Brand/Brand.js'
import Home           				from './Home/Home.js'
import VideoManager   				from './VideoManager/VideoManager.js'
import TTP            				from './TTP/TTP'
import Logging        				from '../logs'
import LanguageSelection    	from './LanguageSelection/LanguageSelection.js'
import LayoutManager 		from './LayoutManager/LayoutManager.js'
import CategorySelection 			from './CategorySelection/CategorySelection.js'
import ADACursor 							from './ADACursor/ADACursor'
import ADAClose 							from './ADAClose/ADAClose'
import Timers 								from './Timers/Timers'
import EventEmitter 					from 'eventemitter3'
import EventSocket 						from './../eventsocket'

window.es = {}


export const APPLICATION_INITIALIZING = 'APPLICATION_INITIALIZING'
export const APPLICATION_INITIALIZATION_COMPLETE = 'APPLICATION_INITIALIZATION_COMPLETE'


const WEBSOCKET_LISTENER = [
	'/dispenser/beverages/availability',
	'/dispenser/select-and-pour',
	'/dispenser/trouble',
	'/dispenser/state',
	'/dispenser/ada',
]


const Logs = Logging.getLogger('App.js')
window.EventBus = new EventEmitter()

const ADA_DEBOUNCE = 200 // max 1 ada event per 200ms


class App extends React.Component {

	constructor( props ){
		super()

		const modelStr = process.env.REACT_APP_MODEL

		props.dispatch({ type: APPLICATION_INITIALIZING })
		props.dispatch( actions.settings.fetchCMSJSON(modelStr) )
		props.dispatch( actions.settings.fetchTroubles() )
		window.es = new EventSocket({ dispatch: props.dispatch })
		// window.addEventListener('beforeunload', () => {
		// 	const { activeFuture } = getState().appState
		// 	if (activeFuture) api.cancelFutureSync(activeFuture)
		// })
		// Tell the API which websocket events we want emitted:
		lodash.each( WEBSOCKET_LISTENER, window.es.subscribe.bind( window.es ) )
		props.dispatch({ type: APPLICATION_INITIALIZATION_COMPLETE })

		this.state = {}
	}

	componentDidMount(){
		if( process.env.NODE_ENV === 'development' ) this.ADADebugControls()
	}


	ADADebugControls(){
		let isTouching = false
		let ops = { leading: true, trailing: false, maxWait: ADA_DEBOUNCE }
		let debounced = lodash.debounce(( dir ) => {
			this.props.dispatch({ type: 'ADA_INTERFACE_EVENT', payload: { type: dir } })
		}, ADA_DEBOUNCE, ops )
		window.onkeydown = function( evt ){
			Logs.debug('key down:', evt.keyCode)
			// SHIFT + A : Toggle ADA
			if( evt.shiftKey && evt.keyCode === 65 ){
				this.props.dispatch( actions.ada.update({
					enabled: ( !this.props.ada.enabled )
				}))
			}
			if( this.props.ada.enabled ){
				if( evt.keyCode === 37 ) debounced('left')
				if( evt.keyCode === 39 ) debounced('right')
				if( evt.keyCode === 32 && !isTouching ){
					isTouching = true
					debounced('touch')
				}
			}
		}.bind( this )
		window.onkeyup = function( evt ){
			Logs.debug('key up:', evt.keyCode)
			if( this.props.ada.enabled ){
				if( evt.keyCode === 32 && isTouching ){
					isTouching = false
					this.props.dispatch({ type: 'ADA_INTERFACE_EVENT', payload: { type: 'release' } })
				}
			}
		}.bind( this )
	}


	static getDerivedStateFromProps(nextProps, nextState) {
		console.log('APP PROPS: ',nextProps)
		return nextState
	}


	render(){

		// Wait until CMS data and brand availability has been fetched before
		// rendering any contents:
		if(
			!this.props.settings.cmsFetched ||
			!this.props.brands.cmsFetched ||
			!this.props.brands.brandsFetched ){
			return null
		}

		const model = lodash.get( this.props.settings, 'hardware.model', '9100' )
		const videoEnabled = lodash.get ( this.props.settings, 'videoEnabled', true)
		const isVert = model === 'MLobby' /// Need a better way to determine orientation

		let isTTPEnabled = lodash.get( this.props.settings, 'hardware.meta.ttpEnabled', false )
		if( window.outerHeight <= 1080 ) isTTPEnabled = false
		let classes = `app hw-${model}`
		if( isVert) classes += ' vertical'
		if( this.props.ada.enabled ){
			classes += ' ada'
		}else{
			classes += ' non-ada'
		}

		const isClusters = true

		return (
			<div className={classes}>

				{/* Layout manager for cluster styling: */}
				{ isClusters && <LayoutManager />}
				<Router>
					<div>
					<Route render={({ location }) => {
						return (
							<div>
								<ADAClose />
								{ videoEnabled && <VideoManager />}
								{/* ADA Visual Cursor: */}
								<ADACursor />
								{/* Timeouts and Idle actions: */}
								<Timers location={location} />
							</div>
						)
					}} />
					<Route
						render={({ location }) => (
						<TransitionGroup component={null}>
							<CSSTransition
								key={window.location.hash}
								classNames="route-trans"
								timeout={500}
								onEntering={ () => {
									window.__FS__DISBLE_TOUCH = true
								}}
								onEntered={ () => {
									if( this.props.ada.enabled ){
										return setTimeout(() => {
											window.__FS__DISBLE_TOUCH = false
											this.props.dispatch( actions.ada.reset() )
										}, 400)
									}
									window.__FS__DISBLE_TOUCH = false
								}}
								onExiting={ () => {
									window.__FS__DISBLE_TOUCH = true
								}}
								onExited={ () => {
									if( this.props.ada.enabled ){
										return setTimeout(() => {
											window.__FS__DISBLE_TOUCH = false
											this.props.dispatch( actions.ada.reset() )
										}, 400)
									}
									window.__FS__DISBLE_TOUCH = false
								}}
								appear
								enter
								exit >
								<div className="layout">
								<Switch location={location}>

									{ /* Empty Route: */ }
									<Route key={isVert ? "home" : "idle"} exact path="/" render={ () => {
										return ( isVert ? <Redirect to="/home"/> : <IdleScreens /> )
									}} />

									{ /* Home Route ( default ) */ }
									<Route key={"home"} exact path="/home" render={ () => (
										<Home />
									)} />


									{ /* Brand Page */ }
									<Route key={"brand"} path="/brand/:refId/:specialtyType?" render={ ({match: { params : { refId, specialtyType }}}) => {
										return ( <Brand brandId={ refId } specialtyType={ specialtyType } /> )
									}} />


									{ /* Specialty */ }
									<Route key={"specialty_select"} exact path={`/specialty`} render={ () => {
										return (
											<CategorySelection type={'specialty'} languageObj={this.props.brands.specialtyBrandsSelection || this.props.brands.promotionSelection} brands={ lodash.filter( lodash.values( this.props.brands.specialtyBrands ), { visible: true} ) } />
										)
									}} />


									{ /* Promotions */ }
									<Route key={"promotions_select"} exact path={`/promotions`} render={ () => {
										return (
											<CategorySelection type={'promotion'} languageObj={this.props.brands.promotionSelection} brands={ lodash.filter( lodash.values( this.props.brands.promotions ), { visible: true} )} />
										)
									}} />


									{ /* Language Selection Page */ }
									<Route key={"language"} exact path={`/languages`} render={ () => {
										return ( <LanguageSelection /> )
									}} />


								</Switch>
								</div>
							</CSSTransition>

							{ isTTPEnabled && (
								<TTP
									idle={location.pathname === '/home'}
									location={location}
									{...this.props.appState}
								/>
							)}

							</TransitionGroup>

							)}/>

						</div>

					</Router>

			</div>
		);
	}

}



const mapStateToProps = ( state ) => {
	return {
		brands: state.brands,
		ada: state.ada,
		languages: state.languages,
		iconGroups: state.iconGroups,
		settings: state.settings,
	}
}

export default connect(mapStateToProps)(App)

