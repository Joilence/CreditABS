/*jshint esversion: 6 */

const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');

// Get bytecode
const contractPath = path.resolve(__dirname, '../compiled/Car.json');
const {interface, bytecode} = require(contractPath);

// Configure provider
const provider = new HDWalletProvider(
    'egg rail pizza sea neither ship empty donor pet disease people egg',
    'https://rinkeby.infura.io/v3/89e84cf0935549d380c7fed664a24bec'
)

// Initialize web3 instance
const web3 = new Web3(provider);

(async () => {
    // Get account in the wallet
    const accounts = await web3.eth.getAccounts();
    console.log('Deploy contract account: ', accounts[0]);

    // Create contract instance and deploy
    console.time('contract deploy time');
    const result = await new web3.eth.Contract(JSON.parse(interface))
                            .deploy({data: bytecode, arguments: ['AUDI']})
                            .send({from:accounts[0], gas:'1000000'});
    console.timeEnd('contract deploy time');
    console.log('Succeed to deploy at: ', result.options.address);
})();