

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Logging from './logs'
import App from './components/App'
import store from './store'

// Font Awesome:
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft, faTimes } from '@fortawesome/free-solid-svg-icons'

import './index.css'

// SOLID
library.add( faAngleLeft, faTimes )

console.log('APP BUILT:', process.env.REACT_APP_TIMESTAMP)
const Logs = Logging.getLogger('index.js')

window.addEventListener("contextmenu", ( e ) => e.preventDefault() )

console.log('ENV VARS:', process.env)

ReactDOM.render(
	<Provider store={store}>
			<App />
	</Provider>,
	document.getElementById('root')
)

Logs.info('App loaded')
