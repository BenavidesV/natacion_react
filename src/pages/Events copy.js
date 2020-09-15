import React, { Component } from 'react';
import WeekCalendar from 'react-week-calendar';
import '../style.less';
import moment from 'moment';

import Modal from '../components/Modal/Modal';
//import Button from 'react-bootstrap/Button';
//import Modal from 'react-bootstrap/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import './Events.css';
import ProgressBar from '../components/ProgressBar/ProgressBar';
import EventCell from '../components/Events/EventList/EventCell/EventCell';

class EventsPage extends Component {

  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
    reiterative: false,
    runway: 0,
    show: false,
    setShow: false

  };


  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
    this.capacityElRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };
  handleCheck = () => {
    this.setState({ reiterative: !this.state.reiterative });
    console.log(this.state.reiterative);
  };
  handleChange = (event) => {
    this.setState({ runway: parseInt(event.target.value, 10) });
  }
  handleClose = () => this.setState({ setShow: false });
  handleShow = () => this.setState({ setShow: true });

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;
    const capacity = parseInt(this.capacityElRef.current.value);

    if (
      title.trim().length === 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const event = { title, date, description };

    const token = this.context.token;
    var dateDay = moment(date);
    var dateMonth = moment(date).format('MM');
    var dateYear = moment(date).year();
    var dateHour = moment(date).format('HH:mm');
    var daysInMonth = moment(date).daysInMonth();
    var arrDays = [];
    var requestBody;

    if (this.state.reiterative) {
      while (daysInMonth) {
        var current = moment().date(daysInMonth);
        arrDays.push(current);
        daysInMonth--;
      }
      for (const day1 in arrDays) {

        var currentDate = moment((dateYear + "-" + dateMonth + "-" + (Number(day1) + 1) + "T" + dateHour), 'YYYY-MM-DD hh:mm');
        console.log(day1 + "**" + currentDate.format('YYYY-MM-DD hh:mm'));
        if (currentDate.day() === dateDay.day()) {
          console.log("Hay uno igual " + day1 + "/" + currentDate.format('YYYY-MM-DD hh:mm'));

          requestBody = {
            query: `
                mutation CreateEvent($title: String!, $desc: String!, $date: String!, $runway: Int!) {
                  createEvent(eventInput: {title: $title, description: $desc, date: $date, 
                    runway: $runway, capacity: $capacity}) {
                    _id
                    title
                    description
                    date
                    runway
                    capacity
                  }
                }
              `,
            variables: {
              title: title,
              desc: description,
              date: currentDate,
              runway: this.state.runway,
              capacity: capacity,
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
                updatedEvents.push({
                  _id: resData.data.createEvent._id,
                  title: resData.data.createEvent.title,
                  description: resData.data.createEvent.description,
                  date: resData.data.createEvent.date,
                  runway: resData.data.createEvent.runway,
                  capacity: resData.data.createEvent.capacity,
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

    } else {
      requestBody = {
        query: `
            mutation CreateEvent($title: String!, $desc: String!, $date: String!, 
              $runway: Int!, $capacity:Int!) {
              createEvent(eventInput: {title: $title, description: $desc, date: $date, 
                runway: $runway, capacity: $capacity}) {
                _id
                title
                description
                date
                runway
                capacity
              }
            }
          `,
        variables: {
          title: title,
          desc: description,
          date: date,
          runway: this.state.runway,
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
            console.log("created event: " + resData.data.createEvent);
            updatedEvents.push({
              _id: resData.data.createEvent._id,
              title: resData.data.createEvent.title,
              description: resData.data.createEvent.description,
              capacity: resData.data.createEvent.capacity,
              runway: resData.data.createEvent.runway,
              date: resData.data.createEvent.date,
              start: moment(resData.data.createEvent.date),
              end: moment(resData.data.createEvent.date).add(1, 'hours'),
              value: resData.data.createEvent.runway.toString(),
              suscribers: [],
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


  };

  modalCancelHandler = () => {
    this.setState({ show: false, creating: false, selectedEvent: null });
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
              runway
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
          //event['value'] = event.description;
          event['value'] = event.runway.toString();
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

    this.setState(prevState => {
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
    const requestBody = {
      query: `
          mutation BookEvent($id: ID!) {
            bookEvent(eventId: $id) {
              _id
             createdAt
             updatedAt
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
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState({ selectedEvent: null });
      })
      .catch(err => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>

        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (

          <Modal
            title="Crear evento"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirmar"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Nombre</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Fecha</label>
                <input type="datetime-local" id="date" ref={this.dateElRef} />
                <div>
                  <input
                    id="reiterative"
                    onChange={this.handleCheck}
                    value={this.state.reiterative}
                    type="checkbox">
                  </input>
                  <label htmlFor="date">Repetir todas las semanas</label>
                </div>
              </div>
              <div className="form-control">
                <label htmlFor="capacity">Capacidad máxima</label>
                <input
                  id="capacity"
                  ref={this.capacityElRef}
                  type="number"
                  min='1'>
                </input>
              </div>
              <div className="form-control">
                <label htmlFor="runway">Carril</label>
                <select onChange={this.handleChange}>
                  <option value='0'>seleccione un carril</option>
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                  <option value='5'>5</option>
                  <option value='6'>6</option>
                </select>
              </div>
              <div className="form-control">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  rows="4"
                  ref={this.descriptionElRef}
                />
              </div>
            </form>
          </Modal>


        )}
        {this.state.selectedEvent && (

          <Modal
            title={this.state.selectedEvent.title + "  " +
              new Date(this.state.selectedEvent.date).toLocaleDateString() + " "
              + new Date(this.state.selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? 'Reservar' : 'Confirmar'}
          >
            <p>{this.state.selectedEvent.description}</p>
            {this.state.selectedEvent.suscribers &&
              this.state.selectedEvent.suscribers.length > 0 && (
                <p>Inscritos: {this.state.selectedEvent.suscribers.length} personas</p>
              )}
            {this.state.selectedEvent.suscribers.length > 0 && this.context.userRole === "a" &&
              this.state.selectedEvent.suscribers.map((susc) =>
                <ProgressBar key={susc._id} value={10} description={susc.fullname} color="#8fbf27" max={100} />
              )}


          </Modal>
        )}
        {this.context.token && this.context.userRole === "a" && (
          <div className="events-control">
            <p>Piscina</p>
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
            <WeekCalendar
              selectedIntervals={this.state.events}
              startTime={moment({ h: 5, m: 0 })}
              endTime={moment({ h: 21, m: 0 })}
              scaleUnit={60}
              cellHeight={85}
              authUserId={this.context.userId}
              //onViewDetail={this.showDetailHandler}
              eventComponent={EventCell}
              //headerCellComponent={Header}
              onEventClick={this.showDetailHandler}
              useModal={false}
            />
          )}

      </React.Fragment>
    );
  }
}

export default EventsPage;
