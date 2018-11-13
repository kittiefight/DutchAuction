import React, { Component } from "react";
import AppConsumer from "../../context/AppConsumer";
import "./index.scss";
import FlipClock from "./FlipClock";

class Clock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ... this.props
        };
    }

    componentDidMount() {
       
    }

    componentWillUnmount() {
        
    }

    render() {

        let { auctionTimeremaining, auctionStartDateClock  } = this.state.appProps;

        if(auctionTimeremaining > 0 ) {
            return (
                <div className="clockbox" style={{ width: 270 }} >
                    <FlipClock
                        type="countdown"
                        count_to={auctionStartDateClock}
                    />
                </div>
            )
        }else{
            return (
                <div className="clockbox" style={{ width: 270 }} >
                    <FlipClock
                        type="countup"
                        count_from={auctionStartDateClock}
                    />
                </div>
            )
        }
    }
}

export default Clock;