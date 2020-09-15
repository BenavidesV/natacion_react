import React from "react";
import PropTypes from "prop-types";
import styled from 'styled-components';

import swimming from './swimming.png';
const Container = styled.div`
progress[value]{
    width: ${props => props.width};
    appearance: none;

    ::-webkit-progress-bar{
        height: 10px;
        border-radius: 20px;
        background-color: #eee;
    }

    ::-webkit-progress-value{
        height: 10px;
        border-radius: 20px;
        background-color: ${props => props.color};
    }
}
`;
const ProgressBar =  props => {
    const {value, max, description, color, width}=props;

    return (
        <Container color={color} width={width}>
            
        </Container>
    )
};
ProgressBar.propTypes = {
    value: PropTypes.number.isRequired,
    max: PropTypes.number
};

ProgressBar.defaultProps = {
    max:100
};

export default ProgressBar;