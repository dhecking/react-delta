import lodash from 'lodash';
import React from 'react';
import moment from 'moment';
import { getBundleAssetPath } from '../../utils';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './Attract.css';

const IMG_DURATION = 5000;

class Attract extends React.Component {
  timeout = null;

  state = {
    currentAmbient: 0,
    assets: []
  };

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  componentDidMount() {
    const { attractType, settings } = this.props;
    this.setState({
      assets: this.checkDates(lodash.get(settings.homeScreen, `${attractType}.display.background`, []))
    });
  }

  checkDates(assets) {
    const now = moment(new Date());

    return assets.filter(asset => {
      if (!asset.startDate || !asset.endDate) return true;
      let startDate = moment(new Date(asset.startDate));
      let endDate = moment(new Date(asset.endDate));
      return now.isBetween(startDate, endDate, 'day', '[]');
    });
  }

  nextScreen() {
    const total = this.state.assets.length;
    let next = this.state.currentAmbient + 1;
    if (next >= total) {
      next = 0;
    }
    this.setState({ currentAmbient: next });
  }

  handleImageLoad() {
    this.timeout = setTimeout(this.nextScreen.bind(this), IMG_DURATION);
  }

  handleVideoEnd() {
    this.nextScreen();
  }

  renderAsset(asset, i) {
    if (i !== this.state.currentAmbient) return null;

    const path = getBundleAssetPath();
    let ele = null;
    if (asset.image) {
      ele = <img key={i} src={`${path}${asset.image}`} onLoad={this.handleImageLoad.bind(this)} className="ambient" alt="home-attract" />;
    } else if (asset.video) {
      ele = <video key={i} className="attract ambient" onEnded={this.handleVideoEnd.bind(this)} autoPlay src={`${path}${asset.video}`} />;
    } else {
      return null;
    }
    return (
      <CSSTransition key={i} classNames="ambient-trans" timeout={500} appear enter exit>
        {ele}
      </CSSTransition>
    );
  }

  render() {
    const { attractType, settings } = this.props;
    const { assets } = this.state;
    const ambients = lodash.sortBy(assets, i => i.priority);
    const showTouchToContinue = lodash.get(settings.homeScreen, `${attractType}.display.showTouchToContinue`, false);

    return (
      <div className="attract">
        <div className="continue">
          <TransitionGroup component={null}>{lodash.map(ambients, this.renderAsset.bind(this))}</TransitionGroup>
          {showTouchToContinue && <span className="ttc" />}
        </div>
      </div>
    );
  }
}

export default Attract;
