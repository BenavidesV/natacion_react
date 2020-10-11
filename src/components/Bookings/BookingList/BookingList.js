import React from 'react';
import moment from 'moment';
import './BookingList.css';
class bookingList extends React.Component {
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

  componentDidMount() {
    /*this.props.bookings.map(booking => {
      this.setState(state => {
        const list = state.reiterative.concat('c' + booking._id);
        return {
          list
        }
      })
    })*/
  }
  componentWillUnmount() {
  }

  onReiterative(operator, bookingParam) {
    this.props.bookings.map(booking => {
      
      if (moment(bookingParam.event.date).day() == moment(booking.event.date).day() &&
        moment(bookingParam.event.date).year() == moment(booking.event.date).year() &&
        moment(bookingParam.event.date).month() == moment(booking.event.date).month() &&
        moment(bookingParam.event.date).hour() == moment(booking.event.date).hour() &&
        bookingParam.user._id==booking.user._id) {
        if (operator === 'confirm') this.props.onConfirm(booking._id);
        if (operator === 'cancel') this.props.onCancel(booking._id);
        
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
              {(moment(booking.event.date).format("DD/MM/YYYY"))}-{' '}
              {new Date(booking.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div className="bookings__item-actions">
              <button className="btn-decline" title="Rechazar"
                //onClick={this.onReiterative('cancel', moment(booking.event.date))}
                onClick={this.props.onDelete.bind(this, booking._id)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
              <button className="btn-decline" title={"Rechazar todos los " + this.weekDay(moment(booking.event.date).day()) + " del mes"}
                onClick={() => this.onReiterative('cancel', booking)}
              >
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                </svg>
              </button>
            </div>
            <div className="bookings__item-actions">
              <button title="Aprobar" className="btn-accept"
                onClick={this.props.onConfirm.bind(this, booking._id)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z" />
                </svg>
              </button>
              <button className="btn-accept" title={"Aprobar todos los " + this.weekDay(moment(booking.event.date).day()) + " del mes"}
                onClick={() => this.onReiterative('confirm', booking)}>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-check" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z" />
                </svg>
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-arrow-repeat" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                </svg>
              </button>

            </div>
          </li>
        );
      })}
    </ul>);

  }

}
export default bookingList;
