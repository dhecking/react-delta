import lodash from 'lodash';
import moment from 'moment';

const initialState = {
  brands: {},
  limitedTimeOffers: {},
  specialtyBrands: {},
  promotions: {},
  promotionSelection: {},
  brandsFetched: false,
  cmsFetched: false,
  currentBrand: null,
  currentBev: null,
  currentCalories: {
    success: false,
    fetched: false,
    fetching: false,
    calories: []
  }
};

let iceLeverIntervalTimer = null;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_CMS_JSON':
      let { brands, limitedTimeOffers, specialtyBrands, promotions, promotionSelection, specialtyBrandsSelection } = action.payload;
      state = Object.assign({}, state, {
        brands,
        limitedTimeOffers,
        specialtyBrands,
        promotions,
        promotionSelection,
        specialtyBrandsSelection,
        cmsFetched: true
      });
      break;
    case 'WEBSOCKET_EVENT':
      console.log('WEBSOCKET EVENT', action.payload);
      const { data } = action.payload;
      const eventType = data.msgType;
      if (eventType === 'selectAndPour') {
        console.log('Select / Pour Event');
        window.EventBus.emit('resetTimers', { event: data.type });
        if (data.type === 'start') {
          console.log('STARTED POURING');
          window.__FS__DISBLE_TOUCH = true;
        } else if (data.type === 'stop') {
          console.log('STOPPED POURING');
          window.__FS__DISBLE_TOUCH = false;
        } else if (data.type === 'select') {
          state = selectBeverage(state, `${data.pourable.beverageId}`);
        }
      } else if (eventType === 'status') {
        console.log('---- APP STATE CHANGED:', data);
        let leverPressed = lodash.get(data.data, 'state.iceLeverPressed', 'not_present');
        console.log('ice lever:', leverPressed);
        if (leverPressed !== 'not_present') {
          console.log('RESET TIMERS');
          window.EventBus.emit('resetTimers', { event: 'ice_lever' });
          if (leverPressed === true) {
            clearInterval(iceLeverIntervalTimer);
            iceLeverIntervalTimer = setInterval(() => {
              console.log('RESET TIMERS');
              window.EventBus.emit('resetTimers', { event: 'ice_lever' });
            }, 1000);
          } else {
            clearInterval(iceLeverIntervalTimer);
          }
        }
      }
      break;
    case 'CLEAR_BRANDS':
      state = Object.assign({}, initialState, action.payload);
      break;
    case 'CLEAR_BEVERAGE':
      state = Object.assign({}, state, { currentBev: null, currentBrand: null });
      break;
    case 'UPDATE_BRANDS':
      state = Object.assign({}, state, action.payload);
      break;
    case 'SELECT_BRAND':
      const { brand } = action.payload;
      state = Object.assign({}, state, { currentBrand: brand });
      break;
    case 'SELECT_BEVERAGE':
      window.EventBus.emit('resetTimers', { event: 'select_beverage' });
      state = selectBeverage(state, action.payload.bev);
      break;
    case 'BRAND_CURRENT_CALORIES_STARTED':
      state = Object.assign({}, state);
      state.currentCalories.fetched = false;
      state.currentCalories.fetching = true;
      break;
    case 'FETCH_SETTINGS_COMPLETE':
      state.details = action.payload.details;
      break;
    case 'BRAND_CURRENT_CALORIES':
      state = Object.assign({}, state, { currentCalories: { fetched: true, fetching: false, ...action.payload } });
      break;
    case 'UPDATE_BEV_AVAIL':
      let allBevs = action.payload;
      let configs = state.details;
      let availBrands = lodash.map(state.brands, checkAndUpdateBrand.bind(this, allBevs, action, configs, false));
      let availPromotions = lodash.map(state.promotions, checkAndUpdateBrand.bind(this, allBevs, action, configs, true));
      let availLimitedTimeOffers = lodash.map(state.limitedTimeOffers, checkAndUpdateBrand.bind(this, allBevs, action, configs, true));
      let availSpecialtyBrands = lodash.map(state.specialtyBrands, checkAndUpdateBrand.bind(this, allBevs, action, configs, true));

      state = Object.assign({}, state, {
        brands: lodash.keyBy(availBrands, 'refId'),
        limitedTimeOffers: lodash.keyBy(availLimitedTimeOffers, 'refId'),
        specialtyBrands: lodash.keyBy(availSpecialtyBrands, 'refId'),
        promotions: lodash.keyBy(availPromotions, 'refId'),
        brandsFetched: true
      });
      break;
    default:
      break;
  }

  return state;
}

