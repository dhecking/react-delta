import lodash from 'lodash'
import eventemitter3 from 'eventemitter3'


// How often we want to poll performance metrics:
const PERFORMANCE_METRICS_INTERVAL = 5000 // 5 Seconds


// Available Log Levels:
const AVAILABLE_LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR']
const DEFAULT_LOG_LEVEL = 'INFO'
const DEFAULT_APILOG_LEVEL = 'WARNING'


/*
 *  
 *  HOW TO USE:
 *  To use the logging in any file, load in the Logging service into your file and get a bound logging handler:
 *  
 *  	import Logging from './logs'
 *  	const Logs = Logging.getLogger('api.js')
 *  
 *  
 *  Now executing the following: 
 *  
 *  	Logs.info('This is a info message')
 *  
 *  Will log as a info level log, under the name of 'api.js'. Depending on the set log levels, it will be shown in the console and/or 
 *  sent to the API for persistent logging.
 *  
 *  You can pass as many arguments as you like, in any format ( string, number, array/object ), for example:
 *  
 *  	Logs.debug('This is a DEBUG message', { foo: 'bar' }, ['1', '2', '3'])
 *  
 */




class Logging extends eventemitter3 {


	// Set defaults:
	logLevel = (process.env.NODE_ENV === 'development') ? DEFAULT_LOG_LEVEL : 'WARNING'
	apiLogLevel = DEFAULT_APILOG_LEVEL


	// Where we store logs ready to be sent to the API:
	logQueue = []


	// Keep internal metrics
	metrics = {
		logsFailed: 0,
		logsSent: 0
	}



	/**
	 *  Logging service allows for logging to the console and to the Java API. It also allows for changing log levels
	 *  depending on the environment, without having to remove/commentout log calls.
	 *
	 *  We use event emitters/listerns internally to make the logging calls Async so they do not slow down/block running code. Logging
	 *  is secondary to the app and shouldnt affect performance.
	 *  
	 *  @return {Logging} Returns the context of the newly instatiated Logging class, useful for chaining methods.
	 */
	constructor(){
		super()
		this.setLogLevel( DEFAULT_LOG_LEVEL, DEFAULT_APILOG_LEVEL )
		this.addListeners()
		return this
	}



	/**
	 *  Get Bound Logger methods
	 *  @param  {String} logName Name of the logs which will be bound for these helpers. This is usually the name of the file
	 *                           which is logging. This helps with organization and finding logs for specific files.
	 *  @return {Object}         Object with the debug/info/warning/error methods bound and ready for use.
	 */
	getLogger( logName ){
		return {
			debug: this.debug.bind(this, logName),
			info: this.info.bind(this, logName),
			warning: this.warning.bind(this, logName),
			error: this.error.bind(this, logName),
		}
	}



	/**
	 *  Set Log Level
	 *  @param {String} level (INFO, WARNING, ERROR) Log level we want to see and send in the console log.
	 *  @param {String} apiLogLevel (INFO, WARNING, ERROR) Log level we want to send to the API. Defaults to `level` if not set.
	 *  @return {Logging} context of Logging for chaining
	 */
	setLogLevel( level, apiLogLevel ){
		if( !lodash.includes(AVAILABLE_LEVELS, level) ) return new Error(`Level: ${level} is not in the available levels ( ${AVAILABLE_LEVELS.join(' ')} )`)
		if( apiLogLevel && !lodash.includes(AVAILABLE_LEVELS, level) ) return new Error(`API Log Level: ${level} is not in the available levels ( ${AVAILABLE_LEVELS.join(' ')} )`)
		this.logLevel = level
		if( apiLogLevel ) this.apiLogLevel = apiLogLevel
		this.printLogLevels()
		return this
	}



	/**
	 *  Print log levels, pretty self explanatory
	 *  @return {Logging} context of Logging for chaining
	 */
	printLogLevels(){
		this.info('logs.js', 'LOG LEVEL:', this.logLevel)
		this.info('logs.js', 'API LOG LEVEL:', this.apiLogLevel)
		return this
	}



	/**
	 *  Performance Metrics
	 *  @return {Object} Object with key/values of performance metrics
	 */
	getPerformanceMetrics(){
		return {
			// webGLEnabled: ( window.WebGLRenderingContext ),
			memory: {
				totalJSHeapSize: window.performance.memory.totalJSHeapSize,
				usedJSHeapSize: window.performance.memory.usedJSHeapSize,
				jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
			},
			DOMElements: document.getElementsByTagName('*').length,
		}
	}



	/**
	 *  Add Event Listeners for uncaught exceptions which need to be reported.
	 *  @return {Logging} context of Logging for chaining
	 */
	addListeners(){
		this.on('queueMessage', this.queueLogForAPI.bind( this ))
		setInterval(() => {
			let metrics = this.getPerformanceMetrics()
			this.queueLogForAPI('logs.js', 'PERFORMANCE', [ metrics ])
		}, PERFORMANCE_METRICS_INTERVAL)
		// TODO: Not catching errors currently, need to fix:
		window.addEventListener('error', ( evt ) => {
			console.log('Caught unhandled exception', evt)
			evt.preventDefault()
		})
		return this
	}



