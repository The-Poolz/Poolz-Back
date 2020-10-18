pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
* @title TestToken is a basic ERC20 Token
*/
contract TestMainToken is StandardToken, Ownable{

    uint256 public totalSupply;
    string public name;
    string public symbol;
    uint32 public decimals;

    /**
    * @dev assign totalSupply to account creating this contract
    */
    constructor() public {
        symbol = "TESTM";
        name = "TestMainToken";
        decimals = 5;
        totalSupply = 5000000000000;

        owner = msg.sender;
        balances[msg.sender] = totalSupply;

        emit Transfer(0x0, msg.sender, totalSupply);
    }
        //for test net
    function FreeTest () public {
        totalSupply = SafeMath.add(totalSupply,5000000);
        balances[msg.sender] = SafeMath.add(balances[msg.sender],5000000);

        emit Transfer(0x0, msg.sender, 5000000);
    }
}

