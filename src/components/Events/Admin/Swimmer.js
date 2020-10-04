import React from 'react';
import { Badge } from 'react-bootstrap';

class swimmer extends React.Component {
    
    render() {
        return(<Badge key={this.props.individualBooking.user._id} id={this.props.individualBooking.user._id} variant="primary">
        {this.props.individualBooking.user.fullname}
    </Badge>);
        
    }
}



export default swimmer;
