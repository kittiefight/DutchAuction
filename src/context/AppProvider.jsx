import React, { Component } from "react";
import Web3 from "web3";
import AppContext from "./AppContext";
import axios from 'axios';
import { abi as tokenAbi } from "../contracts/KittiefightToken.json";
import { abi as auctionAbi } from "../contracts/Dutchwrapper.json";
import { abi as promissoryTokenAbi } from "../contracts/PromissoryToken.json";

import {formatDate } from "../helper/DateUtils";

const HOST = process.env.REACT_APP_BLOCKCHAIN_HOST;
const TOKEN_CONTRACT_ADDRESS = process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS;
const AUCTION_CONTRACT_ADDRESS = process.env.REACT_APP_AUCTION_CONTRACT_ADDRESS;
const POMISSORYTOKEN_CONTRACT_ADDRESS = process.env.REACT_APP_POMISSORYTOKEN_CONTRACT_ADDRESS;
const CURRENT_DATE = (new Date()).toString();

console.log('APP HOST IS ::: ', HOST, 'Token address :', TOKEN_CONTRACT_ADDRESS, 'Auction address :', AUCTION_CONTRACT_ADDRESS);


function getWeb3Provider() {
    if (HOST) {
        return new Web3.providers.HttpProvider(HOST);
    } else if (window.web3) {
        return window.web3.currentProvider;
    } else {
        return new Web3.providers.HttpProvider(HOST);
    }
}

const web3 = new Web3(getWeb3Provider());


const auctionTypes = {
    0: "Deployed",
    1: "SetUp",
    2: "Started",
    3: "Ended",
    4: "Started"
}

