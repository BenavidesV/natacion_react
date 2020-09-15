import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
const propTypes = {
  date: PropTypes.object.isRequired,
  dayFormat: PropTypes.string.isRequired,
};


class Header extends React.PureComponent {
  render() {
    const {
      date,
      dayFormat,
    } = this.props;
    return (<span className="title">{moment(date).locale('es').format('DD/MM/YYYY')}</span>);
  }
}

Header.propTypes = propTypes;
export default Header;