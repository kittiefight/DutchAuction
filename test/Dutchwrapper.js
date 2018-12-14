const KittieFightToken = artifacts.require("KittiefightToken");
const DutchWrapper = artifacts.require("DutchWrapper");
const PromissoryToken = artifacts.require("PromissoryToken");

const { should, EVMThrow, getParamFromTxEvent } = require('./helpers');

let kittieFightToken = null;
let dutchWrapper = null;
let promissoryToken = null;
const WEI = 10**18;
const emptyHash = 0xeee00000;
let _accounts = null;

const auctionStages = [ "AuctionDeployed", "AuctionSetUp", "AuctionStarted", "AuctionEnded", "TradingStarted" ];


getAcutionData = async (dutchWrapper, kittieFightToken, accounts) => {

    const auctionStage =  await dutchWrapper.stage.call();
    const pWallet = await dutchWrapper.pWallet.call();
    const auctionOwner =  await dutchWrapper.owner.call();
    const ceiling = await dutchWrapper.ceiling.call();
    const priceFactor = await dutchWrapper.priceFactor.call();
    const startBlock = await dutchWrapper.startBlock.call();
    const endTime = await dutchWrapper.endTime.call();
    const totalReceived = await dutchWrapper.totalReceived.call();
    const finalPrice = await dutchWrapper.finalPrice.call();

    const currentBlock = await web3.eth.getBlock('latest');

    // console.log('----- Auction Params ----- ');
    // console.log('auctionStage :', auctionStages[auctionStage] );
    // console.log('pWallet :', pWallet );
    // console.log('auctionOwner :', auctionOwner );
    // console.log('ceiling :',  ceiling.toNumber(), web3.fromWei(ceiling.toNumber()), 'ETH' );
    // console.log('priceFactor :', priceFactor.toNumber() );
    // console.log('startBlock :', startBlock.toNumber() );
    // console.log('endTime :', endTime.toNumber() );
    // console.log('totalReceived :', totalReceived.toNumber(), web3.fromWei(totalReceived.toNumber()), 'ETH' );
    // console.log('finalPrice :', finalPrice.toNumber(), web3.fromWei(finalPrice.toNumber()) );
    // console.log('-----------------------------');

    return  data = { 
        "stage" : auctionStage,
        "auctionStage" : auctionStages[auctionStage],
        "pWallet" : pWallet,
        "auctionOwner" : auctionOwner,
        "ceiling" :   web3.fromWei(ceiling.toNumber(), 'ether') ,
        "priceFactor" : priceFactor.toNumber(),
        "startBlock" : startBlock.toNumber(),
        "endTime" : endTime.toNumber(),
        "_endTime" : new Date( endTime.toNumber() * 1000),
        "totalReceived" : ceiling.toNumber(),
        "totalReceived_eth" : web3.fromWei(totalReceived.toNumber(), 'ether'),
        "finalPrice" : finalPrice.toNumber(),
        "currentTokenPrice" : (await dutchWrapper.calcTokenPrice()).toNumber(),
        "currentBlock" : currentBlock.number,
        "currentBlockTimeStapm" : currentBlock.timestamp
    }
} 


getMyreferralTokens = async (dutchWrapper, _address, isPartner) => {

    let  _hash = null;

    if(!isPartner) {
        _hash = await dutchWrapper.calculatPersonalHash({ from: _address });
    }else{
        _hash = await dutchWrapper.calculateCampaignHash(_address,   { from: _accounts[0] });
    }


    let data = await dutchWrapper.TokenReferrals.call(_hash);

    return {
        hash : data[0],
        address : data[1],
        totalReferrals :  data[2].toNumber(),
        totalTokensEarned : data[3].toNumber() / (10**18)
    }

}

const forceMine = async (value, isBlock) => {
    //value: number of seconds or blocks to advance by
    let count = 1;
    if (!isBlock) {
         await web3.currentProvider.send({
           jsonrpc: "2.0",
           method: "evm_increaseTime",
           params: [value],
           id: new Date().getTime()
         });
     } else {
        count = value;
    }
     
     for( let i=0;i<count;i++) {
        console.log('i :', i);
        await web3.currentProvider.send({
           jsonrpc: "2.0",
           method: "evm_mine",
           id: new Date().getTime()
        });
    }
}

const increaseTime = function(duration) {
  const id = Date.now()

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1)

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res)
      })
    })
  })
}