class AppProvider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            auctionStartDate: null,
            auctionEndDate: null,
            networkLaunchDay : null,
            setAuctionEndDate: (date) => {
                this.auctionStartDate = date;
            },
            auctionStartTime: null, // Formatted
            auctionEndTime: null, // Formatted 
            currentDate: null,
            web3: null,
            myAccounts: [],
            myBalance: 0,
            tokenAbi: tokenAbi,
            auctionAbi: auctionAbi,
            tokens: [],
            tokenContract: null,
            auctionContract: null,
            kittieFightTokenEconomy: 0,
            amountUpForAuction: 0,
            totalBonusTokens : 0,
            startPrice: 0,
            decreaseRate: 0,
            currentPrice: 0,
            currentBidders: 0,
            auctionCeiling: 0,
            auctionStage: '',
            totalReceived: 0,
            startBlock: 0,
            latestBlock: 0,
            number: 10,
            inc: () => {
                this.setState({ number: this.state.number + 1 })
            },
            walletIsMetamask: false,
            networkName: '',
            statesLoaded: false,
            auctionStartDateClock : Date.parse('2018-11-12T19:00:00Z'),
            //auctionStartDateClock : Date.parse('2018-11-07T14:00:00Z'),
            auctionTimeremaining: 0,
            promissoryTokenLastPrice: 0,
            ethereumLastPrice : 0,
            ktyTokenPriceUSD : 0
        }
    }

    async calculateAuctionStartTime() {
        let startDate = new Date().getTime();
        let endDate = new Date(this.state.auctionStartDateClock).getTime();
        let timeRemaining = parseInt((endDate - startDate) / 1000, 10);
        await this.setState({ auctionTimeremaining : timeRemaining  });
    }

    async componentDidMount() {

        window.addEventListener('load', async () => {
            if (window.ethereum) {
                window.web3 = new Web3(window.ethereum);
                try {
                    // Request account access if needed
                    //await window.ethereum.enable();
                    //await this.setState({ statesLoaded: true });
                    await this.setState({ web3: web3 });
                    this.getAuctionData(window.web3);
                } catch (error) {
                    console.log('Error', error);
                }
            }
            // Legacy dapp browsers...
            else if (window.web3) {
                window.web3 = new Web3(web3.currentProvider);
                //await this.setState({ statesLoaded: true });
                await this.setState({ web3: web3 });
                this.getAuctionData(window.web3);
            }
            else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            }
        });

        this.calculateAuctionStartTime();

    }

    

    async calculateAuctionDates() {
        const waitingPeriod = await this.state.auctionContract.methods.WAITING_PERIOD().call();
        const startBlock = await this.state.auctionContract.methods.startBlock().call();
        const startBlockData = await this.state.web3.eth.getBlock(startBlock);
        //const auctionEndDate = await this.state.auctionContract.methods.endTime().call();
        const auctionStartDate = new Date(startBlockData.timestamp * 1000);
        //await this.setState({auctionEndDate });
        await this.setState({ auctionStartTime: formatDate(auctionStartDate) });
        //await this.setState({ auctionEndTime: this.getFormattedDate(auctionEndDate) });
    }

    async getAuctionData(web3) {

        const auctionContract = new web3.eth.Contract(auctionAbi, AUCTION_CONTRACT_ADDRESS);
        const tokenContract = new web3.eth.Contract(tokenAbi, TOKEN_CONTRACT_ADDRESS);
        const promissoryTokenContract = new web3.eth.Contract(promissoryTokenAbi, POMISSORYTOKEN_CONTRACT_ADDRESS);

        const priceTicker =  await axios('https://api.coinmarketcap.com/v2/ticker/1027/');
        const ethereumLastPrice = priceTicker.data.data.quotes.USD.price;
        await this.setState({ethereumLastPrice});

        console.log('auctionContract :', auctionContract);
        console.log('tokenContract :', tokenContract);
        console.log('promissoryTokenContract', promissoryTokenContract);

        const promissoryTokenLastPrice = await promissoryTokenContract.methods.lastPrice().call();        
        await this.setState({ promissoryTokenLastPrice : promissoryTokenLastPrice });
        await this.setState({ tokenContract: tokenContract });
        await this.setState({ auctionContract: auctionContract });

        const totalBonusTokens = await auctionContract.methods.TOTAL_BONUS_TOKEN().call();
        const amountUpForAuction = await auctionContract.methods.MAX_TOKENS_SOLD().call();
        const kittieFightTokenEconomy = 10**8 * 10**18;        
        const auctionCeiling = web3.utils.fromWei(await auctionContract.methods.ceiling().call(), 'ether');
        let totalReceived = await auctionContract.methods.totalReceived().call();
        const currentPrice = await auctionContract.methods.calcCurrentTokenPrice().call();
        const auctionStage = await auctionContract.methods.stage().call();
        const myAccounts = await web3.eth.getAccounts();

        const ktyTokenPriceUSD = this.state.web3.utils.fromWei(currentPrice, 'ether') * ethereumLastPrice;
        this.setState({ ktyTokenPriceUSD });
        
        const currentBidders = await auctionContract.methods.getCurrentBiddersCount().call();
        await this.setState({ currentBidders: currentBidders });


        if (myAccounts.length !== 0) {
            const myBalance = await this.state.web3.eth.getBalance(myAccounts[0]);
            await this.setState({ myBalance: this.state.web3.utils.fromWei(myBalance, 'ether') });
        }
        await this.setState({ currentDate: CURRENT_DATE })
        await this.setState({ myAccounts: myAccounts });
        await this.setState({ amountUpForAuction: amountUpForAuction / 10 ** 18 });
        await this.setState({ kittieFightTokenEconomy: kittieFightTokenEconomy / 10 ** 18 });
        await this.setState({ auctionCeiling: auctionCeiling });
        await this.setState({ totalReceived: web3.utils.fromWei(totalReceived, 'ether') });
        await this.setState({ currentPrice: web3.utils.fromWei(currentPrice, 'ether') });
        await this.setState({ auctionStage: auctionTypes[auctionStage] });
        await this.setState({ totalBonusTokens: totalBonusTokens / 10 ** 18 });

        this.calculateAuctionDates();

        // Calculate Start Price 
        // priceFactor * 10**18 / (0+ 7500) + 1;
        const priceFactor = await auctionContract.methods.priceFactor().call();
        const startPrice = priceFactor * 10 ** 18 / 7501;
        await this.setState({ startPrice: this.state.web3.utils.fromWei(startPrice.toString(), 'ether') });

        // Calculare Decarease rate 
        // 1/(block.number - startBlock + 7500)
        const latestBlock = await this.state.web3.eth.getBlock('latest');
        await this.setState({ latestBlock: latestBlock.number });
        const decreaseRate = (1 / (latestBlock.number - this.state.startBlock + 7500)) * 100;
        await this.setState({ decreaseRate: decreaseRate });

        const isMetamask = await this.state.web3.currentProvider.isMetaMask;
        const networkName = await this.state.web3.eth.net.getNetworkType();
        await this.setState({ isMetamask: isMetamask });
        await this.setState({ networkName: networkName });

        // Calculate Auction end date approx.
        // priceFactor*MAX_TOKENS_SOLD/totalReceived -7500
        const maxTokenSold = await auctionContract.methods.MAX_TOKENS_SOLD().call();

        console.log('----------------------------------------');

        let auctionWillEnd = 0;        
        if( parseInt(totalReceived)  !== 0) {
            console.log('Calculate end Date approximatelly ... ');
            auctionWillEnd = priceFactor*maxTokenSold/totalReceived -7500
        }
        await this.setState({ auctionWillEnd : auctionWillEnd });

        console.log('MAX_TOKENS_SOLD', maxTokenSold);
        console.log('Pricefactor :  ', priceFactor);
        console.log('totalReceived :  ', totalReceived);
        console.log("dutcAuction will end in  : ", auctionWillEnd + ' Blocks ');


        const waitingPeriod = await auctionContract.methods.WAITING_PERIOD().call();
        const startBlock = await auctionContract.methods.startBlock().call();
        const startBlockData = await web3.eth.getBlock(startBlock);        
        await this.setState({ startBlock : startBlock  });
        const networkLaunchDay = new Date( (startBlockData.timestamp +  parseInt(waitingPeriod, 10))*1000  );
        await this.setState({ networkLaunchDay });
        await this.setState({ startBlock });


        console.log('NETWORK LAUNCH DAY : ', networkLaunchDay);
        console.log('----------------------------------------');

        await this.setState({ statesLoaded: true });

    }

    render() {
        return (
            <AppContext.Provider value={this.state}>
                {this.props.children}
            </AppContext.Provider>
        );
    }
}

export default AppProvider;
