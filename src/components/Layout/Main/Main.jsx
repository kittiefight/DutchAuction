import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import MainContainer from "../../../containers/MainContainer"
import WalletContainer from "../../../containers/WalletContainer";
import TestContainer from "../../../containers/Testcontainer";

class Main extends Component {
    
    render() {

        return (
            <div>
                <Switch>
                        <Route path="/" exact={true} component={MainContainer} />
                        <Route path="/wallet" component={WalletContainer} />
                        <Route path="/test" component={TestContainer} />
                </Switch>
                
            </div>
        );
    }
}

export default Main;
