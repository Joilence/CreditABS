const path = require('path');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const contractPath = path.resolve(__dirname, '../compiled/CreditABS.json');
const { interface, bytecode } = require(contractPath);

const web3 = new Web3(ganache.provider());

let accounts;
let abs;
const param = {
    _name: 'Test',
    _goal: '30000000',
    _description: 'Test Security'
};

describe('Contract Deployment', () => {
    beforeEach('Deploy Contract', async () => {
        accounts = await web3.eth.getAccounts();
        abs = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({ data: bytecode, arguments: Object.values(param) })
            .send({ from: accounts[0], gas: '5000000'});
    });

    it('Deploy a contract', () => {
        assert.ok(abs.options.address);
    });

    describe('Contract Purchase', () => {
        it('should not accept purchase less than 0', async () => { 
            try {
                const purchaser = accounts[1];
                await abs.methods.purchase().send({from: purchaser, value: 0});
                assert.ok(false);
            } catch (err) {
                assert.ok(err);
            }
        });
        
        it('should allow user to purchase', async () => {
            const amount = 1000000;
            const purchaser = accounts[1];
            await abs.methods.purchase().send({from: purchaser, value: amount});
            const balance = await abs.methods.checkBalance().call({from: accounts[1]});
            assert.equal(balance, amount);
        });
    
        it('should forbid contract account from purchase', async () => {
            try {
                const amount = 100000;
                const purchaser = abs.options.address;
                await abs.methods.purchase().send({from: purchaser, value: amount});
                assert.ok(false);
            } catch (err) {
                assert.ok(err);
            }
        });
    
        it('should not accept purchase when goal is reached', async () => {
            try {
                const goal = abs.methods.financingGoal().call();
                const purchaser = accounts[1];
                await abs.methods.purchase().send({from: purchaser, value: goal});
                await abs.methods.purchase().send({from: purchaser, value: 1});
                assert.ok(false);
            } catch (err) {
                assert.ok(err);
            }
        });
    
        it('should not accept purchase that makes financing goal be overpassed', async () => {
            try {
                const goal = abs.methods.financingGoal().call();
                const purchaser = accounts[1];
                await abs.methods.purchase().send({from: purchaser, value: goal + 1});
                assert.ok(false);
            } catch (err) {
                assert.ok(err);
            }
        });
    });

    describe('Contract Transfer', async () => {

        let amount = 100;
    
        beforeEach(async () => {
            // Initial balace of account[1]
            abs.methods.purchase().send({from: accounts[1], value: amount});
        });
    
        it('should allow legal transfer', async () => {
            // Send half of account[1]'s balance
            let sendAmount = await abs.methods.balances(accounts[1]).call() / 2;
            // Do transfer
            await abs.methods.transfer(accounts[2], sendAmount).send({from: accounts[1]});
            // Get account[2]'s balance
            const recvAmount = await abs.methods.balances(accounts[2]).call();
            // Check
            assert.equal(recvAmount, sendAmount);
        });
    
        it('should not allow account to transfer amount more than its balance', async () => {
            try {
                await abs.methods.transfer(accounts[1], amount).call({from: accounts[2]});
                assert.ok(false);
            } catch (err) {
                assert.ok(err);
            }
        });
    
        it('should change num of tokenholders properly', async () => {
            let num = await abs.methods.numOfTokenholders().call();
            assert.equal(num, 1);
            
            let sendAmount = await abs.methods.balances(accounts[1]).call() / 2;
            await abs.methods.transfer(accounts[2], sendAmount).send({from: accounts[1]});
            num = await abs.methods.numOfTokenholders().call();
            assert.equal(num, 2);
    
            sendAmount = await abs.methods.balances(accounts[1]).call();
            await abs.methods.transfer(accounts[2], sendAmount).send({from: accounts[1]});
            num = await abs.methods.numOfTokenholders().call();
            assert.equal(num, 1);
        });
    });

    describe('Contract Payment', async () => {

        const b1 = 1;
        const b2 = 2;
        const b3 = 3;
        const b4 = 4;
        const b5 = 5;
        const bAll = b1 + b2 + b3 + b4 + b5;
    
        beforeEach('Create five tokenholders', async () => {
            await abs.methods.purchase().send({from: accounts[1], value: b1});
            await abs.methods.purchase().send({from: accounts[2], value: b2});
            await abs.methods.purchase().send({from: accounts[3], value: b3});
            await abs.methods.purchase().send({from: accounts[4], value: b4});
            await abs.methods.purchase().send({from: accounts[5], value: b5});
            const numOfTokenholders = await abs.methods.numOfTokenholders().call();
            const fundReceived = await abs.methods.fundReceived().call();
            assert.equal(numOfTokenholders, 5);
            assert.equal(fundReceived, bAll);
        });

        describe('Contract Payment - Create', async () => {
            const paymentName = "TEST";
            const paymentAmount = 1;

            // enum PaymentState {Voting, Declined, Approved, Completed}

            // TODO: check payment state
            it('should only allow issuer to create payment', async () => {
                const recvAddress = accounts[1];
                const issuer = accounts[0];
                await abs.methods.createPayment(paymentName, paymentAmount, recvAddress)
                    .send({from: issuer, gas: '1000000'});
                
                const payment = await abs.methods.payments(0).call();
                assert.equal(payment.description, paymentName);
                assert.equal(payment.amount, paymentAmount);
                assert.equal(payment.receiver, recvAddress);
            });
        
            it('should not allow non-issuer to create payment', async () => {
                try {
                    await abs.methods.createPayment("TEST", 1, accounts[1])
                        .call({from: accounts[1]});
                    assert.ok(false);
                } catch (err) {
                    console.log(err.results[Object.keys(err.results)[0]].reason);
                    assert.ok(err);
                }
            });

            it('should not allow payment amount to be greater than received fund', async () => {
                try {
                    await abs.methods.createPayment("TEST", bAll + 1, accounts[1])
                        .call({from: accounts[0]});
                    assert.ok(false);
                } catch (err) {
                    console.log(err.results[Object.keys(err.results)[0]].reason);
                    assert.ok(err);
                }
            });
        })
    
        describe('Contract Payment - Vote', async () => {
            const paymentName = "TEST";
            const paymentAmount = 1;

            beforeEach('Create a open payment', async () => {
                await abs.methods.createPayment(paymentName, paymentAmount, accounts[1])
                    .send({from: accounts[0], gas: '1000000'});
            });

            // TODO: check is vote
            it('should allow tokenholders to vote for payment', async () => {
                await abs.methods.approvePayment(0).send({from: accounts[1]});
                const payment = await abs.methods.payments(0).call();
                const balance = await abs.methods.balances(accounts[1]).call();
                assert.ok(payment.voteShare, balance);
            });
    
            it('should not allow non-tokenholder to vote for payment', async () => {
                try {
                    await abs.methods.approvePayment(0).call({from: accounts[0]});
                    assert.ok(false);
                } catch (err) {
                    console.log(err.results[Object.keys(err.results)[0]].reason);
                    assert.ok(err);
                }
            })

            it('should not allow any one to vote twice', async () => {
                try {
                    await abs.methods.approvePayment(0).send({from: accounts[1]});
                    await abs.methods.approvePayment(0).send({from: accounts[1]});
                    assert.ok(false);
                } catch (err) {
                    console.log(err.results[Object.keys(err.results)[0]].reason);
                    assert.ok(err);
                }
            });

            // TODO: Check payment state
            it('should properly change payment state as approved', async () => {

            });
        });
    
        // describe('Contract Payment - Action', async () => {
        //     beforeEach(async () => {
                
        //     });

        //     it('should only allow issuer to process payment', async () => {
        //         try {
        //             assert.ok(false);
        //         } catch (err) {
        //             assert.ok(err);
        //         }
        //     });
        
        //     it('should only allow issuer to cancel payment', async () => {
        //         try {
        //             assert.ok(false);
        //         } catch (err) {
        //             assert.ok(err);
        //         }
        //     });

        //     it('should properly process payment', async () => {

        //     })
        // })
    });

});