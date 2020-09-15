import React, { Component } from 'react';
import WeekCalendar from 'react-week-calendar';
import '../style.less';
import moment from 'moment';

import { Button, Modal, Container, Form, Col, Badge } from 'react-bootstrap';
import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import './Events.css';
//import './drag-util.js';
import EventCell from '../components/Events/EventList/EventCell/EventCell';
import Header from '../components/Header/Header';
import Dragula from 'react-dragula';

var dragula = require('react-dragula');
class EventsPage extends Component {

  state = {
    reiterative: false,
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
    show: false,
    setShow: false,
    day: -1,

  };


  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.dateHourElRef = React.createRef();
    this.dateDayElRef = React.createRef();
    this.dateMonthElRef = React.createRef();
    this.descriptionElRef = React.createRef();
    this.capacityElRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();

    var drake = dragula(Array.from(document.getElementsByClassName('cont-dragula')),
      {
        direction: 'horizontal',
        revertOnSpill: true,
      }
    );
    
  }
  componentDidUpdate() {

    dragula(Array.from(document.getElementsByClassName('cont-dragula')),
      {
        direction: 'horizontal',
        revertOnSpill: true,
      }
    );
  }
  registerControl = eventId => {
    
    this.setState(prevState => {
      const selectedEvent = eventId;
      //const selectedEvent = prevState.events.find(e => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };
  
  startCreateEventHandler = () => {
    this.setState({ creating: true, setShow: true });
  };
  handleCheck = () => {
    this.setState({ reiterative: !this.state.reiterative });
    console.log(this.state.reiterative);
  };

  handleChangeDay = (event) => {
    this.setState({ day: parseInt(event.target.value, 10) });
  }
  handleClose = () => this.setState({ setShow: false });
  handleShow = () => this.setState({ setShow: true });
  dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      let options = {};
      Dragula([componentBackingInstance], options);
    }
  };
  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const description = this.descriptionElRef.current.value;
    const capacity = parseInt(this.capacityElRef.current.value);
    const dateMonth = moment(this.dateMonthElRef.current.value).format('MM');
    const dateYear = moment(this.dateMonthElRef.current.value).format('YYYY');
    const dateHour = this.dateHourElRef.current.value;
    const dateDay = this.dateDayElRef.current.value;
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
    const event = { title, dateC, description };

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
      //console.log("fecha actual: "+todayDate+"currentDate: "+currentDate);
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

  modalCancelHandler = () => {
    this.setState({ setShow: false, show: false, creating: false, selectedEvent: null });
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
                         createdAt
                         updatedAt
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
                  console.log(resData);
                  //this.setState({ selectedEvent: null });
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
    }

  };
  confirmBookingHandler(eventId){
    console.log("Aqui debe ser");
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          mutation ConfirmBooking($id: ID!) {
            confirmBooking(eventId: $id) {
            _id
            }
          }
        `,
      variables: {
        id: eventId
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
        console.log("updated");
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };
  setRunway() {
    console.log("Suelta el boton");
  }
  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>

        {this.state.creating && (
          <Modal
            show={this.state.setShow}
            onHide={this.handleClose}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>Crear evento</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    id="title"
                    ref={this.titleElRef}
                    type="text"
                  />
                </Form.Group>

                <Form.Row>
                  <Col>
                    <Form.Group
                      controlId="weekday"
                      onChange={this.handleChangeDay}
                    >
                      <Form.Label>Seleccione el día</Form.Label>
                      <Form.Control as="select" ref={this.dateDayElRef}>
                        <option value='1'>Lunes</option>
                        <option value='2'>Martes</option>
                        <option value='3'>Miércoles</option>
                        <option value='4'>Jueves</option>
                        <option value='5'>Viernes</option>
                        <option value='6'>Sábado</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group
                    >
                      <Form.Label>Seleccione el mes</Form.Label>
                      <Form.Control
                        id="month"
                        ref={this.dateMonthElRef}
                        type="month"
                      >
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Form.Row>

                <Form.Group>
                  <Form.Label>Seleccione la hora</Form.Label>
                  <Form.Control
                    type="time"
                    id="dateHour"
                    ref={this.dateHourElRef}>
                  </Form.Control>
                </Form.Group>
                <Form.Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Capacidad máxima</Form.Label>
                      <Form.Control
                        id="capacity"
                        ref={this.capacityElRef}
                        type="number"
                        min='1'
                      />
                    </Form.Group>
                  </Col>
                </Form.Row>
                <Form.Group>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    id="description"
                    ref={this.descriptionElRef}
                    as="textarea"

                  />
                </Form.Group>
              </Form>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.modalCancelHandler}>
                Cancelar
          </Button>
              <Button variant="primary" onClick={this.modalConfirmHandler}>
                Guardar
          </Button>
            </Modal.Footer>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            show={this.state.setShow}
            onHide={this.handleClose}
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.state.selectedEvent.title + "  " +
                moment(this.state.selectedEvent.date).format("DD/MM/YYYY") + " "
                + new Date(this.state.selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>{this.state.selectedEvent.description}</p>
              <p>Capacidad máxima: {this.state.selectedEvent.capacity} personas</p>
              {this.state.selectedEvent.suscribers &&
                this.state.selectedEvent.suscribers.length > 0 && (
                  <div className="">
                    <h6 className="text-center">Inscritos</h6>
                    <div
                      className="container-fluid justify-content-center cont-dragula"
                      id="left1"
                      ref={this.dragulaDecorator}
                    >
                      <span>Pueden volver aqui</span><Badge>2019</Badge><Badge>2020</Badge>
                      {this.state.selectedEvent.suscribers.map(item =>
                        <Badge key={item._id} variant="primary">
                          {item.fullname}
                        </Badge>
                      )}
                    </div>

                    <div id="right1" className="container-fluid justify-content-center">
                      <h6 className="text-center">Asistentes</h6>
                      <div className="row">
                        <div className="col-1">1</div>
                        <div id='r1' className="cont-dragula row col-11" ref={this.dragulaDecorator}></div>
                      </div>
                      <div className="row">
                        <div className="col-1">2</div>
                        <div id='r2' className="cont-dragula row col-11" ref={this.dragulaDecorator}></div>
                      </div>
                      <div className="row">
                        <div className="col-1">3</div>
                        <div id='r3' className="cont-dragula row col-11" ref={this.dragulaDecorator}></div>
                      </div>
                      <div className="row">
                        <div className="col-1">4</div>
                        <div id='r4' className="cont-dragula row col-11" ref={this.dragulaDecorator}></div>
                      </div>
                      <div className="row">
                        <div className="col-1">5</div>
                        <div id='r5' className="cont-dragula row col-11" ref={this.dragulaDecorator}></div>
                      </div>
                      <div className="row">
                        <div className="col-1">6</div>
                        <div id='r6' className="cont-dragula row col-11" ref={this.dragulaDecorator}></div>
                      </div>

                    </div>
                  </div>
                )}
              {this.state.selectedEvent.suscribers.length > 0 && this.context.token &&
                this.state.selectedEvent.suscribers.map((susc) =>
                  <Badge key={susc._id} variant="primary">
                    {susc.fullname}
                  </Badge>
                )}

            </Modal.Body>
            <Modal.Footer>
              {this.context.userRole !== "a" && this.context.token && (
                <Form.Check type="checkbox" label="Evento concurrente" onChange={this.handleCheck} />
              )}
              <Button variant="secondary" onClick={this.modalCancelHandler}>
                Volver
              </Button>
              {this.state.selectedEvent.suscribers && this.context.userRole !== "a" &&
                this.state.selectedEvent.suscribers.length < this.state.selectedEvent.capacity && (
                  <Button variant="primary" onClick={this.bookEventHandler}>
                    {this.context.token ? 'Reservar' : 'Confirmar'}
                  </Button>
                )}
              {this.context.userRole === "a" && (
                <Button variant="primary" onClick={this.modalCancelHandler}>
                  Volver
                </Button>)}
            </Modal.Footer>
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
