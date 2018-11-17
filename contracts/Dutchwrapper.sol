pragma solidity ^0.4.23;
import "./DutchAuction.sol";
import "./SafeMath.sol";

contract Dutchwrapper is DutchAuction {


    uint constant public MAX_TOKEN_REFERRAL = 1800000 * 10**18; // 800,000 : eight hundred  thousand
    uint constant public MAX_TOKEN_SOCIAL = 200000 * 10**18; // 200,000 : two hundred thousand

    uint public claimedTokenReferral = 0; // 800,000 : eigth hundred thousand limit
    uint public claimedSocial = 0; // 200,000 : two  hundred thousand limit
    uint public totalEthEarnedByPartners = 0; // Partners earning


    // 1,000,000 :  1 million: total MAX_TOKEN_REFERRAL + MAX_TOKEN_SOCIAL
    uint constant public TOTAL_BONUS_TOKEN = 2000000 * 10**18;


    uint constant public Partners = 1; // Distinction between promotion groups, partnership for eth
    uint constant public Referrals = 2; // Distinction between promotion groups, referral campaign for tokens
    uint constant public Social = 3; // Distinction between promotion groups, social giveaway bonus

    uint constant public ONE = 1; // NUMBER 1

    mapping (address => uint) public SuperDAOTokens; // amount of bonus Superdao Tokens earned per bidder
    //for participation on auction based on eth bid

    struct PartnerForEth {
        bytes4 hash; // unique hash for partner
        address addr; //address for partner
        uint totalReferrals; // Number of reffered parties
        uint totalContribution; // total contribution in ETH by reffered parties
        uint[] individualContribution; // individual contribution list, number of eth per contributor
        uint percentage; // percentage share for partner of each referral
        uint EthEarned; // up to date total amount earned
    }

	address [] public PartnersList; // list of partners

    //for token referal campaign
    struct tokenForReferral {
        bytes4 hash; // hash of this campaign
        address addr; // address of this user
        uint totalReferrals; // total amount of participators refered
        uint totalTokensEarned; // total tokens earned based on referals
        mapping(uint => uint) tokenAmountPerReferred;// Amount of tokens earned for each participator referred
    }

    address [] public TokenReferalList; // list of partners


    //Profile for social campaign
    struct SocialProfile{
        address addr; // address of this user
        bytes32 socialAction; // online location of this users social action
        uint tokensEarned; // total tokens earned based on campaign action
        bool approved; ///approved or not
        bytes32 username; //social media username twitter or discord
    }

    struct TokenforSocial{
        bytes4 hash; // campaign identifier
        uint maxParticipators; //  maximum number of participators in this campaign
        SocialProfile [] SocialLinkProfile; // actual profile of participator with social sharing
        address [] profileList; // list os addresses of participators
        mapping(address => uint) index; //address indexes
        mapping(address => bool) disqualified; //indicate if a user is disqualified or not
        uint tokenAmountForEach; // amount of tokens allocated to each participator
    }

    mapping(bytes4 => PartnerForEth )  public MarketingPartners;
    mapping(bytes4 => tokenForReferral)  public TokenReferrals;
    mapping(bytes4 => TokenforSocial )  public SocialCampaigns;
    mapping(address => bool ) public Admins;

    // statistics on the number of bidders
    struct bidder {
        address addr;
        uint amount;
    }

    bidder [] public CurrentBidders; // document current bidders


    event PartnerReferral(bytes4 _partnerHash,address _addr, uint _amount);//fired after marketing partner referral happens
    event SocialReferral(bytes4 _campaignHash,address _addr, uint _amount);//fired when social action converts to a bid
    event TokenReferral(bytes4 _campaignHash,address _addr, uint _amount);// fired when token referral happens
    event BidEvent(bytes4 _hash, address _addr, uint _amount); //fired when a bid happens
    event SetupReferal(uint _type); //fired when a referal campaign is setup
    event ConfirmSocial(bytes4 _campaignHash, address _addr, bytes32 _userName); //fired when social promoters confirm social action
    event AdminRemoveBatch(bytes4 _campaignHash, address _addr, bytes32 _userName); // fired when users are removed from storage
    event ReferalSignup(bytes4 _Hash, address _addr); // fired when a token promoter signs up
    event ClaimtokenBonus(bytes4 _Hash, address _addr, bool success); //fired when a person claims earned tokens



    // check admins
    modifier isAdmin(){
        require(Admins[msg.sender] == true);
        _;
    }

    //Check if a user has been disqualified by admin
    modifier isDisqualified(bytes4 _campaignHash){
        require(SocialCampaigns[_campaignHash].disqualified[msg.sender] == false);
        _;
    }

    // check when dutch auction is ended and trading has started
    modifier tradingstarted(){
        require(stage == Stages.TradingStarted);
        _;
    }
  

    // uint constant public MAX_TOKEN_REFERRAL = 800000 * 10**18; // 800,000 : eight hundred  thousand
    // uint constant public MAX_TOKEN_SOCIAL = 200000 * 10**18; // 200,000 : two hundred thousand
    //
    // uint public claimedTokenReferral = 0; // 800,000 : eigth hundred thousand limit
    // uint public claimedSocial = 0; // 200,000 : two  hundred thousand limit


    // 1,000,000 :  1 million: total MAX_TOKEN_REFERRAL + MAX_TOKEN_SOCIAL
    // uint constant public TOTAL_BONUS_TOKEN = 1000000 * 10**18;


    // safety check for requiring limits at maximum amount allocated for referrals
    modifier ReferalCampaignLimit() {
        require (claimedTokenReferral < MAX_TOKEN_REFERRAL);
        _;
    }

    // safety check for requiring limits at maximum amount allocated for social campaign
    modifier SocialCampaignLimit() {
        require (claimedSocial< MAX_TOKEN_SOCIAL);
        _;
    }

    //reject already rejistered by username
    modifier checkSocialDuplicates(bytes4 _campaignHash, bytes32 _userName) {
    	for (uint i=0; i<SocialCampaigns[_campaignHash].SocialLinkProfile.length; i++ ) {
    		if (SocialCampaigns[_campaignHash].SocialLinkProfile[i].username == _userName) {
    			revert();
    		}
        }
    	_;
    }

    constructor  (address _pWallet, uint _ceiling, uint _priceFactor)
        DutchAuction(_pWallet, _ceiling, _priceFactor)  public {
    }

    //set an address as admin to moderate and check social media campaigns
    function setAdmin(address _addr) public isOwner returns (bool success){
        Admins[_addr] = true;
    		    return true;
    }

    //remove an address from moderating and checking social media campaigns
    function removeAdmin(address _addr) public isOwner returns (bool success){
        Admins[_addr] = false;
    		    return true;
    }


    // creates either a marketing partnering for eth or a twitter retweet campaign. referal marketing in
    // exchange for tokens are self generated in referal signup function

    function setupReferal(address _addr, uint _percentage, uint _type, uint _tokenAmt, uint _numUsers)
        public
        isOwner
        returns (string successmessage)
    {

        bytes4 tempHash = bytes4(keccak256(abi.encodePacked(_addr, msg.sender)));

        if (_type == Partners) {

            MarketingPartners[tempHash].hash = tempHash;
            MarketingPartners[tempHash].addr = _addr;
            MarketingPartners[tempHash].percentage = _percentage;
            InternalReferalSignup(_addr);
    		    emit SetupReferal(_type);
            return "partner signed up";

        } else {

            SocialCampaigns[tempHash].hash = tempHash;
            SocialCampaigns[tempHash].maxParticipators = _numUsers;
            SocialCampaigns[tempHash].tokenAmountForEach = _tokenAmt;
            emit SetupReferal(_type);
            return "social campaign started";
        }
    }

    // generated hash on behalf of partners earning cash and tokensby tokens. referalcampaignlimmit modifier
    //removed because partner signup it will fail if referal tokens are used up
    function InternalReferalSignup(address _addr) internal returns (bytes4 referalhash) {
        bytes4 tempHash = bytes4(keccak256(abi.encodePacked(_addr)));
        TokenReferrals[tempHash].addr = msg.sender;
        TokenReferrals[tempHash].hash = tempHash;
        referalhash = tempHash;
        emit ReferalSignup(tempHash, _addr);
    }


    // public self generated hash by token earning promoters
    function referralSignup() public ReferalCampaignLimit returns (bytes4 referalhash) {
        bytes4 tempHash = bytes4(keccak256(abi.encodePacked(msg.sender)));
        require (tempHash != TokenReferrals[tempHash].hash); //check prevent overwriting
        TokenReferrals[tempHash].addr = msg.sender;
        TokenReferrals[tempHash].hash = tempHash;
        referalhash = tempHash;
        emit ReferalSignup(tempHash, msg.sender);
    }


    // Biding using a referral hash
    function bidReferral(address _receiver, bytes4 _hash) public payable returns (uint) {

        uint bidAmount = msg.value;
        uint256 promissorytokenLastPrice = PromissoryTokenIns.lastPrice();


        if(bidAmount > ceiling - totalReceived) {
            bidAmount = ceiling - totalReceived;
        }

        require( bid(_receiver) == bidAmount );

		uint amount = msg.value;
		bidder memory _bidder;
		_bidder.addr = _receiver;
		_bidder.amount = amount;
        SuperDAOTokens[msg.sender] += amount/promissorytokenLastPrice;
		CurrentBidders.push(_bidder);

        emit BidEvent(_hash, msg.sender, amount);

        if (_hash == MarketingPartners[_hash].hash) {

            MarketingPartners[_hash].totalReferrals += ONE;
            MarketingPartners[_hash].totalContribution += amount;
            MarketingPartners[_hash].individualContribution.push(amount);
            MarketingPartners[_hash].EthEarned += referalPercentage(amount, MarketingPartners[_hash].percentage);

            totalEthEarnedByPartners += referalPercentage(amount, MarketingPartners[_hash].percentage);

            if(claimedTokenReferral < MAX_TOKEN_REFERRAL){
            TokenReferrals[_hash].totalReferrals += ONE;

            if( (msg.value >= 1 ether) && (msg.value <= 3 ether) ) {
              TokenReferrals[_hash].tokenAmountPerReferred[amount] = 100 * 10**18;
              TokenReferrals[_hash].totalTokensEarned += 100 * 10**18;
              claimedTokenReferral += 100 * 10**18;
              emit TokenReferral(_hash ,msg.sender, amount);


              } else if ((msg.value > 3 ether)&&(msg.value <= 6 ether)) {
                  TokenReferrals[_hash].tokenAmountPerReferred[amount] = 500 * 10**18;
                  TokenReferrals[_hash].totalTokensEarned += 500 * 10**18;
                  claimedTokenReferral += 500 * 10**18;
                  emit TokenReferral(_hash ,msg.sender, amount);


                  } else if (msg.value > 6 ether) {
                    TokenReferrals[_hash].tokenAmountPerReferred[amount] = 1000 * 10**18;
                    TokenReferrals[_hash].totalTokensEarned += 1000 * 10**18;
                    claimedTokenReferral += 1000 * 10**18;
                    emit TokenReferral(_hash, msg.sender, amount);

                  }
                }
            emit PartnerReferral(_hash, MarketingPartners[_hash].addr, amount);

            return Partners;

          } else if ((_hash == TokenReferrals[_hash].hash) && (claimedTokenReferral < MAX_TOKEN_REFERRAL)) {

        			TokenReferrals[_hash].totalReferrals += ONE;

        			if( (msg.value >= 1 ether) && (msg.value <= 3 ether) ) {
        				TokenReferrals[_hash].tokenAmountPerReferred[amount] = 100 * 10**18;
        				TokenReferrals[_hash].totalTokensEarned += 100 * 10**18;
                claimedTokenReferral += 100 * 10**18;
        				emit TokenReferral(_hash ,msg.sender, amount);
        				return Referrals;

        				} else if ((msg.value > 3 ether)&&(msg.value <= 6 ether)) {
        						TokenReferrals[_hash].tokenAmountPerReferred[amount] = 500 * 10**18;
        						TokenReferrals[_hash].totalTokensEarned += 500 * 10**18;
                    claimedTokenReferral += 500 * 10**18;
        						emit TokenReferral(_hash ,msg.sender, amount);
        						return Referrals;

        						} else if (msg.value > 6 ether) {
        							TokenReferrals[_hash].tokenAmountPerReferred[amount] = 1000 * 10**18;
        							TokenReferrals[_hash].totalTokensEarned += 1000 * 10**18;
                      claimedTokenReferral += 1000 * 10**18;
        							emit TokenReferral(_hash, msg.sender, amount);
        							return Referrals;
        						}
                            }


    }



	function confirmSocial(bytes4 _campaignHash, bytes32 _userName, bytes32 _retweetOrdiscord) public
	   SocialCampaignLimit
	   checkSocialDuplicates(_campaignHash, _userName)
    	returns (uint) {
			uint id = SocialCampaigns[_campaignHash].index[msg.sender];

            if(SocialCampaigns[_campaignHash].SocialLinkProfile.length != 0){
                require(msg.sender != SocialCampaigns[_campaignHash].SocialLinkProfile[id].addr); //reject already rejistered
            }

			require(SocialCampaigns[_campaignHash].SocialLinkProfile.length < SocialCampaigns[_campaignHash].maxParticipators);// check token availability
            SocialProfile memory tempProfile;
			tempProfile.addr = msg.sender;
 			tempProfile.socialAction = _retweetOrdiscord; //store social action
			tempProfile.tokensEarned = SocialCampaigns[_campaignHash].tokenAmountForEach;
			tempProfile.approved = true;
			tempProfile.username = _userName;
			SocialCampaigns[_campaignHash].index[msg.sender] = SocialCampaigns[_campaignHash].SocialLinkProfile.length;
            SocialCampaigns[_campaignHash].SocialLinkProfile.push(tempProfile);
			//SocialCampaigns[_campaignHash].disqualified[tempAddr] = false;


			claimedSocial += SocialCampaigns[_campaignHash].tokenAmountForEach;
			emit ConfirmSocial(_campaignHash, msg.sender, _userName);
    }


    function adminRemoveBatch(bytes4 _campaignHash, address [] _batchList) public
        isAdmin
        SocialCampaignLimit
        returns (uint) {
        	 for (uint i=0; i < _batchList.length; i++){
        	   address tempAddr = _batchList[i];
        	   uint userIndex = SocialCampaigns[_campaignHash].index[tempAddr];
        	   delete SocialCampaigns[_campaignHash].SocialLinkProfile[userIndex];
        	   SocialCampaigns[_campaignHash].disqualified[tempAddr] = true;
        	   claimedSocial -= SocialCampaigns[_campaignHash].tokenAmountForEach;
        	   emit AdminRemoveBatch(_campaignHash, tempAddr, SocialCampaigns[_campaignHash].SocialLinkProfile[userIndex].username);
        }
    }



	function referalPercentage(uint _amount, uint _percent)
	    public
	    returns (uint) {
            return SafeMath.mul( SafeMath.div( SafeMath.sub(_amount, _amount%100), 100 ), _percent );
	}



  function claimtokenBonus (bytes4 _campaignHash) public
	timedTransitions
	atStage(Stages.TradingStarted)
	isDisqualified(_campaignHash)
	returns (bool success) {

	 	uint userIndex = SocialCampaigns[_campaignHash].index[msg.sender];
        bytes4 _personalHash = bytes4(keccak256(abi.encodePacked(msg.sender)));

		if ((_personalHash == TokenReferrals[_personalHash].hash) && (TokenReferrals[_personalHash].totalTokensEarned > 0)){

			uint TokensToTransfer1 = TokenReferrals[_personalHash].totalTokensEarned;
			TokenReferrals[_personalHash].totalTokensEarned = 0;
            KittieFightToken.transfer(TokenReferrals[_personalHash].addr , TokensToTransfer1);
			emit ClaimtokenBonus(_campaignHash, msg.sender, true);
			return true;

	  }else if((msg.sender == SocialCampaigns[_campaignHash].SocialLinkProfile[userIndex].addr) && (SocialCampaigns[_campaignHash].SocialLinkProfile[userIndex].tokensEarned > 0)){

		uint TokensToTransfer2 = SocialCampaigns[_campaignHash].SocialLinkProfile[userIndex].tokensEarned;
		SocialCampaigns[_campaignHash].SocialLinkProfile[userIndex].tokensEarned = 0;
		KittieFightToken.transfer(msg.sender, TokensToTransfer2);
		emit ClaimtokenBonus(_campaignHash, msg.sender, true);
		return true;
		}else return false;

  }

    /*
     *  Admin transfers all unsold tokens back to token contract
     */
    function transferUnsoldTokens(uint _unsoldTokens, address _addr)
        public
        isOwner

     {

        uint soldTokens = totalReceived * 10**18 / finalPrice;
        require (_unsoldTokens < (MAX_TOKENS_SOLD + claimedTokenReferral + claimedSocial) - soldTokens);
        KittieFightToken.transfer(_addr, _unsoldTokens);
    }


    function tokenAmountPerReferred(bytes4 _hash, uint _amount ) public view returns(uint tokenAmount) {
        tokenAmount = TokenReferrals[_hash].tokenAmountPerReferred[_amount];
    }
    
    function getCurrentBiddersCount () public view returns(uint biddersCount)  {
        biddersCount = CurrentBidders.length;
    }
    
    // helper functions  return msg.senders
    function calculatPersonalHash() public view returns (bytes4 _hash) {
        _hash = bytes4(keccak256(abi.encodePacked(msg.sender)));
    }

    function calculateCampaignHash(address _addr) public view returns (bytes4 _hash) {
        _hash = bytes4(keccak256(abi.encodePacked(_addr, msg.sender)));
    }

}
