import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { getBundleAssetPath } from '../../utils';

import Translation from './../Translation';

import './Logo.css';

class Logo extends PureComponent {
  state = { selected: false };
  timeout = null;
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  render() {
    const { onTap, className, imgSrc, name, available, isPromo, id } = this.props;

    let { linkOverride } = this.props;
    linkOverride = linkOverride || false;
    const { active } = this.state;
    const path = isPromo ? getBundleAssetPath() + imgSrc : `/api/beverages/groups/${id}/icon`;

    let classes = classnames(`item image logo-${this.props.id}`, {
      [className]: className,
      default: !imgSrc,
      unavailable: !available,
      active
    });

    const handleTap = e => {
      console.log('handle tap..', available, name, linkOverride);
      // if ( ( linkOverride ) && onTap ) return onTap( e )
      if (!available && !linkOverride) {
        e.preventDefault();
        e.stopPropagation();
      }
      if ((available || linkOverride) && onTap) return onTap(e);
      this.setState({ active: true });
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => this.setState({ active: false }), 1500);
    };

    let adaEnabled = this.props.adaEnabled || 'enabled';
    let adaDefault = this.props.adaDefault || 'false';
    if (!available) {
      adaEnabled = 'disabled';
      adaDefault = 'false';
    }

    return (
      <div
        id={`logo-${this.props.id}`}
        onClick={handleTap}
        ada-enabled={adaEnabled}
        ada-order={this.props.order || 0}
        ada-default={adaDefault}
        className={classes}
        data-name={name}
      >
        <img src={path} alt={name} />
        {this.props.children}
        {!available && (
          <span className="item label_unavailable">
            <Translation string="unavailableText.unavailable.text" />
          </span>
        )}
      </div>
    );
  }
}

export default Logo;
