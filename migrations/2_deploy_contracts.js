
module.exports = (deployer, network, accounts) => {
    // skip deploy for tests
    if(network === 'test') {
      return deployer;
    }

    const Token = artifacts.require("KittiefightToken");
    const DutchWrapper = artifacts.require("Dutchwrapper");
    const PromissoryToken = artifacts.require("PromissoryToken");

    const _pWallet = accounts[9];
    const _ceiling = 20 * 10 ** 18; // 500 ETH
    const _priceFactor = 7500  / 10; //
    const _promissoryAddresses = {
      1: "0x0348B55AbD6E1A99C6EBC972A6A4582Ec0bcEb5c"
    };


    return deployer.deploy(Token).then(async () => {

        await deployer.deploy(DutchWrapper, _pWallet, _ceiling, _priceFactor);

        const token = await Token.deployed();
        const dutchWrapper = await DutchWrapper.deployed();

        //Handle promissory instance across networks
        if (_promissoryAddresses[network]) {
          const promissoryToken = await PromissoryToken.at(_promissoryAddresses[network]);
        } else {
          await deployer.deploy(PromissoryToken);
          const promissoryToken = await PromissoryToken.deployed();

          // Set PromissaryToken Instance
          await dutchWrapper.setPromissoryTokenInstance(promissoryToken.address);
        }

        console.log('-------------------------------');
        console.log('Token address: ', token.address);
        console.log('Dutch Wrapper Address : ', dutchWrapper.address);
        console.log('PromissaryToken Address : ', promissoryToken.address);
        console.log('--------------------------------');

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
