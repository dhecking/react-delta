import lodash from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import Translation from './../Translation';
import BackButton from './../BackButton/BackButton';
import Logging from './../../logs';
import actions from './../../actions/';
import { withRouter, Link } from 'react-router-dom';
import Logo from './../Logo/Logo.js';

import './CategorySelection.css';

const Logs = Logging.getLogger('CategorySelection.js');

class CategorySelection extends React.Component {
  componentDidMount() {
    Logs.debug('Brand Loop did mount');
    this.props.dispatch(actions.brands.clearBeverage());
  }

  getLink(brand) {
    return `/brand/${brand.refId}/${this.props.type}`;
  }

  componentWillReceiveProps(nextProps) {
    // If we disable ADA, we should re-route home:
    if (this.props.ada.enabled !== nextProps.ada.enabled) {
      if (nextProps.ada.enabled === false) {
        this.props.history.push('/home');
      }
    }
  }

  renderBrand(brand, i) {
    let isDefault = false;
    if (i === 0) isDefault = 'true';
    return (
      <Link to={this.getLink(brand)} key={i}>
        <Logo id={brand.refId} adaDefault={isDefault} imgSrc={brand.display.icon} available={brand.available} isPromo={true} />
      </Link>
    );
  }

  render() {
    let heading = <span>Pick Your</span>;
    let subHeading = <span>Promo</span>;
    if (this.props.type && this.props.languageObj && this.props.languageObj.display) {
      heading = <Translation string={this.props.languageObj.display.titleLanguageString} />;
      subHeading = <Translation string={this.props.languageObj.display.subtitleLanguageString} />;
    }

    return (
      <div className="category-selection">
        <BackButton />
        <div className="contents">
          <div className="row">
            <h1 className="heading">
              {heading} <strong>{subHeading}</strong>
            </h1>
          </div>
          <div className="row selections">
            {/* RENDER BRANDS */}
            {lodash.map(lodash.values(this.props.brands), this.renderBrand.bind(this))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ languages, ada }) => ({ languages, ada });
export default connect(mapStateToProps)(withRouter(CategorySelection));