contract('DutchWrapper',  accounts  => {

    const [owner, secondAccount, thirdAccount, referralAccount, referralAccount1, referralAccount2, seventhAccount, eighthAccount, pWalletAccount] = accounts;

    const sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    before('Setup contract for each test', async () => {
        _accounts = accounts;
        kittieFightToken = await KittieFightToken.deployed(); 
        dutchWrapper = await DutchWrapper.deployed(); 
        promissoryToken = await PromissoryToken.deployed();
        await dutchWrapper.setPromissoryTokenInstance(promissoryToken.address);
        accounts_num = accounts.length;
    })

    it('DutchWrapper setup Partners Referral & Bid', async () => {
        
        const campaingAccount = accounts[10];
        const cmpaignHash = await dutchWrapper.calculateCampaignHash(campaingAccount, { from: owner });

        //-- address _addr, uint _percentage, uint _type, uint _tokenAmt, uint _numUsers
        await dutchWrapper.setupReferal(campaingAccount, 10, 1, 0, 1 , { from: owner });
        
        let  claimedTokenReferral = (await dutchWrapper.claimedTokenReferral()).toNumber();

        // -- bidReferral
        await dutchWrapper.bidReferral(accounts[11], cmpaignHash , {from : accounts[11], value : web3.toWei('1', 'ether') } );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[11], false) ).totalTokensEarned, 30  );

        claimedTokenReferral = (await dutchWrapper.claimedTokenReferral()).toNumber();
        console.log( 'claimedTokenReferral : ',  claimedTokenReferral )

        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[10], true)).totalReferrals, 1  );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[10], true)).totalTokensEarned, 100  );

        await dutchWrapper.bidReferral(accounts[11], cmpaignHash , {from : accounts[11], value : web3.toWei('2', 'ether') } );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[11], false) ).totalTokensEarned, 60  );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[10], true)).totalTokensEarned, 200  );

        await dutchWrapper.bidReferral(accounts[11], cmpaignHash , {from : accounts[11], value : web3.toWei('4', 'ether') } );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[11], false) ).totalTokensEarned, 260  );

        await dutchWrapper.bidReferral(accounts[12], cmpaignHash , {from : accounts[12], value : web3.toWei('50', 'ether') } );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[12], false) ).totalTokensEarned, 600 );

        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[10], true)).totalReferrals, 4  );
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[10], true)).totalTokensEarned, (100 + 100 + 500 + 1000)  );

        console.log(  await getMyreferralTokens(dutchWrapper, accounts[10], true) ) 

        let marketingPartnersMap = await dutchWrapper.MarketingPartners.call(cmpaignHash);

    });


    it.skip('ReferralSignup signup & bidReferral', async () => {  
        // Accounts 30 - 40 


    })



    it('Finalize Auction  & start Trading', async () => { 

        for (let i = 50; i < 90; i++) {
            var val2 = await dutchWrapper.bid(accounts[i], { from: accounts[i], value: 250*10**18});
            //console.log(" Bid from Account[" + i + "]. Tx= "+  val2);
        }
        val = await dutchWrapper.stage();
        console.log("Stage= "+ val);
            
        try {
            await dutchWrapper.bid(accounts[95], { from: accounts[95], value: 10*10**18});
            assert.isNotOk(true, 'Expected function to fail');
        } catch(e) {
            assert.exists(e, 'Expected error to exist from throw');
        };

        await increaseTime( 86400 * 55 );
        await dutchWrapper.updateStage({ from : accounts[0] });
        await sleep(2000);
        
        const state = await getAcutionData(dutchWrapper, kittieFightToken, accounts);

        assert.equal(state.stage , 4, 'Auction stage should be  Auction started' );

        console.log('---- CONTRACT STATE ----');
        console.log( state ); 
        console.log('---- CONTRACT STATE ----');

    });


    it('claimtokenBonus for accounts : ', async () => {  

        // Claim For Bonus tokens for account[10]
        const account10Campaignhash = await dutchWrapper.calculateCampaignHash(accounts[10], { from: owner });
        assert.equal( (await getMyreferralTokens(dutchWrapper, accounts[10], true)).totalTokensEarned, (100 + 100 + 500 + 1000)  );


        // const claimtx = await dutchWrapper.claimtokenBonus.call( account10Campaignhash, { from: accounts[10] } );
        // console.log('-------------------------');
        // console.log(claimtx);


    });
    


});

