const KittiefightToken = artifacts.require('./KittiefightToken.sol');
const assert = require('chai').assert;
const expect = require('chai').expect;

const ETHER = Math.pow(10,18);


contract('KittiefightToken', function(accounts) {

  const owner = accounts[0];
  let kittiefightToken;


  before(async function() {
    await KittiefightToken.new({
      from: owner,
      // gas: 7990000
    })
    .then(function(instance) {
      kittiefightToken = instance
      assert.isNotNull(kittiefightToken.address, 'Faied to deploy KittiefightToken with address');
      console.log('Web3: ', web3.version.api ? web3.version.api : web3.version);
    })
  })

  describe('setWhitelistedOnly()', function(){
    it('should fail to setWhitelistedOnly()', async function() {
      try {
        await kittiefightToken.setWhitelistedOnly(true, {
          from: accounts[1]
        });
        assert.isNotOk(true, 'Expected function to fail');
      } catch(e) {
        assert.exists(e, 'Expected error to exist from throw');
      };
    })

    it('should setWhitelistedOnly()', async function() {
      const oldIsTransferWhitelistOnly = await kittiefightToken.isTransferWhitelistOnly.call();
      try {
        await kittiefightToken.setWhitelistedOnly(true, {
          from: owner
        });

        const isTransferWhitelistOnly = await kittiefightToken.isTransferWhitelistOnly.call();
        assert.isTrue(isTransferWhitelistOnly, 'New TransferWhitelistOnly not successfully set');
        assert.notEqual(oldIsTransferWhitelistOnly, isTransferWhitelistOnly, 'TransferWhitelistOnly value did not change as expected');
      } catch(e) {
        assert.isNotOk(true, `Expected function to complete: ${e.message || e}`);
      };
    })
  });


})
