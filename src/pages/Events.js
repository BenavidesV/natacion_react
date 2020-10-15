import React, { Component, useState, useEffect } from 'react';
import WeekCalendar from 'react-week-calendar';
import '../style.less';
import moment from 'moment';

import { Container } from 'react-bootstrap';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import './Events.css';
import EventCell from '../components/Events/EventList/EventCell/EventCell';
import Header from '../components/Header/Header';
import Create from '../components/Events/Admin/Create';
import AdminEvent from '../components/Events/Admin/AdminEvent';
import UserEvent from '../components/Events/User/UserEvent';
import GuestEvent from '../components/Events/Guest/GuestEvent';
import Dragula from 'react-dragula';

var dragula = require('react-dragula');
class EventsPage extends Component {

  state = {
    reiterative: false,
    creating: false,
    events: [],
    bookings: [],
    isLoading: false,
    selectedEvent: null,
    show: false,
    setShow: false,
    day: -1,

  };


  isActive = true;

  static contextType = AuthContext;


  componentDidMount() {
    this.fetchEvents();

  }
  componentDidUpdate() {
    var drake = dragula(Array.from(document.getElementsByClassName('cont-dragula')),
      {
        direction: 'horizontal'
      }
    );
    drake.on('drop', (el, target) => {
      this.setRunway(el.id, Number.parseInt(target.id, 10));
    });

  }

  startCreateEventHandler = () => {
    this.setState({ creating: true, setShow: true });
  };
  handleCheck = () => {
    this.setState({ reiterative: !this.state.reiterative });
  };

