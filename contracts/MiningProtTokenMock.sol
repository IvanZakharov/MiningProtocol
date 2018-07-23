pragma solidity ^0.4.24;

import "./MiningProtToken.sol";


// mock class using StandardToken
contract MiningProtTokenMock is MiningProtToken {

    constructor(address initialAccount, uint256 initialBalance) public {
        balances[initialAccount] = initialBalance;
        totalSupply_ = initialBalance;
    }

}
