import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import classnames from 'classnames'

import { EmptyLayout } from './layouts'

import LogoImage from './LogoImage'

import backButton from '../images/Bev-Screen-Back-Button.png'

import {
  setBeverage,
  clearSelected,
  startPour,
  stopPour,
} from '../actions'

import groupMappings from './groupMappings'

class SelectBeverage extends PureComponent {
  // For Back Button
  static contextTypes = {
    router: PropTypes.object
  }
  constructor(props) {
    super()
    this.state = this.getStateFromProps(props)
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState( this.getStateFromProps(props) )
  }

  getStateFromProps(props) {
    const {id, groups, setBeverage} = props

    const group = groups.find( g => g.id === id )
    const beverages = (group && group.beverages) || []
    const bev = beverages.length && beverages[0]

    if (bev && bev.available) setBeverage(bev.beverage.id)

    return {
      beverages,
      selected: beverages.length && beverages[0].beverage
    }
  }

  render(){
    const { id } = this.props
    const { beverages, selected } = this.state

    if (!groupMappings[id]) console.log('NO MAPPING FOR', id)
    let { glass } = (groupMappings[id] || {})
  console.log('glass', id, glass)

    // Handle file system URLs
    if (window.location.host === '') glass = glass.slice(5)

    const glassUrl = glass

    return (
      <EmptyLayout>
        <div className="glass" style={{backgroundImage: `url(${glassUrl})`}}></div>
        <div className="beverage">
          <Link to="/" className="back" onClick={this.clearSelected}>
            <img src={backButton} alt="Back"/>
          </Link>
          <div className="info">
            <div className="choices">
              {
                beverages.map( (bev, index)=> {
                  return <Choice
                    key={index}
                    handleSelect={this.handleSelect(bev)}
                    isAvailable={bev.available}
                    isSelected={selected.id === bev.beverage.id}
                    choice={bev.beverage}
                    />
                })
              }
            </div>
            {/*
            <h1 style={{color: font}}>POUR BELOW</h1>
            */}
            {/*<div className="hold-to-pour" onTouchStart={startPour} onTouchEnd={stopPour}>
              <span>Hold to pour</span>
            </div>*/}
          </div>
        </div>
      </EmptyLayout>
    )
  }

  clearSelected = () => {
    const { clearSelected } = this.props
    clearSelected && clearSelected()
  }

  handleSelect = (bev)=>(
    (evt)=> {
      evt.preventDefault()
      if (this.state.timeoutId) {
        clearTimeout(this.state.timeoutId)
        this.setState({ timeoutId: false })
      }

      this.setState({ selected: bev.beverage })

      if (bev && bev.available) this.props.setBeverage(bev.beverage.id)

      if (!bev.available) {
        const timeoutId = setTimeout( ()=> this.setState({ selected: {} }), 3000 )
        this.setState({ timeoutId: timeoutId })
      }
    }
  )
}

const Choice = ({choice, isAvailable, isSelected, handleSelect})=> {
  const classes = classnames('choose', {
    selected: isSelected,
    oos: !isAvailable
  })
  const spanClasses = classnames({ available: isAvailable })

  return (
    <a className={classes} onClick={handleSelect}>
      { isAvailable && <span className={spanClasses}></span> }
      { !isAvailable && <span className="not-avail">not available</span> }
      { choice && <LogoImage beverage={choice} /> }
    </a>
  )
}

const mapStateToProps = function(store) {
  return {
    beverages: store.beverageState.beverages,
    groups: store.beverageState.groups,
  };
}

const mapDispatchToActions = {
  setBeverage,
  clearSelected,
  startPour,
  stopPour,
}

export default connect(mapStateToProps, mapDispatchToActions)(SelectBeverage)
