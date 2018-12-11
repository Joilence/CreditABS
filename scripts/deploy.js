const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

const contractPath = path.resolve(__dirname, '../compiled/CreditABS.json');
const { interface, bytecode } = require(contractPath);

const provider = new HDWalletProvider(
    config.get('hdwallet'),
    config.get('infuraUrl'),
);

const web3 = new Web3(provider);

const params = {
    _name: 'CreditABSDefault',
    _goal: 100000,
    _description: 'CreditABS Default'
};

(async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploy Account: ', accounts[0]);

    console.time('Deploy Time Consuming');
    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: Object.values(params) })
        .send({ from: accounts[0], gas: '5000000' });
    console.timeEnd('Deploy Time Consuming');

    const contractAddress = result.options.address;

    console.log('Contract is deployed at:', contractAddress);
    console.log('Contract address:', `https://rinkeby.etherscan.io/address/${contractAddress}`);

    const addressFile = path.resolve(__dirname, '../address.json');
    fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
    console.log('Contract address write to:', addressFile);

    process.exit();
})();