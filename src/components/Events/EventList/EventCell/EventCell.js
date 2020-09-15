import React from 'react';
import PropTypes from 'prop-types';
import './EventCell.css';
const propTypes = {
  value: PropTypes.string.isRequired,
};


class EventCell extends React.PureComponent {
  render() {
    const {
      value
    } = this.props;
    return (
        
      <div className="event runway">
        <span className="centered">{value}</span>
      </div>
    );
  }
}

EventCell.propTypes = propTypes;
export default EventCell;