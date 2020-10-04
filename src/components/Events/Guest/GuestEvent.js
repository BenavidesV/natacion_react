import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import moment from 'moment';
class guestEvent extends React.Component {
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
                <h6>Nadar es salud !</h6>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.props.modalCancelHandler}>
                    Volver
                </Button>
            </Modal.Footer>
        </Modal>
    }
}



export default guestEvent;