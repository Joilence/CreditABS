/*jshint esversion: 6 */

const path = require('path');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const contractPath = path.resolve(__dirname, '../compiled/CreditABS.json');
const { interface, bytecode } = require(contractPath);

const web3 = new Web3(ganache.provider());

let accounts;
let contract;   
const param = {
    _name: 'Test',
    _goal: '300000000',
    _description: 'Test Security'
};

describe('contract', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        console.log('Accounts:\n', accounts);
        
        contract = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({ data: bytecode, arguments: Object.values(param) })
            .send({ from: accounts[0], gas: '1000000'});
        console.log('Contract Deployed:', contract.options.address);
    });

    it('Deploy a contract', () => {
        assert.ok(contract.options.address);
    });
});