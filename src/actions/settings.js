import api from './../api';
import actions from './index.js';
import Promise from 'bluebird';
import lodash from 'lodash';

export const UPDATE_SETTINGS = 'UPDATE_SETTINGS';
export function update(data) {
  return { type: 'UPDATE_SETTINGS', payload: data };
}

export const CLEAR_SETTINGS = 'CLEAR_SETTINGS';
export function clear(data) {
  return { type: 'CLEAR_SETTINGS', payload: data };
}

export const FETCH_SETTINGS_COMPLETE = 'FETCH_SETTINGS_COMPLETE';
export function fetchSettings() {
  return dispatch => {
    Promise.all([
      api.fetchSettings().then(details => {
        const settings = details && details.beans.find(b => b.name === 'selfServeApp');
        return settings;
      }),
      api.fetchDetails().then(details => {
        console.log('Fetched details', details);
        return details;
      })
    ])
      .then(results => {
        console.log('results:', results);
        dispatch({
          type: FETCH_SETTINGS_COMPLETE,
          payload: { details: { ...results[1].config }, ...results[0] }
        });
      })
      .then(() => {
        fetchCMSJSON();
        dispatch(actions.brands.refreshAvailability());
      });
  };
}

export const FETCH_REGION_COMPLETE = 'FETCH_REGION_COMPLETE';
export function fetchRegion() {
  return dispatch => {
    api.fetchActiveRegion().then(region => {
      // const region = region && region.beans.find(( b ) => b.name === 'selfServeApp')
      dispatch({
        type: FETCH_REGION_COMPLETE,
        payload: region
      });
    });
  };
}

export const FETCH_CMS_JSON = 'FETCH_CMS_JSON';
export function fetchCMSJSON(modelStr) {
  return dispatch => {
    function handleErrors(response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response;
    }

    const configStr = !!modelStr ? `ui-config-${modelStr}` : `ui-config`;

    fetch(`${process.env.PUBLIC_URL}/${configStr}.json`)
      .then(handleErrors)
      .then(response => {
        response.json().then(data => {
          console.log('CMS JSON DATA:', data);
          dispatch({
            type: FETCH_CMS_JSON,
            payload: data
          });
          dispatch(actions.settings.fetchSettings());
          dispatch(actions.settings.fetchRegion());
          // dispatch( actions.brands.refreshAvailability() ) // MOVED to callback for fetchSettings
          // dispatch( _actions.initialize() )
        });
      })
      .catch(error => console.log(error));
  };
}

export const fetchTroubles = () => {
  return dispatch => {
    return api.fetchTroubles().then(troubles => {
      dispatch({ type: 'FETCH_TROUBLES_COMPLETE', payload: troubles });
      const carbUsageTrouble = lodash.find(troubles, ({ type }) => type === 'CarbUsageTrouble');
      if (carbUsageTrouble) {
        console.log('Has Carb Trouble');
        // resetActiveTimer(dispatch, getState, api)
        // setTimeout(() => setBeverage(selectedBeverageId)(dispatch, getState, api) , 1000)
      }
      dispatch({ type: 'CARB_USAGE_TROUBLE', payload: carbUsageTrouble !== undefined });
    });
  };
};
