const KittieFightToken = artifacts.require("KittiefightToken");
const DutchWrapper = artifacts.require("Dutchwrapper");
const PromissoryToken = artifacts.require("PromissoryToken");
const { should, EVMThrow, getParamFromTxEvent } = require('./helpers');

contract('DutchWrapper',  accounts  => {

    let kittiefightToken;
    let dutchWrapper;
    let promissoryToken;
    const socialCampaignsHash = [];
    const emptyHash = 0xeee00000;101010101010
    const NULL_BYTES4 = 0x00000000;
    const ETHER = Math.pow(10, 18);

    const auctionStages = [ "AuctionDeployed", "AuctionSetUp", "AuctionStarted", "AuctionEnded", "TradingStarted" ];

    const getAcutionData = async (dutchWrapper, kittiefightToken, accounts) => {

        const auctionStage =  await dutchWrapper.stage.call();
        const pWallet = await dutchWrapper.pWallet.call();
        const auctionOwner =  await dutchWrapper.owner.call();
        const ceiling = await dutchWrapper.ceiling.call();
        const priceFactor = await dutchWrapper.priceFactor.call();
        const startBlock = await dutchWrapper.startBlock.call();
        const endTime = await dutchWrapper.endTime.call();
        const totalReceived = await dutchWrapper.totalReceived.call();
        const finalPrice = await dutchWrapper.finalPrice.call();

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
            "ceiling" : ceiling.toNumber(),
            "priceFactor" : priceFactor.toNumber(),
            "startBlock" : startBlock.toNumber(),
            "endTime" : endTime.toNumber(),
            "totalReceived" : totalReceived.toNumber(),
            "totalReceived_eth" : web3.fromWei(totalReceived.toNumber(), 'ether'),
            "finalPrice" : finalPrice.toNumber(),
            "currentTokenPrice" : (await dutchWrapper.calcTokenPrice()).toNumber()
        }
    }

    const sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const [owner, secondAccount, thirdAccount, referralAccount, referralAccount1, referralAccount2, seventhAccount, eighthAccount, pWalletAccount] = accounts;
    const _ceiling = 500 * ETHER; // 500 ETH
    const _priceFactor = 7500  / 10; //

    const socialsUsers = [{
        address: seventhAccount,
        _userName: 'user1',
        _retweetOrdiscord:'discord://user1'
      }, {
        address: eighthAccount,
        _userName: 'user2',
        _retweetOrdiscord:'twitter://user2'
      }, {
        address: seventhAccount,
        _userName: 'user3',
        _retweetOrdiscord:'discord://user3'
      }, {
        address: eighthAccount,
        _userName: 'user4',
        _retweetOrdiscord:'twitter://user4'
      }
    ];

    before('Setup contract for each test', async () => {
        kittiefightToken = await KittieFightToken.new({ from: owner });
        assert.isNotNull(kittiefightToken.address, 'Failed to deploy KittiefightToken with address');

        dutchWrapper = await DutchWrapper.new(pWalletAccount, _ceiling, _priceFactor, {
          from: owner
        });
        assert.isNotNull(dutchWrapper.address, 'Failed to deploy Dutchwrapper with address');

        promissoryToken = await PromissoryToken.new({ from: owner });
        assert.isNotNull(promissoryToken.address, 'Failed to deploy PromissoryToken with address');


        console.log('-------------------------------');
        console.log('Token address: ', kittiefightToken.address);
        console.log('Dutch Wrapper Address : ', dutchWrapper.address);
        console.log('PromissaryToken Address : ', promissoryToken.address);
        console.log('--------------------------------');

        await dutchWrapper.setPromissoryTokenInstance(promissoryToken.address);
        accounts_num = accounts.length;

            // console.log('PromissoryToken price : ', (await promissoryToken.lastPrice()).toNumber() );
            //
            // // Mint 100  Tokens
            // await token.mint(dutchWrapper.address, 10000000 * 10 ** 18);
            //
            // // // Transfer 100  tokens to DutchAuction
            // //await token.transfer(dutchWrapper.address, 5000000 * 10**18 );
            // console.log('Dutch Wrapper Balance : ',  (await token.balanceOf(dutchWrapper.address)).toNumber() );
            //
            // //Setup  Auction
            // await dutchWrapper.setup(token.address);
            //
            // //Start Auction
            // await dutchWrapper.startAuction();
    });

    describe('setAdmin()', function() {
      const admins = [
        secondAccount,
        thirdAccount
      ];

      it('should fail to setAdmin()', async function() {
        try {
          await dutchWrapper.setAdmin(secondAccount, {
            from: pWallet
          });
          assert.isNotOk(true, 'Expected function to fail');
        } catch(e) {
          assert.exists(e, 'Expected error to exist from throw');
        };
      })

      it('should setAdmin()', async function() {
        try {
          await Promise.all(admins.map((admin) => {
            return dutchWrapper.setAdmin(admin, {
              from: owner
            });
          }));

          const isAdmin = await Promise.all(admins.map(async (admin) => {
            return await dutchWrapper.Admins.call(admin);
          }));
          const expected = [
            true,
            true
          ];
          assert.deepEqual(isAdmin, expected, 'New Admins not successfully set');
        } catch(e) {
          assert.notExists(e, `Expected function to complete:`);
        };
      })
    });

    describe('removeAdmin()', function() {
      it('should fail to removeAdmin()', async function() {
        const isAdmin = await dutchWrapper.Admins.call(thirdAccount);
        assert.isTrue(isAdmin, 'Address is not yet Admin');

        try {
          await dutchWrapper.removeAdmin(thirdAccount, {
            from: pWallet
          });
          assert.isNotOk(true, 'Expected function to fail');
        } catch(e) {
          assert.exists(e, 'Expected error to exist from throw');
        };
      })

      it('should removeAdmin()', async function() {
        const isAdmin = await dutchWrapper.Admins.call(thirdAccount);
        assert.isTrue(isAdmin, 'Address is not yet Admin');

        try {
          await dutchWrapper.removeAdmin(thirdAccount, {
            from: owner
          });

          const newIsAdmin = await dutchWrapper.Admins.call(thirdAccount);
          assert.isFalse(newIsAdmin, 'Admin not successfully removed');
        } catch(e) {
          assert.notExists(e, `Expected function to complete:`);
        };
      })
    });

    describe('setupReferal()', function() {
        const args = [{
          _addr: referralAccount,
          _percentage: 10,
          _type: 1,
          _tokenAmt: 0, // No tokens for Partners, only ethers
          _numUsers: 2
        }, {
          _addr: referralAccount1,
          _percentage: 10,
          _type: 0,
          _tokenAmt: 0,
          _numUsers: 2
        }];

        it('should fail to setupReferal from non-Owner', async function () {
            try {
              const tx = await dutchWrapper.setupReferal(
                args[0]._addr,
                args[0]._percentage,
                args[0]._type,
                args[0]._tokenAmt,
                args[0]._numUsers ,
                { from: owner });
              assert.notExists(tx, 'Transaction should fail');
            } catch (e) {
              assert.exists(e, 'Transaction should fail with an error');
            }
        })

        it('DutchWrapper setup Partners Referal', async () => {
            try {
              await Promise.all(
                args.map(async(arg) => {
                    //-- address _addr, uint _percentage, uint _type, uint _tokenAmt, uint _numUsers
                    await dutchWrapper.setupReferal(
                      arg._addr,
                      arg._percentage,
                      arg._type,
                      arg._tokenAmt,
                      arg._numUsers,
                      {
                       from: owner
                    });
                    const _hash = await dutchWrapper.calculateCampaignHash.call(arg._addr, {
                       from: owner
                   });

                    if (arg._type === 1) {//MarketingPartners
                      let marketingPartnersMap = await dutchWrapper.MarketingPartners.call(_hash);

                      assert.equal(marketingPartnersMap[0], _hash, 'Incorrect referal hash set');
                      assert.equal(marketingPartnersMap[1], arg._addr, 'Incorrect referal address set');
                      assert.equal(marketingPartnersMap[4].toNumber(), arg._percentage, 'Incorrect referal percentage set');
                    } else {//Social campaign
                      socialCampaignsHash.push(_hash);
                      let socialCampaign = await dutchWrapper.SocialCampaigns.call(_hash);

                      assert.equal(socialCampaign[0], _hash, 'Incorrect referal hash set');
                      assert.equal(socialCampaign[1], arg._numUsers, 'Incorrect referal address set');
                      assert.equal(socialCampaign[2].toNumber(), arg._tokenAmt, 'Incorrect referal percentage set');
                    }
                })
              );
            } catch (e) {
                assert.notExists(e.message || e, `Expected function to complete:`);
            }
          });
        });

        describe('referralSignup()', function () {
          const  _addr = referralAccount2;

          it('should successfully referralSignup', async function () {
            try {
              const _hash = await dutchWrapper.referralSignup.call({ from : _addr });
              await dutchWrapper.referralSignup({ from : _addr });
              let tokenReferral = await dutchWrapper.TokenReferrals(_hash);

              assert.equal(tokenReferral[0], _hash, 'Incorrect address set')
              assert.equal(tokenReferral[1], _addr, 'Incorrect hash set')
            } catch (e) {
              assert.notExists( e.message || e, 'Exected function to complete')
            }
          })

          it('should fail to multiple referralSignup', async function () {
            try {
              await dutchWrapper.referralSignup({ from : _addr });

              assert.notExists(true, 'Function should fail');
            } catch (e) {
              assert.exists( e.message || e, 'Exected function to complete')
            }
          })
        })

        describe.skip('bidReferral()', function () {

          it.skip('DutchWrapper Bid', async function () {
            // -- bidReferral
            const bidRefferal = await dutchWrapper.bidReferral(thirdAccount, _hash ,
                    {from : thirdAccount, value : web3.toWei('1', 'ether') } );


            marketingPartnersMap = await dutchWrapper.MarketingPartners.call(_hash);
            assert.equal(1, marketingPartnersMap[2].toNumber());
            assert.equal( (marketingPartnersMap[3].toNumber() *  marketingPartnersMap[4].toNumber())/100 , marketingPartnersMap[5].toNumber());

            let tokenReferrals = await dutchWrapper.TokenReferrals.call(_hash);
            let totalTokensEarned = tokenReferrals[3].toNumber();
            assert.equal( totalTokensEarned, 500 * 10**18);

            await dutchWrapper.bidReferral(thirdAccount, _hash , {from : thirdAccount, value : web3.toWei('4', 'ether') } );
            tokenReferrals = await dutchWrapper.TokenReferrals.call(_hash);
            assert.equal( tokenReferrals[3].toNumber(), totalTokensEarned + 1000 * 10**18 );
            totalTokensEarned = tokenReferrals[3].toNumber();

            await dutchWrapper.bidReferral(thirdAccount, _hash , {from : thirdAccount, value : web3.toWei('7', 'ether') } );
            tokenReferrals = await dutchWrapper.TokenReferrals.call(_hash);
            assert.equal( tokenReferrals[3].toNumber(), totalTokensEarned + 5000 * 10**18 );

            let claimedTokenReferral = await dutchWrapper.claimedTokenReferral();
            assert.isAbove(claimedTokenReferral, 0);

            let superDAOTokens = await dutchWrapper.SuperDAOTokens(thirdAccount);
            assert.isAbove(superDAOTokens.toNumber(),0);
            assert.isAbove( web3.toWei('12', 'ether') / (await promissoryToken.lastPrice()).toNumber(), superDAOTokens.toNumber() );
        });
      });

    it.skip('Referral Campaing with sign up ', async () => {
        const  _addr = thirdAccount;
        const _hash = await dutchWrapper.referralSignup.call({ from : _addr });
        await dutchWrapper.referralSignup({ from : _addr });
        let tokenReferrals = await dutchWrapper.TokenReferrals(_hash);


        await dutchWrapper.bidReferral(_addr, _hash, { from: _addr, value : web3.toWei(1, 'ether')  });
        tokenReferrals = await dutchWrapper.TokenReferrals(_hash);
        assert.equal(tokenReferrals[3].toNumber(), 500 * 10**18);

        await dutchWrapper.bidReferral(_addr, _hash, { from: _addr, value : web3.toWei(1, 'ether')  });
        tokenReferrals = await dutchWrapper.TokenReferrals(_hash);
        assert.equal(tokenReferrals[3].toNumber(), 1000 * 10**18);

        await dutchWrapper.bidReferral(_addr, _hash, { from: _addr, value : web3.toWei(1, 'ether')  });
        tokenReferrals = await dutchWrapper.TokenReferrals(_hash);
        assert.equal(tokenReferrals[3].toNumber(), 1500 * 10**18);

        assert.equal( tokenReferrals[2].toNumber(), 3);
        console.log(tokenReferrals)

    });


    it.skip('DutchWrapper setup Referrals Referral & Bid', async () => {
        const  _addr = thirdAccount;
        const  _percentage = 0;
        let  _type = 3; // uint constand public Social = 3; // Distinction between promotion groups, social giveaway bonus
        let _tokenAmt = 20;
        let _numUsers = 5;

        let mapSocialCampaigns = null;
        let mapTokenReferrals = null;

        await dutchWrapper.setupReferal(_addr, _percentage, _type, _tokenAmt, _numUsers , { from: owner });
        const _AccountHash = await dutchWrapper.calculateRefferalsHash(_addr, { from: owner });
        mapSocialCampaigns = await dutchWrapper.SocialCampaigns.call(_AccountHash);

        assert.equal(_AccountHash, mapSocialCampaigns[0]);
        assert.equal( _numUsers, mapSocialCampaigns[1].toNumber());
        assert.equal(_tokenAmt, mapSocialCampaigns[2].toNumber())

        //-- Referral signup
        const signUprefferals = await dutchWrapper.referalSignup({ from : _addr });
        const _referralHash = signUprefferals.logs[0].args._Hash
        console.log('refferal hash :  ',  _referralHash);

        mapTokenReferrals =  await dutchWrapper.TokenReferrals.call(_referralHash);
        const bidReferral = await dutchWrapper.bidReferral(_addr, _referralHash ,{from : _addr, value : web3.toWei('2', 'ether') } );
        mapTokenReferrals =  await dutchWrapper.TokenReferrals.call(_referralHash);

        console.log( await getAcutionData(dutchWrapper, KittieFightToken, accounts)  );


    });

    describe('confirmSocial()', function () {
      it('should successfully confirmSocial', async function () {
        await Promise.all(socialCampaignsHash.map(async function(hash) {
          await Promise.all(socialsUsers.splice(0,2).map ( async function (user) {
            await dutchWrapper.confirmSocial(hash, user._userName, user._retweetOrdiscord, {
              from: user.address
            });
            const isConfirmed = await dutchWrapper.isConfirmedSocial.call(hash, user.address, user._userName);
            assert.isTrue(isConfirmed, 'User participation not successfully confirmed');
          }));
        }));
      });

      it('should fail to confirmSocial with different userNames from same address', async function () {
        try {
          await Promise.all(socialCampaignsHash.map(async function(hash) {
            await Promise.all(socialsUsers.splice(2,4).map ( async function (user) {
              await dutchWrapper.confirmSocial(hash, user._userName, user._retweetOrdiscord, {
                from: user.address
              });
              assert.notExists(true, 'Transaction should fail');
            }));
          }));
        } catch (e) {
          assert.exists(e, 'Transaction should fail with an error');
        }
      });

      it('should fail to duplicate confirmSocial', async function () {
        try {
          await Promise.all(socialCampaignsHash.map(async function(hash) {
            await Promise.all(socialsUsers.splice(0,2).map ( async function (user) {
              await dutchWrapper.confirmSocial(hash, user._userName, user._retweetOrdiscord, {
                from: user.address
              });
              assert.notExists(true, 'Transaction should fail');
            }));
          }));
        } catch (e) {
          assert.exists(e, 'Transaction should fail with an error');
        }
      });

      it('should fail to exceed maxParticipators limit on confirmSocial', function () {
        try {
          const user = socialsUsers[2];
          const hash = socialCampaignsHash[0];
          await dutchWrapper.confirmSocial(hash, user._userName, user._retweetOrdiscord, {
            from: thirdAccount
          });

          assert.notExists(true, 'Transaction shoould fail');
        } catch (e) {
          assert.exists(e, 'Expect tranasction to fail with error');
        }
      })
    })


});