	/**
	 *  Queue logs for API 
	 *  @param  {String} name Name of the log, usually the file name
	 *  @param  {String} logLevel Log level this will be reported as
	 *  @param  {Array} args     Arguments which were passed to the log method.
	 *  @return {Logging}          context of Logging for chaining
	 */
	queueLogForAPI( name, logLevel, args ){
		args = lodash.map( args, ( arg ) => {
			if( typeof arg === 'string' || typeof arg === 'number' )
				return `- ${arg}`
			return `- ${JSON.stringify( arg )}`
		})
		this.sendToAPI({
			name: name,
			level: logLevel,
			msg: args.join('\n')
		})
		return this
	}



	/**
	 *  Send to API
	 *  @param  {object} log Object containing details for the log ( name, level, msg )
	 *  @return {Promise}     Fetch promise of the API call
	 */
	sendToAPI( log ){
		const { name, level, msg } = log
		let options = { method: 'GET' }
		let url = `/api/logging/debug/log/${encodeURIComponent(name)}/${encodeURIComponent(level)}?msg=${encodeURIComponent(msg)}`
		return fetch(url, options).then(( res ) => {
			// Log was sent successfully
			this.metrics.logsSent++
		}).catch(( err ) => {
			this.metrics.logsFailed++
			console.log('Couldnt send log to API:', err)
		})
	}



	/**
	 *  Argument Mapper
	 *  This converts a navtive argument object into an array, and then maps the name @ index:0
	 *  and the args as the remaining keys.
	 *  @return {Object} Contains name and arguments
	 */
	argMapper(){
		const _args = [].slice.call( arguments )
		const name = _args[0]
		const args = _args.slice(1)
		return { name, args }
	}



	/**
	 *  DEBUG level log method
	 *  This is used for extremely verbose logging of any and all events. This level us used for debugging
	 *  and should not enabled on dispensers by default.
	 *  @params {*} 	Method accepts N number of arguments. If they are not strings/numbers 
	 *          		they will be JSON.stringify'd for sending to the API endpoint.
	 *  @return {Logging} context of Logging for chaining
	 */
	debug(){
		const { name, args } = this.argMapper( ...arguments )
		if( AVAILABLE_LEVELS.indexOf('DEBUG') >= AVAILABLE_LEVELS.indexOf(this.logLevel))
			console.log(`%cDEBUG [${name}]`, 'color: #cccccc;', ...args)
		if( AVAILABLE_LEVELS.indexOf('DEBUG') >= AVAILABLE_LEVELS.indexOf(this.apiLogLevel))
			this.emit('queueMessage', name, 'DEBUG', args)
		return this
	}



	/**
	 *  INFO level log method
	 *  This is used for logging of informative events. This is enabled by default in developer mode.
	 *  @params {*} 	Method accepts N number of arguments. If they are not strings/numbers 
	 *          		they will be JSON.stringify'd for sending to the API endpoint.
	 *  @return {Logging} context of Logging for chaining
	 */
	info(){
		const { name, args } = this.argMapper( ...arguments )
		if( AVAILABLE_LEVELS.indexOf('INFO') >= AVAILABLE_LEVELS.indexOf(this.logLevel))
			console.log(`%cINFO [${name}]`, 'color: #6c5fc7;', ...args)
		if( AVAILABLE_LEVELS.indexOf('INFO') >= AVAILABLE_LEVELS.indexOf(this.apiLogLevel))
			this.emit('queueMessage', name, 'INFO', args)
		return this
	}



	/**
	 *  WARNING level log method
	 *  This is used for warning developers/operators of needed changes. This level us used for important
	 *  messages which need action taken, but does not crash / lock the UI.
	 *  @params {*} 	Method accepts N number of arguments. If they are not strings/numbers 
	 *          		they will be JSON.stringify'd for sending to the API endpoint.
	 *  @return {Logging} context of Logging for chaining
	 */
	warning(){
		const { name, args } = this.argMapper( ...arguments )
		if( AVAILABLE_LEVELS.indexOf('WARNING') >= AVAILABLE_LEVELS.indexOf(this.logLevel))
			console.warn('%cWARNING', 'color: orange;', ...arguments)
		if( AVAILABLE_LEVELS.indexOf('WARNING') >= AVAILABLE_LEVELS.indexOf(this.apiLogLevel))
			this.emit('queueMessage', name, 'WARNING', args)
		return this
	}



	/**
	 *  ERROR level log method
	 *  This is used for critical or fatal events. This is enabled by default on any and all dispensers
	 *  @params {*} 	Method accepts N number of arguments. If they are not strings/numbers 
	 *          		they will be JSON.stringify'd for sending to the API endpoint.
	 *  @return {Logging} context of Logging for chaining
	 */
	error(){
		const { name, args } = this.argMapper( ...arguments )
		console.error('%cERROR', 'color: red;', ...arguments)
		this.emit('queueMessage', name, 'ERROR', args)
		return this
	}


}



// Set this onto the window object so we can easily change the logging
// levels without having to update code / reload browser.
// 
// 		Set the console to DEBUG, and the API to WARNING
// 		- window.Logging.setLogLevel('DEBUG','WARNING')
// 
window.Logging = new Logging()


export default window.Logging

