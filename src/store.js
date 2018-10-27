
import { createStore, applyMiddleware, combineReducers, compose } from 'redux'
import reducers from './reducers/index.js'
import thunk from 'redux-thunk'

import api from './api'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  combineReducers({ ...reducers }),
  composeEnhancers(applyMiddleware(thunk.withExtraArgument(api)))
)

export default store
