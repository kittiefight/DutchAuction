
module.exports = (deployer, network, accounts) => {
    
    const Token = artifacts.require("KittiefightToken");
    const DutchWrapper = artifacts.require("DutchWrapper");
    const PromissoryToken = artifacts.require("PromissoryToken");

    const _pWallet = accounts[9]; 
    const _ceiling = 10000 * 10 ** 18; // 10 000  ETH 
    const _priceFactor = 50; //  
    

    return deployer.deploy(Token).then(async () => {
        
        await deployer.deploy(DutchWrapper, _pWallet, _ceiling, _priceFactor);
        await deployer.deploy(PromissoryToken);

        const token = await Token.deployed();
        const dutchWrapper = await DutchWrapper.deployed(); 
        const promissoryToken = await PromissoryToken.deployed();

        console.log('-------------------------------');
        console.log('REACT_APP_TOKEN_CONTRACT_ADDRESS='+token.address);
        console.log('REACT_APP_AUCTION_CONTRACT_ADDRESS='+dutchWrapper.address);
        console.log('REACT_APP_POMISSORYTOKEN_CONTRACT_ADDRESS='+promissoryToken.address);
        console.log('--------------------------------');

        // console.log('PromissoryToken price : ', (await promissoryToken.lastPrice()).toNumber() );

        // Mint 10 million  Tokens for dutchwrapper
        await token.mint(dutchWrapper.address, 10000000 * 10 ** 18);
    
        // // Transfer 100  tokens to DutchAuction
        //await token.transfer(dutchWrapper.address, 5000000 * 10**18 );
        // console.log('Dutch Wrapper Balance : ',  (await token.balanceOf(dutchWrapper.address)).toNumber() );

        //Setup  Auction 
        await dutchWrapper.setup(token.address);
        
        //Start Auction 
        await dutchWrapper.startAuction();

        // Setup Finished ! 
        // Next go to tests ...
    });
};
