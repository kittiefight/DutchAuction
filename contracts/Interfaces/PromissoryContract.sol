pragma solidity ^0.4.23;

/// @title Abstract promissory contract - with function made available to using contract.

interface PromissoryToken {

	function claim() payable external;
	function lastPrice() external returns(uint256);
}
