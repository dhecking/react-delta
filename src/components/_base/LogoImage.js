import React from 'react'
import { connect } from 'react-redux'

const LogoImage = ( { beverage = {}, imageStyle, assetImages } ) => {
  const { name, attrs, assetHandle } = beverage

  const imgSrc = assetImages[assetHandle]
  const isSoda = beverage.id === 1477222

  return (
    <div className="bev">
      <img className="item iamge" style={imageStyle} src={imgSrc} alt="" data-name={name}/>
      { !isSoda && attrs && attrs['flavor-color'] && (
        <div className="flavor">
          <div className="wave" style={{backgroundColor: attrs['flavor-color']}}></div>
          <div className="label" style={{textColor: attrs['text-color']}}>
            { attrs['text'] }
          </div>
          </div>
        )
      }
      { isSoda && <div className="soda">soda</div> }
      </div>
    )
}

const mapStateToProps = function({beverageState}) {
  return {
    assetImages: beverageState.assetImages,
  };
}

export default connect(mapStateToProps)(LogoImage)
