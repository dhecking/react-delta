import React from 'react'

// import adStill from '../images/PoC-Home-Screen-Still-Image.png'

// const SPRITE_VIDEO = '0019730_COC_SpriteTropicBerryLocalKit_DMB_Horiz_r16.mp4'
// const WIDE_VIDEO = 'McD_MSeries_Demo_1920_1080.mp4'
// const NARROW_VIDEO = 'McD_MSeries_Demo_1080x820.mp4'
// const NATIVE_VIDEO = 'McD_Native_960_540.mp4'
const COMBINED_VIDEO = 'For_M_Series_UI_Combined-v2.mp4'

export const StillLayout = ({children})=> {
  // Handle file system URLs
  // const adImage = window.location.host === '' ? adStill.slice(5) : adStill
  return (
    <div className="layout">
      <div className="top">
        {/*
        <img src={adImage} alt="Top Hero"/>
        */}
        <video style={{maxWidth:'100%'}} src={`${path}${COMBINED_VIDEO}`} autoPlay muted loop />
      </div>
      <div className="bottom">
        { children }
      </div>
    </div>
  )
}

export const EmptyLayout = ({children})=> (
  <div className="layout">
    <div className="top">
    </div>
    <div className="bottom">
      { children }
    </div>
  </div>
)
