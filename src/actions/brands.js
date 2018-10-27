

import api from './../api'

export function refreshAvailability( data ){
	return ( dispatch ) => {
		return api.fetchAvailabilities().then(( beverages ) => {
			return dispatch({ type: 'UPDATE_BEV_AVAIL', payload: beverages })
		})
	}
}

export function update( data ){
	return { type: 'UPDATE_BRANDS', payload: data }
}

export function selectBrand( data ){
	return { type: 'SELECT_BRAND', payload: data }
}

export function startPour(){
	return ( dispatch ) => {
		return api.startPour( )
	}
}

export function stopPour(){
	return ( dispatch ) => {
		return api.stopPour( )
	}
}

export function selectBeverage( data ){
	return ( dispatch ) => {
		return api.setBeverage( data.bev ).then(() => {
			return getBeverageCalories()( dispatch )
		})
	}
}

export function getBeverageCalories(){
	return ( dispatch ) => {
		return api.fetchCurrentBeverageCalories( ).then(( cal ) => {
			return dispatch({ type: 'BRAND_CURRENT_CALORIES', payload: { success:true, calories: cal } })
		}).catch(( err ) => {
			return dispatch({ type: 'BRAND_CURRENT_CALORIES', payload: {
				success: false
			} })
		})
	}
}

export function clearBeverage( data ){
	return ( dispatch ) => {
		return api.clearSelected( ).then(() => {
			return dispatch({ type: 'CLEAR_BEVERAGE', payload: data })
		})
	}
}

export function clear( data ){
	return { type: 'CLEAR_BRANDS', payload: data }
}





