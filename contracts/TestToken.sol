// SPDX-License-Identifier: MIT
pragma solidity >=0.4.24 <0.7.0;

// import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
// import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

/**
* @title TestToken is a basic ERC20 Token
*/
contract TestToken is ERC20, Ownable{

    // uint256 public totalSupply;
    // string public name;
    // string public symbol;
    // uint32 public decimals;

    /**
    * @dev assign totalSupply to account creating this contract
    */
    // constructor() public {
    //     symbol = "TEST";
    //     name = "TestToken";
    //     decimals = 5;
    //     totalSupply = 5000000000000;

    //     owner = msg.sender;
    //     balances[msg.sender] = totalSupply;

    //     emit Transfer(0x0, msg.sender, totalSupply);
    // }
    constructor() ERC20("TestToken", "TEST") public {
        _setupDecimals(5);
        _mint(msg.sender, 5000000000000);

    }
    //for test net
    // function FreeTest () public {
    //     totalSupply = SafeMath.add(totalSupply,5000000);
    //     balances[msg.sender] = SafeMath.add(balances[msg.sender],5000000);

    //     emit Transfer(0x0, msg.sender, 5000000);
    // }
    function FreeTest () public {
        _mint(msg.sender, 5000000);
    }
}

