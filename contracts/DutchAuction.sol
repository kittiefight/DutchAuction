pragma solidity ^0.4.23;

import "./Interfaces/InterfaceToken.sol";
import "./Interfaces/PromissoryContract.sol";

//
/// @title Dutch auction contract - from gnosis, see source : https://github.com/maurelian/dutch-auction
/// improved with latest solidity syntax
contract DutchAuction {

    /*
     *  Events
     */
    event BidSubmission(address indexed sender, uint256 amount);
    event logPayload(bytes _data, uint _lengt);

    /*
     *  Constants
     */
    uint constant public MAX_TOKENS_SOLD = 10000000 * 10**18; // 10M
    uint constant public WAITING_PERIOD = 0 days;

    /*
     *  Storage
     */


    address public pWallet;
    Token public KittieFightToken;
    address public owner;
    PromissoryToken public PromissoryTokenIns; 
    address constant public promissoryAddr = 0x0348B55AbD6E1A99C6EBC972A6A4582Ec0bcEb5c;
    uint public ceiling;
    uint public priceFactor;
    uint public startBlock;
    uint public endTime;
    uint public totalReceived;
    uint public finalPrice;
    mapping (address => uint) public bids;
    Stages public stage;

    /*
     *  Enums
     */
    enum Stages {
        AuctionDeployed,
        AuctionSetUp,
        AuctionStarted,
        AuctionEnded,
        TradingStarted
    }

    /*
     *  Modifiers
     */
    modifier atStage(Stages _stage) {
        require(stage == _stage);
            // Contract not in expected state
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner);
            // Only owner is allowed to proceed
        _;
    }

    modifier isWallet() {
         require(msg.sender == address(pWallet));
            // Only wallet is allowed to proceed
        _;
    }

    modifier isValidPayload() {
        emit logPayload(msg.data, msg.data.length);
        require(msg.data.length == 4 || msg.data.length == 36, "No valid payload");
        _;
    }

    modifier timedTransitions() {
        if (stage == Stages.AuctionStarted && calcTokenPrice() <= calcStopPrice())
            finalizeAuction();
        if (stage == Stages.AuctionEnded && now > endTime + WAITING_PERIOD)
            stage = Stages.TradingStarted;
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Contract constructor function sets owner.
    /// @param _pWallet KittieFight promissory wallet.
    /// @param _ceiling Auction ceiling.
    /// @param _priceFactor Auction price factor.
    constructor(address _pWallet, uint _ceiling, uint _priceFactor)
        public
    {
        if (_pWallet == 0 || _ceiling == 0 || _priceFactor == 0)
            // Arguments are null.
            revert();
        owner = msg.sender;
        PromissoryTokenIns = PromissoryToken(promissoryAddr);
        pWallet = _pWallet;
        ceiling = _ceiling;
        priceFactor = _priceFactor;
        stage = Stages.AuctionDeployed;
    }

    /// @dev Setup function sets external contracts' addresses.
    /// @param _kittieToken  token address.
    function setup(address _kittieToken)
        public
        isOwner
        atStage(Stages.AuctionDeployed)
    {
        if (_kittieToken == 0)
            // Argument is null.
            revert();
        KittieFightToken = Token(_kittieToken);
        // Validate token balance
        if (KittieFightToken.balanceOf(this) != MAX_TOKENS_SOLD)
            revert();
        stage = Stages.AuctionSetUp;
    }

    /// @dev Starts auction and sets startBlock.
    function startAuction()
        public
        isOwner
        atStage(Stages.AuctionSetUp)
    {
        stage = Stages.AuctionStarted;
        startBlock = block.number;
    }

    /// @dev Changes auction ceiling and start price factor before auction is started.
    /// @param _ceiling Updated auction ceiling.
    /// @param _priceFactor Updated start price factor.
    function changeSettings(uint _ceiling, uint _priceFactor)
        public
        isWallet
        atStage(Stages.AuctionSetUp)
    {
        ceiling = _ceiling;
        priceFactor = _priceFactor;
    }

    /// @dev Calculates current token price.
    /// @return Returns token price.
    function calcCurrentTokenPrice()
        public
        timedTransitions
        returns (uint)
    {
        if (stage == Stages.AuctionEnded || stage == Stages.TradingStarted)
            return finalPrice;
        return calcTokenPrice();
    }

    /// @dev Returns correct stage, even if a function with timedTransitions modifier has not yet been called yet.
    /// @return Returns current auction stage.
    function updateStage()
        public
        timedTransitions
        returns (Stages)
    {
        return stage;
    }

    /// @dev Allows to send a bid to the auction.
    /// @param receiver Bid will be assigned to this address if set.
    function bid(address receiver)
        public
        payable
        //isValidPayload
        timedTransitions
        atStage(Stages.AuctionStarted)
        returns (uint amount)
    {
        // If a bid is done on behalf of a user via ShapeShift, the receiver address is set.
        if (receiver == 0)
            receiver = msg.sender;
        amount = msg.value;
        // Prevent that more than 90% of tokens are sold. Only relevant if cap not reached.
        uint maxWei = (MAX_TOKENS_SOLD / 10**18) * calcTokenPrice() - totalReceived;
        uint maxWeiBasedOnTotalReceived = ceiling - totalReceived;
        if (maxWeiBasedOnTotalReceived < maxWei)
            maxWei = maxWeiBasedOnTotalReceived;
        // Only invest maximum possible amount.
        if (amount > maxWei) {
            amount = maxWei;
            // Send change back to receiver address. In case of a ShapeShift bid the user receives the change back directly.
            if (!receiver.send(msg.value - amount))
                // Sending failed
                revert();
        }
        // Forward funding to ether pWallet
        if (amount == 0 || !address(pWallet).send(amount))
            // No amount sent or sending failed
            revert();
        bids[receiver] += amount;
        totalReceived += amount;
        if (maxWei == amount)
            // When maxWei is equal to the big amount the auction is ended and finalizeAuction is triggered.
            finalizeAuction();
        emit BidSubmission(receiver, amount);
    }

    /// @dev Claims tokens for bidder after auction.
    /// @param receiver Tokens will be assigned to this address if set.
    function claimTokens(address receiver)
        public
        isValidPayload
        timedTransitions
        atStage(Stages.TradingStarted)
    {
        if (receiver == 0)
            receiver = msg.sender;
        uint tokenCount = bids[receiver] * 10**18 / finalPrice;
        bids[receiver] = 0;
        KittieFightToken.transfer(receiver, tokenCount);
    }

    /// @dev Calculates stop price.
    /// @return Returns stop price.
    function calcStopPrice()
        view
        public
        returns (uint)
    {
        return totalReceived * 10**18 / MAX_TOKENS_SOLD + 1;
    }

    /// @dev Calculates token price.
    /// @return Returns token price.
    function calcTokenPrice()
        view
        public
        returns (uint)
    {
        return priceFactor * 10**18 / (block.number - startBlock + 7500) + 1;
    }

    /*
     *  Private functions
     */
    function finalizeAuction()
        private
    {
        stage = Stages.AuctionEnded;

        if (totalReceived == ceiling)
            finalPrice = calcTokenPrice();
        else
            finalPrice = calcStopPrice();

        endTime = now;
    }


}
