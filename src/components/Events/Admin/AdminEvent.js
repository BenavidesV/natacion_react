import React, { useState, useEffect } from 'react';
import { Button, Modal, Badge } from 'react-bootstrap';
import moment from 'moment';
import Swimmer from './Swimmer';
import './AdminEvent.css';
class AdminEvent extends React.Component {

    isActive = true;
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);

    }
    componentDidMount() {
        /*if (this.props.bookings) {
            this.setState({ bookings: this.props.bookings });
        }*/

        //this.state.bookings = this.props.bookings;
    }
    componentDidUpdate() {
        //this.props.handleUpdate();
        //this.setState(prevState => ({ bookings: prevState.bookings }));        
    };
    componentWillUnmount() {
        this.isActive = false;
        
    }
    handleClose() {
        this.props.handleClose();
    }
    swimmer(booking) {
        return (
            <Badge key={booking.user._id} id={booking.user._id} variant="primary">
                {booking.user.fullname}
            </Badge>
        );
    }

    sortRunways() {
        const sBookings = this.props.bookings;
        console.log("desde sort antes de ordenar: " + JSON.stringify(sBookings));
        var r = [];
        for (let index = 1; index <= 6; index++) {
            r.push(
                <div className="row" key={r + index}>
                    <div className="col-1 runway-class">{index}</div>
                    
                    <div id={index} className={'cont-dragula row col-11 row-'+index} ref={this.dragulaDecorator}>
                        {Array.isArray(sBookings) && sBookings.map(booking => {
                            if (booking.runway === index) {
                                return (<Swimmer key={booking.user._id} id={booking.user._id}
                                    individualBooking={booking}
                                ></Swimmer>);
                            }
                            return null;
                        })}
                    </div>
                </div>
            );

        }
        return r;
    }

    render() {
        var sBookings = (this.state) ? this.state.bookings : this.props.bookings;
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
                <p>Cupos disponibles: {this.props.selectedEvent.capacity - this.props.selectedEvent.suscribers.length} personas</p>
                {this.props.selectedEvent.suscribers &&
                    this.props.selectedEvent.suscribers.length > 0 && (
                        <div className="">
                            <h6 className="text-center">Inscritos ({this.props.selectedEvent.suscribers.length})</h6>
                            <div
                                className="container-fluid justify-content-center cont-dragula"
                                id='0'
                                ref={this.dragulaDecorator}
                            >
                                En espera: 
                                {sBookings && sBookings.map(item => {

                                    if (item.runway === 0) {
                                        return (<Swimmer key={item.user._id} id={item.user._id}
                                            individualBooking={item}
                                        ></Swimmer>);
                                    }
                                    return
                                }

                                )}
                            </div>

                            <div id="right1" className="container-fluid justify-content-center">
                                <h6 className="text-center">Asistentes</h6>
                                {this.sortRunways()}

                            </div>
                        </div>
                    )}

            </Modal.Body>
            <Modal.Footer>

                <Button variant="secondary" onClick={this.props.modalCancelHandler}>
                    Volver
                </Button>
                <Button variant="primary" onClick={this.props.checkList}>
                    Guardar
                </Button>

            </Modal.Footer>
        </Modal>
    }
}



export default AdminEvent;
