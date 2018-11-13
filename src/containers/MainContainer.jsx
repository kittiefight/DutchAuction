import React, { Component } from "react";
import Section2 from "../components/Layout/Sections/Section2";
import DutchAuction from "../components/Layout/Sections/DutchAuction";
import Bid from "../components/Layout/Sections/Bid";
import Claim from "../components/Layout/Sections/Claim";
import Section7 from "../components/Layout/Sections/Section7";
import TeamMembers from "../components/Layout/Sections/Team/TeamMembers";
import AppConsumer from  "../context/AppConsumer";

import ScrollableAnchor from 'react-scrollable-anchor';

class MainContainer extends Component {
    render() {
        return (
            <div>
                <main>
                    <Section2 />
                    <DutchAuction />
                    <AppConsumer>
                    {(appProps) => (
                            <ScrollableAnchor id={'bidsection'}>
                                <Bid  appProps={appProps} />
                            </ScrollableAnchor>
                        )}
                    </AppConsumer>
                    <AppConsumer>                       
                        {(appProps) => (
                            <Claim appProps={appProps} />
                        )}
                    </AppConsumer>
                    <TeamMembers />
                    <Section7 />
                </main>
            </div>
        )
    }
}
export default MainContainer;
