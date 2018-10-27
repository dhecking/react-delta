import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './StillDecidingModal.css';

class StillDeciding extends PureComponent {
  state = { rotate: false };

  static propTypes = {
    duration: PropTypes.number
  };

  componentWillReceiveProps(props) {
    const { stillDecidingActive } = props.timers;
    setTimeout(() => this.setState({ rotate: stillDecidingActive }), 100);
  }

  render() {
    const timeouts = this.props.settings.deviceMgmt.config;
    const duration = timeouts.screenIdleSelectionMS;
    const active = this.props.timers.stillDecidingActive;

    const { rotate } = this.state;
    const styles = { display: active ? 'block' : 'none' };
    const tipStyles = { transitionDuration: active ? `${duration / 1000}s` : '1s' };
    const classes = classnames('tip', { rotate });
    return (
      <div className="still-deciding">
        <div className="timeout" style={styles}>
          <div className="overlay" />
          <div className="outer">
            <div className="inner">
              <div className="bg">
                <div className="text">
                  <div className="title">Still deciding?</div>
                  <div className="subtitle">touch to continue</div>
                </div>
                <div className={classes} style={tipStyles} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    settings: state.settings,
    timers: state.timers
  };
};

export default connect(mapStateToProps)(StillDeciding);
