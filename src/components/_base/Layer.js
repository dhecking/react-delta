import React, { Component } from 'react'

import Circle from './Circle'

class Layer extends Component {

  getStyles(angle, offset, radius, i) {
    return { transform: `rotate(${angle * i + offset}deg) translate(${radius}) rotate(-${angle * i + offset}deg)` }
  }

  render() {
    const { index, groups, offset } = this.props
    const angle = 360 / (groups.length)
    const factor = index <= 1 ? index * .85 : index * 2.5
    const radius = index > 0 ? `${220 + (factor*40)}px` : 0
    const classes = `l${index}`
    const size = index > 0 ? 150 - (index-1)*20 : 220

    return (
      <div className={classes}>
        {
          groups.map( (group, i)=> {
            const styles = this.getStyles(angle, offset, radius, i)

            return (
              <Circle
                key={i}
                size={size}
                group={group}
                style={styles}
                />
            )}
          )
        }
      </div>

    )
  }

}

export default Layer
