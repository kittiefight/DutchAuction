import React, { Component } from "react";
import Modal from "react-responsive-modal";


class BidConfirmModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,
            ... this.props
        };
    }

    componentDidMount = () => {

    }

    componentWillUnmount() {

    }


    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };

    
    render() {
        const { open } = this.state;
        return (
            <div>
                <Modal open={open} onClose={this.onCloseModal} center>
                    <header id="main-header">
                        <div className="container">
                            <div className="container-fluid header">
                                <div className="row align-items-center">
                                    <div className="col-md-12 title">
                                        <h2>
                                            <span className="name">
                                                <a href="https://discordapp.com/invite/rgQ5F3R">
                                                    Join us on dicord while you wait to claim tokens
                                                    </a>
                                            </span>
                                        </h2>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="row note">
                                            Transaction sent ...
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

export default BidConfirmModal;