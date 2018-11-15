# Kittiefight  Dutch Auction
## https://dutchauction.kittiefight.io

## Truffle
Due to the exisitng issue with truffle customized contracts build directory `contracts_build_directory`, calls which update the contracts.json have to be called through the run scripts
```
compile: npm run truffle:compile -- args
migrate: npm run truffle:migrate -- args
```
To run any truffle scripts  
` npm run truffle:script -- args`  
e.g **npm run truffle:script -- test --network=test**

## Tests
### contracts
- run ganache using *8000000* gas Limit to imitate mainnet   : `ganache-cli -l 8000000`
- `npm run truffle:test`
