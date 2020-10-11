import React from 'react';
import moment from 'moment';
import './BookingListUser.css';
class bookingListUser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reiterative: []
    };
  }
  weekDay(day) {
    switch (day) {
      case 1:
        return 'lunes'
      case 2:
        return 'martes'
      case 3:
        return 'miércoles'
      case 4:
        return 'jueves'
      case 5:
        return 'viernes'
      case 6:
        return 'sábado'

      default:
        return 'domingo'
    }

  }

  render() {
    return (<ul className="bookings__list">
      {this.props.bookings.map(booking => {

        return (
          <li key={booking._id} className="bookings__item">
            <div className="bookings__item-data">
              {booking.user.fullname} -{' '}-{this.weekDay(moment(booking.event.date).day())}-{' '}
              {(moment(booking.event.date).format("DD/MM/YYYY"))}-{' '}
              {new Date(booking.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div className="bookings__item-actions">
              <button className="btn" title="Eliminar reservación"
                onClick={this.props.onDelete.bind(this, booking._id)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>);

  }

}
export default bookingListUser;
