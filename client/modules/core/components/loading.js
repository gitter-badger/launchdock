import React from 'react';
import assign from 'domkit/appendVendorPrefix';
import insertKeyframesRule from 'domkit/insertKeyframesRule';

// Loading Animations
// inspired by http://madscript.com/halogen

class Loading extends React.Component {

  getBallStyle() {
    return {
      backgroundColor: this.props.color,
      width: this.props.size,
      height: this.props.size,
      margin: this.props.margin,
      borderRadius: '100%',
      verticalAlign: this.props.verticalAlign
    };
  }

  getAnimationStyle(i) {
    const keyframes = {
      '0%': {
        transform: 'scale(1)'
      },
      '50%': {
        transform: 'scale(0.5)',
        opacity: 0.7
      },
      '100%': {
        transform: 'scale(1)',
        opacity: 1
      }
    };

    const random = top => Math.random() * top;

    const animationName = insertKeyframesRule(keyframes);
    const animationDuration = ((random(100) / 100) + 0.6) + 's';
    const animationDelay = ((random(100) / 100) - 0.2) + 's';

    const animation = [animationName, animationDuration, animationDelay, 'infinite', 'ease'].join(' ');
    const animationFillMode = 'both';

    return {
      animation: animation,
      animationFillMode: animationFillMode
    };
  }

  getStyle(i) {
    return assign(this.getBallStyle(i), this.getAnimationStyle(i), {
      display: 'inline-block'
    });
  }

  renderLoader(loading) {
    if (loading) {
      const style = {
        width: (parseFloat(this.props.size) * 3) + parseFloat(this.props.margin) * 6,
        fontSize: 0
      };

      return (
        <div id={this.props.id} className={this.props.className}>
          <div style={style}>
            <div style={this.getStyle(1)}></div>
            <div style={this.getStyle(2)}></div>
            <div style={this.getStyle(3)}></div>
            <div style={this.getStyle(4)}></div>
            <div style={this.getStyle(5)}></div>
            <div style={this.getStyle(6)}></div>
            <div style={this.getStyle(7)}></div>
            <div style={this.getStyle(8)}></div>
            <div style={this.getStyle(9)}></div>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    return this.renderLoader(this.props.loading);
  }
}

Loading.propTypes = {
  className: React.PropTypes.string,
  color: React.PropTypes.string,
  loading: React.PropTypes.bool,
  margin: React.PropTypes.string,
  size: React.PropTypes.string
};

Loading.defaultProps = {
  className: 'loader-wrapper',
  color: '#666',
  loading: true,
  margin: '2px',
  size: '15px'
};

export default Loading;
