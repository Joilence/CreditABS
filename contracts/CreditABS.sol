pragma solidity ^0.4.24;

// Specifically For Credit Assets Securitization
// https://wiki.mbalib.com/wiki/信贷资产证券化

// import "./SafeMath.sol";

library SafeMath {
    /**
    * @dev Multiplies two numbers, reverts on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafaMath: Cannot do mul()");

        return c;
    }

    /**
    * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, "SafeMath: The divisor cannot be zero.");
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: sub() result cannot be less than zero.");
        uint256 c = a - b;

        return c;
    }

    /**
    * @dev Adds two numbers, reverts on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: add() overflow.");

        return c;
    }

    /**
    * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
    * reverts when dividing by zero.
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "The divisor cannot be zero");
        return a % b;
    }
}

contract CreditABS {
    using SafeMath for uint256;

    enum PaymentState {Voting, Declined, Approved, Completed}

    struct Payment {
        string description;
        uint256 amount;
        address receiver;
        PaymentState state;
        uint256 voteShare;
        mapping(address => bool) votes;
    }

    // public variables will have an auto-generated getter function
    string public name;
    address public issuer;
    uint256 public financingGoal;
    uint256 public fundReceived;
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
        fundReceived = 0;
    }

    function purchase() public payable {
        require(msg.value > 0, "Value should greater than 0 to purchase token.");
        if (balances[msg.sender] == 0)
            numOfTokenholders += 1;
        balances[msg.sender] += balances[msg.sender].add(msg.value);
        fundReceived = fundReceived.add(msg.value);
    }

    function checkBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function transfer(address _to, uint256 _amount) public {
        _transfer(msg.sender, _to, _amount);
    }

    function createPayment(string memory _description, uint _amount, address _receiver) public onlyIssuer {
        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            state: PaymentState.Voting,
            voteShare: 0
        });

        payments.push(newPayment);
    }

    function approvePayment(uint256 index) public onlyTokenholder {
        Payment storage payment = payments[index];

        require(payment.state == PaymentState.Voting, "This payment is no longer open for vote.");
        require(!payment.votes[msg.sender], "Cannot vote twice.");

        payment.votes[msg.sender] = true;
        payment.voteShare = payment.voteShare.add(balances[msg.sender]);

        if (payment.voteShare >= (fundReceived / 2) )
            payment.state = PaymentState.Approved;
    }

    function processPayment(uint256 index) public onlyIssuer {
        Payment storage payment = payments[index];

        require(payment.state == PaymentState.Approved, "This payment is either ended or hasn't been approved.");
        require(address(this).balance >= payment.amount, "The contract doesn't have enough money.");
        payment.receiver.transfer(payment.amount);

        payment.state == PaymentState.Completed;
    }

    function _transfer(address _from, address _to, uint256 _amount) private {
        uint256 codeLength;
        require(balances[_from] >= _amount, "Tokenholder does not have enough token.");
        
        assembly {
            // Retrieve the size of the code on target address, this needs assembly.
            codeLength := extcodesize(_to)
        }

        require(codeLength == 0, "Token can only be owned by EOA.");

        balances[_from] = balances[_from].sub(_amount);
        balances[_to] = balances[_to].add(_amount);

        if (balances[_from] == 0)
            numOfTokenholders -= 1;
    }
}