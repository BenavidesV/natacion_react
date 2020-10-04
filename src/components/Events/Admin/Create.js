import React from 'react';
import { Button, Modal, Form, Col } from 'react-bootstrap';
import moment from 'moment';

class createEvent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleChangeDay = this.handleChangeDay.bind(this);

    this.state = {
      title: "",
      dateHour: "",
      dateDay: "1",
      dateMonth: "",
      description: "",
      capacity: ""
    }

  }
  handleClose() {
    this.props.handleClose();
  }
  handleChangeDay() {
    this.props.handleChangeDay();
  }
  componentDidMount() {

  }
  handleChange(e) {
    this.setState({ [e.target.id]: e.target.value })
  }
  sendForm() {
    const title = this.state.title;
    const description = this.state.description;
    const capacity = parseInt(this.state.capacity);
    const dateMonth = moment(this.state.dateMonth).format('MM');
    const dateYear = moment(this.state.dateMonth).format('YYYY');
    const dateHour = this.state.dateHour;
    const dateDay = this.state.dateDay;

    this.props.modalConfirmHandler(title, description, capacity, dateMonth, dateYear, dateHour, dateDay);
  }



  render() {
    return <Modal
      show={this.props.setShow}
      onHide={this.props.handleClose}
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
              value={this.state.title}
              onChange={this.handleChange.bind(this)}
              type="text"
            />
          </Form.Group>

          <Form.Row>
            <Col>
              <Form.Group
                
                onChange={this.props.handleChangeDay}
              >
                <Form.Label>Seleccione el día</Form.Label>
                <Form.Control as="select" id="dateDay" value={this.state.dateDay} onChange={this.handleChange.bind(this)}>
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
                  id="dateMonth"
                  value={this.state.dateMonth}
                  onChange={this.handleChange.bind(this)}
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
              value={this.state.dateHour}
              onChange={this.handleChange.bind(this)}
            >
            </Form.Control>
          </Form.Group>
          <Form.Row>
            <Col>
              <Form.Group>
                <Form.Label>Capacidad máxima</Form.Label>
                <Form.Control
                  id="capacity"
                  value={this.state.capacity}
                  onChange={this.handleChange.bind(this)}
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
              value={this.state.description}
              onChange={this.handleChange.bind(this)}
              as="textarea"

            />
          </Form.Group>
        </Form>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={this.props.modalCancelHandler}>
          Cancelar
          </Button>
        <Button variant="primary" onClick={() => this.sendForm()}>
          Guardar
          </Button>
      </Modal.Footer>
    </Modal>;
  }
}



export default createEvent;
