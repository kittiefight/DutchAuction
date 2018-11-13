import React, { Component } from "react";
import Modal from "react-responsive-modal";
import AppConsumer from "../../context/AppConsumer";


class Popup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            days: "0",
            hours: "00",
            minutes: "00",
            seconds: "00",
            timerInterval: null,
            ... this.props
        };
    }

    componentDidMount = () => {
        if(this.state.appProps.auctionTimeremaining > 0) {
            this.setState({ open : true });
        }
        this.cowntDownTimer(this.state.appProps.auctionStartDateClock);
        this.setState({
            timerInterval: setInterval(() => {
                this.cowntDownTimer(this.state.appProps.auctionStartDateClock);
            }, 1000 * 60)
        })
    }

    componentWillUnmount() {
        clearInterval(this.state.timerInterval);
    }


    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    // To Do:  move to separate helpher class , == Dublicated function
    cowntDownTimer(endDate) {
        let days, hours, minutes, seconds;
        endDate = new Date(endDate).getTime();
        if (isNaN(endDate)) {
            return;
        }
        let startDate = new Date();
        startDate = startDate.getTime();

        let timeRemaining = parseInt((endDate - startDate) / 1000, 10);
        if(timeRemaining < 0) {
            this,this.setState({ open : false });
            clearInterval(this.state.timerInterval);
        }


        if(timeRemaining < 0) {
            this.setState({ open: false })
        }

        if (timeRemaining >= 0) {
            days = parseInt(timeRemaining / 86400, 10);
            timeRemaining = (timeRemaining % 86400);

            hours = parseInt(timeRemaining / 3600, 10);
            timeRemaining = (timeRemaining % 3600);

            minutes = parseInt(timeRemaining / 60, 10);
            timeRemaining = (timeRemaining % 60);

            this.setState({ days: parseInt(days, 10) });
            this.setState({ hours: ("0" + hours).slice(-2) });
            this.setState({ minutes: ("0" + minutes).slice(-2) });
            this.setState({ seconds: ("0" + seconds).slice(-2) });

        } else {
            return;
        }
    }

    render() {
        const { open, days, hours, minutes, seconds } = this.state;
        return (
            <div>
                <Modal open={open} onClose={this.onCloseModal} center>
                    <header id="main-header">
                        <div className="container">
                            <div className="container-fluid header">
                                <div className="row align-items-center">
                                    <div className="col-sm-12 col-md-7 col-xs-12 title">
                                        <h2>
                                            <span className="name">KittieFight</span>
                                            <br />
                                            Dutch Auction Starts
                                        </h2>
                                    </div>
                                    <div className="col-sm-12 col-md-5 col-xs-12">
                                        <div className="row timer">
                                            <div className="col days">
                                                <p>{days}</p>
                                                <span className="lead">days</span>
                                            </div>
                                            <div className="col hours">
                                                <p>{hours}</p>
                                                <span className="lead">hrs</span>
                                            </div>
                                            <div className="col minutes">
                                                <p>{minutes} </p>
                                                <span className="lead">mins</span>
                                            </div>
                                        </div>
                                        <div className="row note">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                </Modal>
            </div>
        );
    }
}

export default Popup;