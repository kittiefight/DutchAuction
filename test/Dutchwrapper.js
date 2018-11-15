const Dutchwrapper = artifacts.require('./Dutchwrapper.sol');
const assert = require(chai).assert;
const expect = require(chai).expect;

const ETHER = Math.pow(10,18);


contract('Dutchwrapper', function(accounts) {
  const deploymentConfig = {
    _ceiling: 5000 * ETHER,
    _priceFactor: 2 * Math.pow(10, -17)
  }

  const owner = accounts[0];
  const pWallet = accounts[1];
  let dutchWrapper;


  async before() {
    await Dutchwrapper.new(
      pWallet,
      deploymentConfig._ceiling,
      deploymentConfig._priceFactor,
      {
        from: owner
      }
    )
    .then(function(instance) {
      dutchWrapper = instance
    })
  }

  describe('setAdmin', async function() {
    it('should fail to setAdmin()', function() {
      try {
        await dutchWrapper.setAdmin(accounts[2]).send({
          from: pWallet
        });
        assert.isNotOk(true, 'Expected function to fail');
      } catch(function(e) {
        assert.exist(e, 'Expected error to exist from throw');
      })
    })

    it('should setAdmin()', async function() {
      try {
        await dutchWrapper.setAdmin(accounts[2]).send({
          from: owner
        });

        const isAdmin = await dutchWrapper.Admins(accounts[2]).call();
        assert.isTrue(isAdmin, 'New Admin not successfully set');
      } catch(function(e) {
        assert.isNotOk(true, `Expected function to complete: ${e.message || e}`);
      })
    })

  })
})
