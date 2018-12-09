pragma solidity ^0.5.1;

// Specifically For Credit Assets Securitization
// https://wiki.mbalib.com/wiki/信贷资产证券化

import "./SafeMath.sol";

contract CreditABS {
    using SafeMath for uint256;

    enum PaymentState {Voting, Declined, Approved, Completed}

    struct Payment {
        string description;
        uint256 amount;
        address payable receiver;
        PaymentState state;
        uint256 voteCount;
        mapping(address => bool) votes;
    }

    // public variables will have an auto-generated getter function
    string public name;
    address public issuer;
    uint256 public financingGoal;
    string public description; // certificates & description for this security
    
    uint256 public numOfTokenholders;
    mapping(address => uint256) public balances;
    Payment[] public payments;

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer can do this.");
        _;
    }
    
    modifier onlyTokenholder() {
        require(balances[msg.sender] > 0, "Only tokenholder can do this.");
        _;
    }

    constructor(string memory _name, uint256 _goal, string memory _description) public {
        issuer = msg.sender;
        name = _name;
        financingGoal = _goal;
        description = _description;

        numOfTokenholders = 0;
    }

    function purchase() public payable {
        require(msg.value > 0, "Value should greater than 0 to purchase token.");
        if (balances[msg.sender] == 0)
            numOfTokenholders += 1;
        balances[msg.sender] += balances[msg.sender].add(msg.value);
    }

    function transfer(address _to, uint256 _amount) public {
        _transfer(msg.sender, _to, _amount);
    }

    function createPayment(string memory _description, uint _amount, address payable _receiver) public onlyIssuer {
        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            state: PaymentState.Voting,
            voteCount: 0
        });

        payments.push(newPayment);
    }

    function approvePayment(uint256 index) public onlyTokenholder {
        Payment storage payment = payments[index];

        require(payment.state == PaymentState.Voting, "This payment is no longer open for vote.");
        require(!payment.votes[msg.sender], "Cannot vote twice.");

        payment.votes[msg.sender] = true;
        payment.voteCount += 1;

        if (payment.voteCount >= numOfTokenholders)
            payment.state = PaymentState.Approved;

        // TODO: Payment expired and dropped.
    }

    function processPayment(uint256 index) public onlyIssuer {
        Payment storage payment = payments[index];

        require(payment.state == PaymentState.Approved, "This payment is either ended or hasn't been approved.");
        require(address(this).balance >= payment.amount);
        payment.receiver.transfer(payment.amount);

        payment.state == PaymentState.Completed;
    }

    function _transfer(address _from, address _to, uint256 _amount) private {
        uint256 codeLength;
        require(balances[_from] >= _amount, "Tokenholder does not have enough token.");
        
        assembly {
            // Retrieve the size of the code on target address, this needs assembly .
            codeLength := extcodesize(_to)
        }

        require(codeLength == 0, "Token can only be owned by EOA.");

        balances[_from] = balances[_from].sub(_amount);
        balances[_to] = balances[_to].add(_amount);

        if (balances[_from] == 0)
            numOfTokenholders -= 1;
    }
}