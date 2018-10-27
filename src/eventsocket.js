

import Logging from './logs'
import actions from './actions/'

const Logs = Logging.getLogger('eventsocket.js')
const wsUrl = `ws://${window.location.host}/events`


export default class EventSocket {
	eventListeners = {}
	sendQueue = []
	isConnected = false
	isReconnecting = false
	reconnectAttempts = 0


	constructor( params ){
		this.dispatch = params.dispatch
		this.init()
	}

	init(){
		this.websocket = new WebSocket(wsUrl)
		this.websocket.onopen = this.handleOpen
		this.websocket.onmessage = this.handleMessage
		this.websocket.onclose = this.handleClose
	}

	handleOpen = () => {
		Logs.info('EventSocket connected')
		if (this.isReconnecting) window.location.reload()
		else {
			this.isConnected = true
			this.reconnectAttempts = 0
			if (this.reconnectInterval) clearInterval(this.reconnectInterval)
			while (this.sendQueue.length > 0) {
				this.websocket.send(this.sendQueue.pop())
			}
		}
	}

	/*
		Example websocket message:
		`topic:/dispenser/broker/session
		topic:/dispenser/broker/test

		{"sessionId":4}`
	*/
	parseSocketMessage(data) {
		const [headersString, msg] = data.split(/\n\n/)
		const headers = headersString.split(/\n/)
		return [headers, JSON.parse(msg)]
	}

	handleMessage = (evt) => {
		const [ headers, data ] = this.parseSocketMessage(evt.data)
		// Dispatch event for reducers to act upon:
		this.dispatch( actions.sockets.event({
			headers: headers,
			data: data
		}))
	}

	handleClose = () => {
		let attempts = this.reconnectAttempts + 1
		const time = Math.min(30, (attempts * 2)) * 1000
		Logs.info(`EventSocket disconnected, attempting reconnect in ${time}ms (try #${attempts})`)
		this.dispatch( actions.sockets.closed() )
		this.isReconnecting = true
		this.reconnectInterval = setTimeout(() => {
			this.reconnectAttempts += 1
			this.init()
		}, time)
	}

	subscribe(msgPath) {
		this.send(`subscribe:${msgPath}`)
	}

	removeListener(msgPath, listener) {
		if (this.eventListeners[msgPath]) {
			const index = this.eventListeners[msgPath].indexOf(listener)
			if (index >= 0) {
				this.eventListeners[msgPath].splice(index, 1)
				this.eventListeners[msgPath].length === 0 && delete this.eventListeners[msgPath]
			}
		}
	}

	send( data ){
		if (!this.isConnected) {
			this.sendQueue.push(data)
		} else {
			this.websocket.send(data)
		}
	}

}
