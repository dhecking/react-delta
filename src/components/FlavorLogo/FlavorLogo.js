import lodash from 'lodash';
import React, { PureComponent } from 'react';
import Translation from './../Translation';
import classnames from 'classnames';

import './FlavorLogo.css';

class FlavorLogo extends PureComponent {
  state = {
    active: false
  };

  renderLabel() {
    const labelNeeded = lodash.get(this.props.beverage, 'isFlavored', false);
    const { flavor } = this.props;
    if (!flavor || !labelNeeded) return null;
    return (
      <ul style={{ color: '#fff' }} className="label">
        <Translation string={flavor.display.languageString} />
      </ul>
    );
  }

  getWaveColor() {
    let { flavor, defaultColor } = this.props;
    if (defaultColor && !/^#/.test(defaultColor)) defaultColor = `#${defaultColor}`;
    if (flavor) return `#${flavor.display.mainColor}`;
    if (defaultColor) return defaultColor;
    return null;
  }

  renderWave() {
    const waveColor = this.getWaveColor();
    const isFlavored = lodash.get(this.props.beverage, 'display.isFlavored', true);
    const waveEnabled = lodash.get(this.props.beverage, 'display.waveEnabled', true);
    if (!waveColor || !waveEnabled || !isFlavored) return null;
    let waveStyle = { shapenRendering: 'geometricPrecision' };
    const waveViewBox = this.props.model === '7000' ? '0 0 200 60' : '0 0 200 50';
    if (this.props.isTTP) {
      return (
        <div className="wavebox-wrapper">
          <div className="wavebox">
            <svg width="2340px" height="481px" viewBox="0 0 2340 481" style={waveStyle}>
              <g id="wave" fill={waveColor} fillRule="nonzero">
                <path
                  d="M1560,480.073981 L780,480.073981 L0,480.073981 L0,7.67347371 C156,21.9225228 299,26.1972376 429,11.9481884 C559,-2.30086069 676,-3.7257656 780,7.67347371 C936,21.9225228 1079,26.1972376 1209,11.9481884 C1339,-2.30086069 1456,-3.7257656 1560,7.67347371 C1716,21.9225228 1859,26.1972376 1989,11.9481884 C2119,-2.30086069 2236,-3.7257656 2340,7.67347371 L2340,480.073981 L1560,480.073981 Z"
                  id="Combined-Shape"
                />
              </g>
            </svg>
          </div>
        </div>
      );
    }
    return (
      <div className="wavebox-container">
        <div className="wavebox">
          <svg viewBox={waveViewBox} style={waveStyle}>
            <g id="wave" fill={waveColor} fillRule="nonzero">
              <path
                d="M200,112.510417 L100,112.510417 L0,112.510417 L0,2 C20,5.33333333 38.3333333,6.33333333 55,3 C71.6666667,-0.333333333 86.6666667,-0.666666667 100,2 C120,5.33333333 138.333333,6.33333333 155,3 C171.666667,-0.333333333 186.666667,-0.666666667 200,2 C220,5.33333333 238.333333,6.33333333 255,3 C271.666667,-0.333333333 286.666667,-0.666666667 300,2 L300,112.510417 L200,112.510417 Z"
                id="Combined-Shape"
              />
            </g>
          </svg>
          <svg viewBox={waveViewBox}>
            <g id="wave" fill={waveColor} style={waveStyle}>
              <path
                d="M200,112.510417 L100,112.510417 L0,112.510417 L0,2 C20,5.33333333 38.3333333,6.33333333 55,3 C71.6666667,-0.333333333 86.6666667,-0.666666667 100,2 C120,5.33333333 138.333333,6.33333333 155,3 C171.666667,-0.333333333 186.666667,-0.666666667 200,2 C220,5.33333333 238.333333,6.33333333 255,3 C271.666667,-0.333333333 286.666667,-0.666666667 300,2 L300,112.510417 L200,112.510417 Z"
                id="Combined-Shape"
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  renderPulse() {
    let { selected, ada } = this.props;
    if (!selected) return null;
    let pulseColor = this.getWaveColor();
    if (ada) pulseColor = '#fff';
    return <div className="pulse" style={{ backgroundColor: pulseColor }} />;
  }

  handleTap(e) {
    const { beverage, onTap } = this.props;
    if (!beverage.available) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (beverage.available && onTap) return onTap(e);
    this.setState({ active: true });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.setState({ active: false }), 1500);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    const { beverage, selected, order, animate, imgSrc } = this.props;

    if (order < 0) return null;

    const classes = classnames('item image', {
      default: imgSrc,
      unavailable: beverage.available === false,
      selected,
      animate,
      active: this.state.active
    });
    const imageStyle = {
      order: order
      // animationDelay: `${(order / 2 + animationFactor) * (animationFactor / 10)}s`,
    };
    let isDefault = 'false';
    if (lodash.get(beverage, 'default', 'false')) isDefault = 'true';

    let adaEnabled = 'enabled';
    if (!beverage.available || this.props.adaDisabled) adaEnabled = 'disabled';

    const path = `/api/beverages/${beverage.refId}/icon`;

    return (
      <div
        onClick={this.handleTap.bind(this)}
        className={classes}
        ada-enabled={adaEnabled}
        ada-order={order}
        ada-beverage={beverage.refId}
        ada-default={isDefault}
        style={imageStyle}
        data-name={beverage.name}
      >
        <img src={path} alt={beverage.name} />
        {this.renderWave()}
        {this.renderLabel()}
        {this.renderPulse()}
        {!beverage.available && (
          <span className="item label_unavailable">
            <Translation string="unavailableText.unavailable.text" />
          </span>
        )}
      </div>
    );
  }
}

export default FlavorLogo;
