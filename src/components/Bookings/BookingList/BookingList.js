import React from 'react';
import moment from 'moment';
import './BookingList.css';
class bookingList extends React.Component {
  state = {
    reiterative: false,
  };
  handleCheck = () => {
    this.setState({ reiterative: !this.state.reiterative });
    console.log(this.state.reiterative);
  };
  weekDay(day) {
    switch (day) {
      case 1:
        return 'Lunes'
        break;
      case 2:
        return 'Martes'
        break;
      case 3:
        return 'Miércoles'
        break;
      case 4:
        return 'Jueves'
        break;
      case 5:
        return 'Viernes'
        break;
      case 6:
        return 'Sábado'
        break;

      default:
        return 'Domingo'
        break;
    }

  }
  onReiterative(operator,eventDate){
    this.props.bookings.map(booking => {
      if (moment(eventDate).day()==moment(booking.event.date).day() &&
      moment(eventDate).year()==moment(booking.event.date).year() &&
      moment(eventDate).month()==moment(booking.event.date).month() &&
      moment(eventDate).hour()==moment(booking.event.date).hour()) {
        operator==='confirm' ? this.props.onConfirm.bind(this, booking._id) : this.props.onCancel.bind(this, booking._id); 
      }
    });
  }

  render() {
    return (<ul className="bookings__list">
      {this.props.bookings.map(booking => {
        return (
          <li key={booking._id} className="bookings__item">
            <div className="bookings__item-data">
              {booking.user.fullname} -{' '}-{this.weekDay(moment(booking.event.date).day())}-{' '}
              {new Date(booking.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="bookings__item-actions">
              <input type="checkbox" label="Evento concurrente" onChange={this.handleCheck} />Evento concurrente
          </div>
            <div className="bookings__item-actions">
              <button className="btn"
                onClick={this.state.reiterative ? this.onReiterative('cancel', moment(booking.event.date)) : this.props.onDelete.bind(this, booking._id)}>
                Cancelar
              </button>
            </div>
            <div className="bookings__item-actions">
              <button className="btn"
                onClick={this.state.reiterative ? this.onReiterative('confirm', moment(booking.event.date)) : this.props.onConfirm.bind(this, booking._id)}>
                Aprobar
                </button>
            </div>
          </li>
        );
      })}
    </ul>);

  }

}
export default bookingList;
