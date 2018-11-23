import React, { Component } from "react";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Loading from "../Loading/Loading";

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = {
            statesLoaded : false,
            setStateInterval : null
        };
    }

    componentDidMount() {
        const setStateInterval =  setInterval(() => {
            this.setState({ statesLoaded : this.props.appProps.statesLoaded });
            if(this.props.appProps.statesLoaded) clearInterval(this.state.setStateInterval);
        }, 1000 )
        this.setState({setStateInterval});
    }

    componentWillUnmount() {
        clearInterval(this.state.setStateInterval);
    }

    render() {

        if(!this.state.statesLoaded) {
            return  ( <Loading /> )
        }

        return (
            <div className="Layout">

                {/* <div className="fixed-top"> 
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-6">
                                No Metamask or web3 browser detected ...    
                            </div>
                        </div>
                    </div>
                </div>  */}

                {/* <AppConsumer>
                    {(appProps) => ( <Popup appProps={appProps} />  )}
                </AppConsumer>
                <StickyHeader enabled={true} />
                <AppConsumer>
                        {(appProps) => ( <Header appProps={appProps} /> )}
                </AppConsumer> */}

                <Main />
               
            </div>
        );
    }
}

export default Layout;
