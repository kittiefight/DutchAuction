import React, { Component } from "react";
import AppConsumer from "../../context/AppConsumer";


class Bonus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAvaliable: false,
            ... this.props
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        let { isHidden, appProps } = this.state;

            return (
                <p className="stikytext">
                        Bonus : 
                        <br/>
                        <span className="price">
                           Avaliable
                        </span>
                </p>
            )
    }

}

export default Bonus;