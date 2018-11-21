
module.exports = (deployer, network, accounts) => {
    
    const Token = artifacts.require("KittiefightToken");
    const DutchWrapper = artifacts.require("DutchWrapper");
    const PromissoryToken = artifacts.require("PromissoryToken");

    const _pWallet = accounts[9]; 
    const _ceiling = 20 * 10 ** 18; // 500 ETH 
    const _priceFactor = 7500  / 10; //  
    

    return deployer.deploy(Token).then(async () => {
        
        await deployer.deploy(DutchWrapper, _pWallet, _ceiling, _priceFactor);
        await deployer.deploy(PromissoryToken);

        const token = await Token.deployed();
        const dutchWrapper = await DutchWrapper.deployed(); 
        const promissoryToken = await PromissoryToken.deployed();

        console.log('-------------------------------');
        console.log('Token address: ', token.address);
        console.log('Dutch Wrapper Address : ', dutchWrapper.address);
        //console.log('PromissaryToken Address : ', promissoryToken.address);
        console.log('--------------------------------');

        // Set PromissaryToken Instance 

        //await dutchWrapper.setPromissoryTokenInstance(promissoryToken.address);

        console.log('PromissoryToken price : ', (await promissoryToken.lastPrice()).toNumber() );

        // Mint 100  Tokens 
        await token.mint(dutchWrapper.address, 10000000 * 10 ** 18);
    
        // // Transfer 100  tokens to DutchAuction
        //await token.transfer(dutchWrapper.address, 5000000 * 10**18 );
        console.log('Dutch Wrapper Balance : ',  (await token.balanceOf(dutchWrapper.address)).toNumber() );

        //Setup  Auction 
        await dutchWrapper.setup(token.address);
        
        //Start Auction 
        await dutchWrapper.startAuction();

        // Setup Finished ! 
        // Next go to tests ...
    });
};
