import React, { Component } from "react";
import AppConsumer from "../../context/AppConsumer";


class AuctionStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHidden: true,
            ... this.props
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        let { isHidden, appProps } = this.state;
        let { amountUpForAuction, totalBonusTokens , auctionStage , currentBidders } = appProps;

        let auctionTokens = (amountUpForAuction - totalBonusTokens)/ 1000000;

        if (appProps.auctionTimeremaining < 0) {
            return (
                <p className="stikytext">
                    Auction Status : <span className="price"> {appProps.auctionStage} &nbsp;</span>
                    <br />
                    Bidding Status: <span className="price">{appProps.currentBidders} bidders own {auctionTokens} million tokens.</span>
                </p>
            )
        } else {
            return (
                <p className="stikytext">Auction Starts in : </p>
            )
        }
    }

}

export default AuctionStats;