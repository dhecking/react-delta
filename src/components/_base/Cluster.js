import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { StillLayout } from './layouts'
import Layer from './Layer'
import Circle from './Circle'
import { setPromo } from '../actions'
// import kidsImage from '../images/McD Yellow.png'

// const SHOW_GROUPS = ['16842B' ,'168427' ,'168435' ,'168436' ,'168442' ,'16841F' ,'16843C' ,'16846B' ,'173BA5' ,'173BA6' ,'1C24D3' ,'168457' ,'16844E' ,'168452' ,'1BB81E' ,'16C0CA' ,'16C0C2' ,'180483' ,'18B1F1' ,'19C679' ,'168A65']

const COKE_GROUP_ID = '168426'
const WATER_GROUP_ID = '168A65'

const Cluster = ({groups, appLoading, loadinGroups, setPromo })=> {
  const visibleGroups = groups.filter( g => g.available )
  .filter( g => g.id !== COKE_GROUP_ID && g.id !== WATER_GROUP_ID )

  const cokeGroup = groups.filter( g => g.id === COKE_GROUP_ID )

  const water = groups.find( g => g.id === WATER_GROUP_ID )

  // const group1 = visibleGroups.length < 10 ? visibleGroups : visibleGroups.slice(0,10)

  // const group2 = visibleGroups.length < 10 ? null : visibleGroups.slice(10, 200)

  // Per Johs, via email, adjusted order by 90deg since layout starts at 3 o'clock
  const order1 = [
   "SpriteZero"
  ,"Fanta Orange"
  ,"FantaZero-Orange"
  ,"Dr Pepper"
  ,"Diet Dr Pepper"
  ,"Barqs"
  ,"BarqsDiet"
  ,"Diet Coke"
  ,"Coca-Cola Zero"
  ,"Sprite"
  ]
  const order2 = [
   "SeagramsGingerAle"
  ,"DietSeagramsGingerAle"
  ,"MinuteMaid"
  ,"MinuteMaidLight"
  ,"MinuteMaidDrinks"
  ,"MinuteMaidDrinksLight"
  ,"Minute Maid Sparkling Lemonade"
  ,"Hi-C Orange"
  ,"Powerade Orange"
  ,"Powerade Zero Orange"
  ,"VitaminWaterTropicalC"
  ,"Dasani-Lemon"
  ,"DasaniSparklingLemonLime"
  ,"Barqs Creme Soda Vanilla"
  ,"Barqs Creme Soda Diet Vanilla"
  ,"MelloYello"
  ,"MelloYelloZero"
]

  const group1 = order1.map( o => visibleGroups.find( g =>  g.name === o  )).filter( g => g )

  const group2 = order2.map( o => visibleGroups.find( g => g.name === o )).filter( g => g )

  // const size = 180
  // const mt = size / 2 * -1, ml = size / 2 * -1
  // const specialtyStyles = {
  //   width:size,
  //   height:size,
  //   marginLeft: ml,
  //   marginTop: mt,
  //   top: '30%',
  //   left: '50%',
  // }

  return (
    <StillLayout>
      <div className="cluster">
        { appLoading && <div className="la-ball-clip-rotate la-2x"><div></div></div> }
        { !loadinGroups && groups.length === 0 && <h1>No available beverages.</h1> }
        <Layer
          index={0}
          groups={cokeGroup}
          offset={0} />

        <Layer
          index={1}
          groups={group1}
          offset={0} />

        { group2 &&
          <Layer
            index={2}
            groups={group2}
            offset={0} />
        }
      </div>
      {/*
      <div className="specialty cap-wrap" style={specialtyStyles} onClick={setPromo}>
        <div className="bev">
          <img className="item image"  src={kidsImage} alt="" />
        </div>
      </div>
      */}
      <Link to="/ce" className="ce hidden" />
      <div className="water">
        { water && <Circle size={160} group={water} /> }
      </div>
    </StillLayout>
  )
}

const mapStateToProps = (store)=> ({
    groups: store.beverageState.groups,
    appLoading: store.beverageState.appLoading,
    loadinGroups: store.beverageState.loadingGroups,
})

const mapDispatchToProps = {
  setPromo
}

export default connect(mapStateToProps, mapDispatchToProps)(Cluster)
