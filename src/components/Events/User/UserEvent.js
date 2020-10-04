import React from 'react';
import { Button, Modal, Form, Badge } from 'react-bootstrap';
import moment from 'moment';
class createEvent extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);        
    }
    
    handleClose() {
        this.props.handleClose();
    }
    handleChangeDay() {
        this.props.handleChangeDay();
    }
    render() {
        return <Modal
            show={this.props.setShow}
            onHide={this.props.handleClose}
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>{this.props.selectedEvent.title + "  " +
                    moment(this.props.selectedEvent.date).format("DD/MM/YYYY") + " "
                    + new Date(this.props.selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{this.props.selectedEvent.description}</p>
                <p>Cupos disponibles: {this.props.selectedEvent.capacity-this.props.selectedEvent.suscribers.length} personas</p>
                {this.props.selectedEvent.suscribers &&
                    this.props.selectedEvent.suscribers.length > 0 && (
                        <div className="">
                            <h6 className="text-center">Inscritos ({this.props.selectedEvent.suscribers.length})</h6>
                            <div
                                className="container-fluid justify-content-center "
                                id='0'

                            >
                                <span>Pueden volver aqui</span>
                                {this.props.selectedEvent.suscribers.map(item =>
                                    <Badge key={item._id} id={item._id} variant="primary">
                                        {item.fullname}
                                    </Badge>
                                )}
                            </div>

                            <div id="right1" className="container-fluid justify-content-center">
                                <h6 className="text-center">Asistentes</h6>
                                <div className="row">
                                    <div className="col-1">1</div>
                                    <div id='1' className="row col-11" ></div>
                                </div>
                                <div className="row">
                                    <div className="col-1">2</div>
                                    <div id='2' className="row col-11" ></div>
                                </div>
                                <div className="row">
                                    <div className="col-1">3</div>
                                    <div id='3' className="row col-11" ></div>
                                </div>
                                <div className="row">
                                    <div className="col-1">4</div>
                                    <div id='4' className="row col-11" ></div>
                                </div>
                                <div className="row">
                                    <div className="col-1">5</div>
                                    <div id='5' className="row col-11" ></div>
                                </div>
                                <div className="row">
                                    <div className="col-1">6</div>
                                    <div id='6' className="row col-11" ></div>
                                </div>

                            </div>
                        </div>
                    )}

            </Modal.Body>
            <Modal.Footer>
                <Form.Check type="checkbox" label="Evento concurrente" onChange={this.props.handleCheck} />
                <Button variant="secondary" onClick={this.props.modalCancelHandler}>
                    Volver
                </Button>
                {this.props.today <= this.props.selectedEvent.date && (
                    <Button variant="primary" onClick={this.props.bookEventHandler}>
                        Reservar
                    </Button>
                )}


            </Modal.Footer>
        </Modal>
    }
}



export default createEvent;