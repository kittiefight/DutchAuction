pragma solidity ^0.4.23;

/// Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20

/// @title Abstract token contract - Functions to be implemented by token contracts.
interface Token {
    function transfer(address to, uint256 value) external returns (bool success);
    function transferFrom(address from, address to, uint256 value) external returns (bool success);
    function approve(address spender, uint256 value) external returns (bool success);

    // This is not an abstract function, because solc won't recognize generated getter functions for public variables as functions.
    function totalSupply() external constant returns (uint256 supply);
    function balanceOf(address owner) external constant returns (uint256 balance);
    function allowance(address owner, address spender) external constant returns (uint256 remaining);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}