  handleChangeDay = (event) => {
    this.setState({ day: parseInt(event.target.value, 10) });
  }
  handleClose = () => this.setState({ setShow: false, selectedEvent: null });
  handleShow = () => this.setState({ setShow: true });
  dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      let options = {};
      Dragula([componentBackingInstance], options);
    }
  };

  modalCancelHandler = () => {
    this.setState({ setShow: false, show: false, creating: false, selectedEvent: null });
  };
  modalConfirmHandler = (title, description, capacity, dateMonth, dateYear, dateHour, dateDay) => {
    this.setState({ creating: false });
    const todayDate = moment();

    if (
      title.trim().length === 0 ||
      dateMonth.length === 0 ||
      dateYear.length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }
    var dateC = moment((dateYear + "-" + dateMonth + "-" + 1 + "T" + dateHour), 'YYYY-MM-DD hh:mm');

    const token = this.context.token;

    var daysInMonth = moment(dateC).daysInMonth();
    var arrDays = [];
    var requestBody;

    while (daysInMonth) {
      var current = moment().date(daysInMonth);
      arrDays.push(current);
      daysInMonth--;
    }

    for (const day1 in arrDays) {

      var currentDate = moment((dateYear + "-" + dateMonth + "-" + (Number(day1) + 1) + "T" + dateHour), 'YYYY-MM-DD hh:mm');
      if (currentDate.day() == dateDay && currentDate >= todayDate) {

        requestBody = {
          query: `
                mutation CreateEvent($title: String!, $desc: String!, $date: String!, $capacity: Int!) {
                  createEvent(eventInput: {title: $title, description: $desc, date: $date, 
                    capacity: $capacity}) {
                    _id
                    title
                    description
                    date
                    capacity
                  }
                }
              `,
          variables: {
            title: title,
            desc: description,
            date: currentDate,
            capacity: capacity
          }
        };
        fetch('http://localhost:8000/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          }
        })
          .then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
            return res.json();
          })
          .then(resData => {
            this.setState(prevState => {
              const updatedEvents = [...prevState.events];
              //console.log( JSON.stringify(resData) );
              updatedEvents.push({
                _id: resData.data.createEvent._id,
                title: resData.data.createEvent.title,
                description: resData.data.createEvent.description,
                date: resData.data.createEvent.date,
                capacity: resData.data.createEvent.capacity,
                start: moment(resData.data.createEvent.date),
                end: moment(resData.data.createEvent.date).add(1, 'hours'),
                suscribers: [],
                value: resData.data.createEvent.description.toString(),
                creator: {
                  _id: this.context.userId
                }
              });
              return { events: updatedEvents };
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    }


  };

  fetchEvents() {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              capacity
              creator {
                _id
                email
              }
              suscribers{
                email
                fullname
                _id
              }
            }
          }
        `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        events.forEach(event => {
          event['start'] = moment(event.date);
          event['end'] = moment(event.date).add(1, 'hours');
          event['value'] = event.description;
          //event['value'] = event.runway.toString();
        });
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = eventId => {
    this.setState({ setShow: true });
    if (this.context.token) {
      this.getBookings(eventId._id);
    }

    this.setState(() => {
      const selectedEvent = eventId;
      //const selectedEvent = prevState.events.find(e => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });

  };

  bookEventHandler = () => {

    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    console.log("En bookEventHandler: " + this.state.reiterative);
    if (this.state.reiterative) {

      const requestBodyEvents = {
        query: `
            query {
              events {
                _id
                title
                description
                date
                capacity
                creator {
                  _id
                  email
                }
                suscribers{
                  email
                  fullname
                  _id
                }
              }
            }
          `,
        variables: {
          selectedEventDate: this.state.selectedEvent.date
        }
      };
      fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBodyEvents),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error('Failed!');
          }
          return res.json();
        })
        .then(resData => {
          const reiterativeEvents = resData.data.events;
          reiterativeEvents.forEach(event => {
            event['start'] = moment(event.date);
            event['end'] = moment(event.date).add(1, 'hours');
            event['value'] = event.description;
            console.log(moment(event.date) >= moment(this.state.selectedEvent.date) +
              "day(): " + moment(event.date).day() === moment(this.state.selectedEvent.date).day() +
              "month: " + moment(event.date).month() === moment(this.state.selectedEvent.date).month() +
              "hour: " + moment(event.date).hour() === moment(this.state.selectedEvent.date).hour() +
              "year: " + (moment(event.date).year() === moment(this.state.selectedEvent.date).year()));
            if (moment(event.date) >= moment(this.state.selectedEvent.date) &&
              (moment(event.date).day() === moment(this.state.selectedEvent.date).day()) &&
              (moment(event.date).month() === moment(this.state.selectedEvent.date).month()) &&
              (moment(event.date).hour() === moment(this.state.selectedEvent.date).hour()) &&
              (moment(event.date).year() === moment(this.state.selectedEvent.date).year())) {

              const requestB = {
                query: `
                      mutation BookEvent($id: ID!) {
                        bookEvent(eventId: $id) {
                          _id
                          user {
                            _id
                            email
                            fullname
                          }
                        }
                      }
                    `,
                variables: {
                  id: event._id
                }
              };

              fetch('http://localhost:8000/graphql', {
                method: 'POST',
                body: JSON.stringify(requestB),
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + this.context.token
                }
              })
                .then(res => {
                  if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                  }
                  return res.json();
                })
                .then(resData => {
                  var newBooking = {
                    _id: resData.data.bookEvent.user._id,
                    email: resData.data.bookEvent.user.email,
                    fullname: resData.data.bookEvent.user.fullname
                  };
                  if (!event.suscribers.filter(function (e) { return e._id === newBooking._id; }).length > 0) {
                    event.suscribers.push(
                      newBooking
                    )
                  }
                })
                .catch(err => {
                  console.log(err);
                });

            }
          });
          this.setState({ selectedEvent: null });

          if (this.isActive) {
            this.setState({ events: reiterativeEvents, isLoading: false });
          }
        })
        .catch(err => {
          console.log(err);
          if (this.isActive) {
            this.setState({ isLoading: false });
          }
        });


    } else {
      const stateEvents = this.state.events;
      const requestBody = {
        query: `
            mutation BookEvent($id: ID!) {
              bookEvent(eventId: $id) {
                _id
                user{
                  _id
                  email
                  fullname
                }
                event{
                  _id
                }
              }
            }
          `,
        variables: {
          id: this.state.selectedEvent._id
        }
      };

      fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.context.token
        }
      })
        .then(res => {
          if (res.status !== 200 && res.status !== 201) {
            alert("Usted ya estaba registrado");
            throw new Error('Failed!');

          }
          return res.json();
        })
        .then(resData => {

          stateEvents.forEach(element => {
            var newBooking = {
              _id: resData.data.bookEvent.user._id,
              email: resData.data.bookEvent.user.email,
              fullname: resData.data.bookEvent.user.fullname
            };
            if (!element.suscribers.filter(function (e) { return e._id === newBooking._id; }).length > 0) {
              element.suscribers.push(
                newBooking
              )
            }
          });

          this.setState({ events: stateEvents, selectedEvent: null });
        })
        .catch(err => {
          console.log(err);
        });
    }

  };

  setRunway(currentUserId, runwaySelected) {

    var currentBookings = [...this.state.bookings];
    const list = currentBookings.map((element, i) => {

      if (element.user._id === currentUserId) {
        element.runway = runwaySelected;
        element.attendance = true;
        if (runwaySelected === 0) element.attendance = false;
      }
    });
    /*if (this.isActive) {
      this.setState(prevState => ({
        bookings: {
          ...prevState.bookings,
          [prevState.bookings]: currentBookings,
        },
      }));
      //this.setState({bookings: null});
      //this.setState({bookings: currentBookings});  
    }*/

    console.log("desde setRunway: " + JSON.stringify(this.state.bookings));
    //this.handleUpdate(this.state.bookings);
    //return currentBookings;
    //this.checkList();

  }
  componentWillUnmount() {
    this.isActive = false;
    var drake = dragula(Array.from(document.getElementsByClassName('cont-dragula')));
    drake.destroy();
  }
  getBookings(eventId) {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          mutation EventBookings($eventId: ID!) {
            eventBookings(eventId: $eventId) {
            _id
            attendance
            runway
            user{
              _id
              fullname
            }
            }
          }
        `,
      variables: {
        eventId: eventId
      }
    };


    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        //var stateEvents = this.state.events;

        this.setState({ bookings: resData.data.eventBookings, isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  }
  checkList = () => {
    //this.setState({ isLoading: true });
    var stateBookings = this.state.bookings;
    stateBookings.map(booking => {
      if (booking.runway === null) {
        booking.runway = 0;
      }
      const requestBody = {
        query: `
            mutation checkList($bookingId: ID!, $runwaySelected: Int) {
              checkList(bookingId: $bookingId, runwaySelected: $runwaySelected) {
              _id
              attendance
              runway
              user{
                _id
              }
              }
            }
          `,
        variables: {
          bookingId: booking._id,
          runwaySelected: booking.runway
        }

      };
      fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.context.token
        }
      })
        .then(res => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error('Failed!');
          }
          return res.json();
        })
        .then(resData => {
          console.log("pasa por aqui");
          this.setState({ isLoading: false, selectedEvent: null, creating: false });
          this.handleUpdate(stateBookings);
          return ("Updated!");
        })
        .catch(err => {
          console.log(err);
          this.setState({ isLoading: false });

        });
      return;
    })
  };

  handleUpdate = (updatedBookings) => {
    this.setState({ bookings: updatedBookings });
  }

  render() {
    return (
      <React.Fragment>

        {this.state.creating && (
          <Create
            setShow={this.state.setShow}
            handleChangeDay={this.handleChangeDay}
            handleClose={this.handleClose}
            modalCancelHandler={this.modalCancelHandler}
            modalConfirmHandler={this.modalConfirmHandler}
          >
          </Create>
        )}
        {this.state.selectedEvent && this.context.token && this.context.userRole === "a" && (
          <AdminEvent
            setShow={this.state.setShow}
            handleClose={this.handleClose}
            modalCancelHandler={this.modalCancelHandler}
            bookEventHandler={this.bookEventHandler}
            selectedEvent={this.state.selectedEvent}
            bookings={this.state.bookings}
            checkList={this.checkList}
            handleUpdate={this.handleUpdate}
          ></AdminEvent>
        )}
        {this.state.selectedEvent && this.context.token && this.context.userRole !== "a" && (
          <UserEvent
            setShow={this.state.setShow}
            handleClose={this.handleClose}
            handleCheck={this.handleCheck}
            modalCancelHandler={this.modalCancelHandler}
            bookEventHandler={this.bookEventHandler}
            selectedEvent={this.state.selectedEvent}
            bookings={this.state.bookings}
            today={moment().format()}
          ></UserEvent>
        )}
        {this.state.selectedEvent && !this.context.token && (
          <GuestEvent
            setShow={this.state.setShow}
            handleClose={this.handleClose}
            modalCancelHandler={this.modalCancelHandler}
            bookEventHandler={this.bookEventHandler}
            selectedEvent={this.state.selectedEvent}
          ></GuestEvent>
        )}
        {this.context.token && this.context.userRole === "a" && (
          <div className="events-control">
            <p><svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-bookmark-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2z" />
            </svg>   Administración</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Crear evento
            </button>
          </div>
        )}
        {this.state.isLoading && (
          <Spinner />
        )}
        {!this.state.isLoading && this.state.selectedEvent === null
          && !this.state.creating && (

            <Container className="fluid">
              <WeekCalendar
                selectedIntervals={this.state.events}
                startTime={moment({ h: 5, m: 0 })}
                endTime={moment({ h: 21, m: 0 })}
                scaleUnit={60}
                cellHeight={85}
                authUserId={this.context.userId}
                eventComponent={EventCell}
                headerCellComponent={Header}
                onEventClick={this.showDetailHandler}
                useModal={false}
              //dayFormat={('es-ES', "dd   DD/MM/YYYY")}
              /></Container>
          )}

      </React.Fragment>
    );
  }
}

export default EventsPage;
