import React from 'react';
import { Button, Modal, Form, Badge } from 'react-bootstrap';
import moment from 'moment';
import Swimmer from '../Admin/Swimmer'
class UserEvent extends React.Component {
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
    sortRunways() {
        //const [c_bookings,setBookings] = useState({c_bookings: this.props.stateBookings});
        const sBookings = this.props.bookings;
        var r = [];
        for (let index = 1; index <= 6; index++) {
            r.push(
                <div className="row" key={r + index}>
                    <div className="col-1">{index}</div>

                    <div id={index} className="row col-11" ref={this.dragulaDecorator}>
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
        //console.log(JSON.stringify(r));
        return r;
    }
    render() {
        var sBookings = (this.state) ? this.state.bookings : this.props.bookings;
        console.log("desde render: " + JSON.stringify(sBookings));
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
                            >
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



export default UserEvent;