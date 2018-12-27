const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const SecurityManager = require('../compiled/SecurityManager.json');
const address = require('../address.json');
const config = require('config');

const web3 = new Web3(new HDWalletProvider(
    config.get('hdwallet'),
    config.get('infuraUrl'),
));

const contract = new web3.eth.Contract(JSON.parse(SecurityManager.interface), address);

(async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    const ABSs = [
        {
            name: 'ABS 1',
            goal: 300000,
            description: 'TEST ABS Contract 1'
        },
        {
            name: 'ABS 2',
            goal: 300000,
            description: 'TEST ABS Contract 2'
        }
    ];
    console.log(ABSs);

    const issuer = accounts[0];
    const results = await Promise.all(ABSs.map(x => 
        contract
            .methods.createABS(x.name, x.goal, x.description)
            .send({ from: issuer, gas: '1000000' })
        )
    );

    console.log(results);
})();