import React, { Component } from "react";
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import "./Admin.css";

class Admin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ethereumAddress : null,
            web3 : null,
            marketingPartnersTable : null,
            tokenreferralsTable : null,
            confirmSocialTx : null
        };

        this.confirmSocial = this.confirmSocial.bind(this);
        this.referralSignUp = this.referralSignUp.bind(this);
        this.inputChanged = this.inputChanged.bind(this);
        this.marketingPartners = this.marketingPartners.bind(this);
        this.tokenReferrals = this.tokenReferrals.bind(this);
        this.socialReferrals = this.socialReferrals.bind(this);
    }

    inputChanged = (e) => {
        console.log('Input Changed ', e);
        const target = e.target;
        console.log('Name : ', target.name, 'Value : ', e.target.value);
        this.setState({ [target.name] : e.target.value  });
        
    }

    socialReferrals = async (e) => {
        console.log('.... get socialrefrreals .... ');        
        const {auctionContract} = this.props.appProps;
        const response = await auctionContract.methods.SocialCampaigns(this.state.socialReferralsHash).call();
        console.log(response);

        const socialreferralsTable = this.buildSocialferralsTable(response);
        this.setState({ socialreferralsTable : socialreferralsTable })

    }

    tokenReferrals = async (e) => {
        console.log('.... get tokenReferrals .... ');        
        const {auctionContract} = this.props.appProps;
        const personalHash = await auctionContract.methods.calculatPersonalHash().call({ from : this.state.ethereumAddress });
        console.log(personalHash);
        const response = await auctionContract.methods.TokenReferrals(personalHash).call();
        console.log(response);
        const tokenreferralsTable = this.buildTokenreferralsTable(response);
        this.setState({ tokenreferralsTable : tokenreferralsTable })

    }


    marketingPartners = async (e) => {
        console.log('.... get Marketing Partners .... ');        
        const {auctionContract} = this.props.appProps;
        console.log(auctionContract);
        const response = await auctionContract.methods.MarketingPartners(this.state.marketingHash).call();
        console.log(response);
        const marketingPartnersTable = this.buildMarketingPartnersTable(response);
        this.setState({ marketingPartnersTable : marketingPartnersTable })

    }

    buildSocialferralsTable = (data) => {

        console.log('Build soclial refrrals Table ');

        // hash: "0x431b3175"
        // maxParticipators: "100"
        // tokenAmountForEach: "1000"
        
        return (
            <div>
                <hr />
                <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Hash
                        <span className="badge badge-primary badge-pill">{ data.hash }</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                            Max Participators
                        <span className="badge badge-primary badge-pill">{data.maxParticipators}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                            Token AmountForEach
                        <span className="badge badge-primary badge-pill">{data.tokenAmountForEach} KTY </span>
                    </li>
                </ul>
            </div>
        )

    }


    buildTokenreferralsTable = (data) => {
        // addr: "0x0000000000000000000000000000000000000000"
        // hash: "0x00000000"
        // totalReferrals: "0"
        // totalTokensEarned: "0"
        return (
            <div>
                <hr />
                <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                            Addr
                        <span className="badge badge-primary badge-pill">
                            {data.addr}
                        </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Hash
                        <span className="badge badge-primary badge-pill">{ data.hash }</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                            TotalReferrals
                        <span className="badge badge-primary badge-pill">{data.totalReferrals}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total TokensEarned
                        <span className="badge badge-primary badge-pill">{data.totalTokensEarned} KTY </span>
                    </li>
                </ul>
            </div>
        )

    }

    buildMarketingPartnersTable = (data) => {

        const { ethereumLastPrice } = this.props.appProps;

        return (

            <div>
                <hr />
                <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                            Addr
                        <span className="badge badge-primary badge-pill">
                            {data.addr}
                        </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Hash
                        <span className="badge badge-primary badge-pill">{ data.hash }</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Percentage
                        <span className="badge badge-primary badge-pill">{data.percentage}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total Contribution
                        <span className="badge badge-primary badge-pill">{data.totalContribution}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                        Total Referrals
                        <span className="badge badge-primary badge-pill">{data.totalReferrals}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                            EthEarned
                        <span className="badge badge-primary badge-pill">{data.EthEarned} Eth / {data.EthEarned * ethereumLastPrice } USD </span>
                    </li>
                </ul>
            </div>
        )

    }

    confirmSocial = (e) => {
        e.preventDefault();
        console.log('Confirm social ....');
        //this.setState({ confirmSocialTx : "0x89339040234823904" });

        const {web3} = this.state;
        const _userName = web3.utils.padRight(web3.utils.fromAscii(this.state.userName));
        const _tweetOrDiscord = web3.utils.padRight(web3.utils.fromAscii(this.state.tweetOrDiscord));
        console.log(_userName, _tweetOrDiscord);
    
        const {auctionContract} = this.props.appProps;
        console.log(auctionContract);

        auctionContract.methods.confirmSocial(this.state.campaignHash, _userName, _tweetOrDiscord  )
            .send({ 
                from: this.state.ethereumAddress
            })
            .on('transactionHash', (hash) => {
                this.setState({ confirmSocialTx : hash  });
                console.log('thash:  ', hash)
                NotificationManager.info(`Transaction Submited: hash : ${hash}`);
                this.setState({ tx : hash });
                this.setState({ BidConfirmModalOpen : true });
                this.setState({ transactionConfirmations: 0  });
            })
            .on('receipt',(receipt) => {
                console.log('recipt :  ', receipt);
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                if(this.state.transactionConfirmations === 0) {
                    console.log('confirmationNumber', confirmationNumber, receipt);
                    NotificationManager.success('Transaction Confirmed', 'Success');
                }
                this.setState({ transactionConfirmations: 1  });
            })
            .on('error', (error) => {
                console.log('error: ', error);
                NotificationManager.error('Error');
                this.setState({ transactionConfirmations: 0  });
        });

    }

    referralSignUp = (e) => {
        e.preventDefault();
        console.log('refferal Sign Up !!! ');
        // this.setState({ referallSignUpTx : "0x89339040234823904" });
        // return;

        const {auctionContract} = this.props.appProps;
        auctionContract.methods.referralSignup()
        .send({ 
            from: this.state.ethereumAddress
        })
        .on('transactionHash', (hash) => {
            console.log('thash:  ', hash)
            NotificationManager.info(`Transaction Submited: hash : ${hash}`);
            this.setState({ referallSignUpTx : hash });
            this.setState({ tx : hash });
            this.setState({ BidConfirmModalOpen : true });
            this.setState({ transactionConfirmations: 0  });
        })
        .on('receipt',(receipt) => {
            console.log('recipt :  ', receipt);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            if(this.state.transactionConfirmations === 0) {
                console.log('confirmationNumber', confirmationNumber, receipt);
                NotificationManager.success('Transaction Confirmed', 'Success');
            }
            this.setState({ transactionConfirmations: 1  });
        })
        .on('error', (error) => {
            console.log('error: ', error);
            NotificationManager.error('Error');
            this.setState({ transactionConfirmations: 0  });
    });
    }


    async componentDidMount () {

        console.log('Admin Page mount', this.props);

        let web3 = window.web3; 
        this.setState({web3 : web3});
        if (window.ethereum) {
            try {
                await window.ethereum.enable();
                this.setState({ ethereumAddress : window.ethereum.selectedAddress });

            } catch (error) {
                console.log('Error', error);
            }
        }
    }

    render() {

        const confirmSocialTrasactionLink =  "https://etherscan.io/tx/" + this.state.confirmSocialTx;
        const referralSignUpTrasactionLink =  "https://etherscan.io/tx/" + this.state.referallSignUpTx;


        return (
                <div>

                    <NotificationContainer/>
                    <div className="container">

                        <div className="row">
                            <div className="col">
                                <h1> Marketing Admin </h1>
                                <p>Account : {this.state.ethereumAddress} </p>
                            </div>
                        </div>

                        <div className="row" id="section4">

                            <div className="col">
                                <input 
                                    name="campaignHash"
                                    onChange={this.inputChanged}
                                    className="form-control form-control-lg" 
                                    type="text" 
                                    placeholder="Campaign Hash" 
                                    />
                            </div>
                            <div className="col">
                                <input
                                    name="userName"  
                                    onChange={this.inputChanged}
                                    className="form-control form-control-lg" 
                                    type="text" 
                                    placeholder="UserName" />
                                </div>
                            <div className="col">
                                <input 
                                    name="tweetOrDiscord"
                                    onChange={this.inputChanged}
                                    className="form-control form-control-lg" 
                                    type="text" 
                                    placeholder="Tweet Or Discord" />
                            </div>
                            <div className="col">
                                <div className="card">
                                    <div className="card-body">
                                        <button onClick={this.confirmSocial}>
                                            Confirm Social
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-12">
                                    { this.state.confirmSocialTx &&
                                       <h3 className="etherscantext"> <a href={confirmSocialTrasactionLink}> See Transaction On Ethersacn ...  </a></h3>
                                    }
                            </div>
                        </div>

                        <div className="row" id="section4">
                            <div className="col">
                                <div className="card">
                                    <div className="card-body">
                                        <button  onClick={this.referralSignUp}>
                                            KTY Token Referral SignUp 
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12">
                                    { this.state.referallSignUpTx &&
                                       <h3 className="etherscantext"> <a href={referralSignUpTrasactionLink}> See Transaction On Ethersacn ...  </a></h3>
                                    }
                            </div>
                        </div>


                        <div className="row" id="section4">
                            <div className="col-md-6">
                                <input 
                                    name="marketingHash"
                                    onChange={this.inputChanged}
                                    className="form-control form-control-lg" 
                                    type="text" 
                                    placeholder="hash" />
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <button  onClick={this.marketingPartners}>
                                           Marketing Partners
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12"> 
                                    { this.state.marketingPartnersTable }
                            </div>
                        </div>

                        <div className="row" id="section4">
                            <div className="col-md-6">
                                <input 
                                    name="tokenReferralsHash"
                                    value={this.state.ethereumAddress}
                                    onChange={this.inputChanged}
                                    className="form-control form-control-lg" 
                                    type="text" 
                                    placeholder="hash" />
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <button  onClick={this.tokenReferrals}>
                                           Token Referrals
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12"> 
                                    { this.state.tokenreferralsTable }
                            </div>
                        </div>

                         <div className="row" id="section4">
                            <div className="col-md-6">
                                <input 
                                    name="socialReferralsHash"
                                    onChange={this.inputChanged}
                                    className="form-control form-control-lg" 
                                    type="text" 
                                    placeholder="hash" />
                            </div>
                            <div className="col-md-6">
                                <div className="card">
                                    <div className="card-body">
                                        <button  onClick={this.socialReferrals}>
                                            Social Campaigns
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-12"> 
                                    { this.state.socialreferralsTable }
                            </div>
                        </div>
                        

                    </div>
                </div>
        )
    }
}
export default Admin;
