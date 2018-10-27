import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Logo from '../Logo/Logo'

class Circle extends Component {
  constructor() {
    super()
    this.state = {
      active: false,
      styles: {}
    }
  }
  componentDidMount() {
    let {style, size, group } = this.props

    size = size || 100
    const mt = size / 2 * -1, ml = size / 2 * -1
    const styles = {
      ...style,
      width:size,
      height:size,
      marginLeft: ml,
      marginTop: mt,
      top: '50%',
      left: '50%',
      opacity: 1
    }

    if (!group.available) {
      styles['filter'] = 'grayscale(100%)'
      styles['opacity'] = .75
    }

    setTimeout( ()=> this.setState({ styles }), 400 )
  }

  render() {
    let { group } = this.props

    const { styles } = this.state

    return (
      <Link className="cap-wrap" style={styles} to={`/brand/${group.refId}`} key={1}>
        <Logo
          id={group.refId}
          adaEnabled={0}
          order={0}
          imgSrc={group.display.icon}
          available={group.available}
        />
      </Link>

    )
  }
}

export default Circle