function selectBeverage(state, bev) {
  let refId = null;
  let brand = lodash.find(state.brands, brand => {
    return lodash.includes(lodash.keys(brand.beverages), bev);
  });
  if (!brand)
    brand = lodash.find(state.specialtyBrands, brand => {
      return lodash.includes(lodash.keys(brand.beverages), bev);
    });
  if (!brand)
    brand = lodash.find(state.promotions, brand => {
      return lodash.includes(lodash.keys(brand.beverages), bev);
    });
  if (!brand)
    brand = lodash.find(state.limitedTimeOffers, brand => {
      return lodash.includes(lodash.keys(brand.beverages), bev);
    });
  if (brand) refId = brand.refId;
  return Object.assign({}, state, { currentBrand: refId, currentBev: bev });
}

function checkAndUpdateBrand(allBevs, action, configs, isDateControlled, brand) {
  brand.available = false; // default to false
  brand.visible = false; // default to false

  // If this is date controlled, see if it's valid:
  if (isDateControlled) {
    let now = moment(new Date());
    let startDate = moment(new Date(brand.startDate));
    let endDate = moment(new Date(brand.endDate));
    if (!now.isBetween(startDate, endDate, 'day', '[]')) {
      brand.visible = false;
      return brand;
    }
  }

  if (brand.name === 'Water Unbranded') {
    brand.display.cluster = 'water';
    brand.isWater = true;
  }
  let manuallyDisabledBrands = [
    // "626dadaefad99a76f5bf2cdde0193d55",
    // "70afc8b65a527fa70f7c008169cd9041",
    // "f25d86bd39becc76aacbc7713af3e60d",
    // "5ead45e8930be66a7b901f3e8cb418d8",
    // "ffbe333060cc9debe6c25814a9e59cc1",
    // "af20a33502326c1aad3821356843879c",
    // "ed72f4784ff29a571bd19a322c0a3240",
    // "f0bc551795e48ce7e6454afbd8f54505",
    // "43b9684d5ef248f65a9287f967699467",
    // "19b8fd803c8639ec3b0f31ba365e6386",
    // "41b629ab4e9912f0e755249c8386a794"
  ];
  let devDisabledBevs = [
    '1952418',
    '1491149',
    '1491153',
    '1491146',
    '1475650',
    '1475671',
    '1475651',
    '1997011',
    '1997015',
    '1997019',

    '1976658',
    '1982847'
    // '1976660',
    // '1820829'
  ];
  // See if Brand Beverages are available:
  brand.beverages = lodash.map(brand.beverages, bev => {
    bev.available = false;
    bev.visible = false;
    let bevAvail = lodash.find(allBevs, b => `${b.beverage.id}` === `${bev.refId}`);
    if (bevAvail) {
      bev.available = bevAvail.available;
      bev.visible = bevAvail.visible;
      if (process.env.NODE_ENV === 'development') {
        // Dev mode, make it available:
        bev.available = true;
        bev.visible = true;
        if (lodash.includes(devDisabledBevs, `${bev.refId}`)) {
          bev.available = false;
          // bev.visible = false
        }

        // Water & Carb disable / enable
        if ((bev.refId + '' === '1477221' && configs.hideWater) || (bev.refId + '' === '1477222' && configs.hideCarb)) {
          bev.available = false;
          bev.visible = false;
        }
      }

      if (bev.available) brand.available = true;
      if (bev.visible) brand.visible = true;
      bev.display = bev.display || {};
      if (bev.display.parentIcon) {
        bev.display.icon = brand.display.icon;
      }

      if (process.env.NODE_ENV === 'development') {
        if (lodash.includes(manuallyDisabledBrands, brand.refId)) {
          brand.visible = false;
          brand.available = false;
        }
      }
    }
    return bev;
  });

  let indexOfDefault = lodash.findIndex(brand.beverages, { default: true });
  brand.beverages = lodash.filter(brand.beverages, { visible: true });
  brand.beverages = lodash.sortBy(brand.beverages, bev => bev.display.priority);

  if (brand.beverages.length > 0) {
    let afterIndexOfDefault = lodash.findIndex(brand.beverages, { default: true, available: true });
    if (afterIndexOfDefault === -1) {
      // If the default beverage has been removed ( not visible )
      if (indexOfDefault >= brand.beverages.length) indexOfDefault = 0;
      let bev = getNextAvailable(indexOfDefault, brand.beverages, 0);
      if (bev) {
        brand.beverages = lodash.map(brand.beverages, b => {
          b.default = false;
          if (b.refId === bev.refId) b.default = true;
          return b;
        });
      }
    }
  }

  brand.beverages = lodash.keyBy(brand.beverages, 'refId');

  return brand;
}

function getNextAvailable(i, bevs, iterations) {
  let bev = bevs[i] || {};
  if (bev.available) return bev;
  i++;
  if (i >= bevs.length) i = 0;
  iterations++;
  if (iterations >= 20) return null;
  return getNextAvailable(i, bevs, iterations);
}
