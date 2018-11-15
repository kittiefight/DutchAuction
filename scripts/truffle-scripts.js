# accept args from command line and pass to truffle, then update src/contracts folder
truffle $@
cp -rf ./build/contracts/* ./src/contracts
