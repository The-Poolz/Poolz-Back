// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./PoolsData.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Invest is PoolsData {
    //using SafeMath for uint256;
    constructor() public {
        TotalInvestors = 0;
    }

    //Investorsr Data
    uint256 internal TotalInvestors;
    mapping(uint256 => Investor) Investors;
    mapping(address => uint256[]) InvestorsMap;
    struct Investor {
        uint256 Poolid; //the id of the pool, he got the rate info and the token, check if looked pool
        address InvestorAddress; //
        uint256 MainCoin; //the amount of the main coin invested (eth/dai), calc with rate
        bool IsPozInvestor; //If the blance of the address got > MinPoz, can get discout if got early
        uint256 TokensOwn; //the amount of Tokens the investor needto get from the contract
        uint256 InvestTime; //the time that investment made
    }

    //@dev Send in wei
    function InvestETH(uint256 _PoolId)
        external
        payable
        ReceivETH(msg.value, msg.sender)
    {
        require(_PoolId < poolsCount, "Wrong pool id");
        require(pools[_PoolId].Maincoin == address(0x0), "Pool is not for ETH");
        Investors[TotalInvestors] = Investor(
            _PoolId,
            msg.sender,
            msg.value,
            IsPOZInvestor(msg.sender),
            0,
            block.timestamp
        );
        InvestorsMap[msg.sender].push(TotalInvestors);
        TotalInvestors = SafeMath.add(TotalInvestors,1);
        uint256 WithDiscount = SafeMath.div(msg.value, pools[_PoolId].POZRate);
        uint256 TokensAmount = SafeMath.div(msg.value, pools[_PoolId].Rate);
        if (
            GetPoolStatus(_PoolId) == PoolStatus.Created &&
            IsPOZInvestor(msg.sender) &&
            WithDiscount <= pools[_PoolId].Lefttokens //Got The Tokens
        ) {
            //Only for Poz Investor, better price
            pools[_PoolId].Lefttokens = SafeMath.sub(
                pools[_PoolId].Lefttokens,
                WithDiscount
            );
            if (pools[_PoolId].IsLocked) {
                Investors[TotalInvestors - 1].TokensOwn = SafeMath.add(
                    Investors[TotalInvestors - 1].TokensOwn,
                    WithDiscount
                );
            } else {
                // not locked, will transfer the toke
                TransferToken(pools[_PoolId].Token, msg.sender, WithDiscount);
            }
            uint256 EthMinusPozFee = SafeMath.mul(
                SafeMath.div(msg.value, 10000),
                SafeMath.sub(10000, PozFee)
            );
            TransferETH(pools[_PoolId].Creator, EthMinusPozFee); // send money to project owner - the fee stays on contract
            if (pools[_PoolId].Lefttokens == 0) emit FinishPool(_PoolId);
            return;
        }
        else if (
            GetPoolStatus(_PoolId) == PoolStatus.Open &&
            TokensAmount <= pools[_PoolId].Lefttokens //Got The Tokens
        ) {
            //all can invest, no discout price
            pools[_PoolId].Lefttokens =SafeMath.sub(
                pools[_PoolId].Lefttokens,
                TokensAmount
            ); 
            if (pools[_PoolId].IsLocked) {
                Investors[TotalInvestors - 1].TokensOwn = SafeMath.add(
                    Investors[TotalInvestors - 1].TokensOwn,
                    TokensAmount
                );
            } else {
                // not locked, will transfer the tokens
                TransferToken(pools[_PoolId].Token, msg.sender, TokensAmount);
            }
            uint256 EthMinusFee = SafeMath.mul(
                SafeMath.div(msg.value, 10000),
                SafeMath.sub(10000, Fee)
            );
            TransferETH(
                pools[_PoolId].Creator,
                EthMinusFee
            ); // send money to project owner - the fee stays on contract
            if (pools[_PoolId].Lefttokens == 0) emit FinishPool(_PoolId);
            return;
        }
        //can't invest OutOfstock,Finished,Close // TODO - make msg
        revert("Investment not complited");
    }

    function InvestERC20(uint256 _PoolId, uint256 _Amount) external payable {
        require(_PoolId < poolsCount, "Wrong pool id");
        require(
            pools[_PoolId].Maincoin != address(0x0),
            "Pool is for ETH, use InvetETH"
        );
        require(_Amount > 10000, "Need invest more then 10000");
        TransferInToken(pools[_PoolId].Maincoin,msg.sender,_Amount);  
        Investors[TotalInvestors] = Investor(
            _PoolId,
            msg.sender,
            _Amount,
            IsPOZInvestor(msg.sender),
            0,
            block.timestamp
        );
        InvestorsMap[msg.sender].push(TotalInvestors);
        TotalInvestors++;
        uint256 WithDiscount = SafeMath.div(_Amount, pools[_PoolId].POZRate);
        uint256 TokensAmount = SafeMath.div(_Amount, pools[_PoolId].Rate);
        if (
            GetPoolStatus(_PoolId) == PoolStatus.Created &&
            IsPOZInvestor(msg.sender) && //check if Poz investor;
            WithDiscount <= pools[_PoolId].Lefttokens //Got The Tokens
        ) {
            //Only for Poz Investor, better price
            pools[_PoolId].Lefttokens = SafeMath.sub(
                pools[_PoolId].Lefttokens,
                WithDiscount
            );
            if (pools[_PoolId].IsLocked) {
               Investors[TotalInvestors - 1].TokensOwn = SafeMath.add(
                    Investors[TotalInvestors - 1].TokensOwn,
                    WithDiscount
                );
            } else {
                // not locked, will transfer the toke
                TransferToken(pools[_PoolId].Token, msg.sender, WithDiscount);
            }
            uint256 FeePay = SafeMath.mul(
                SafeMath.div(msg.value, 10000),
                PozFee
            );
            uint256 PaymentMinusFee = SafeMath.sub(_Amount , FeePay);
            FeeMap[pools[_PoolId].Maincoin] = SafeMath.add(FeeMap[pools[_PoolId].Maincoin] ,FeePay); //save the fee amount, in case some one put main coin as pool coin
            TransferToken(
                pools[_PoolId].Maincoin,
                pools[_PoolId].Creator,
                PaymentMinusFee
            ); // send money to project owner - the fee stays on contract
            if (pools[_PoolId].Lefttokens == 0) emit FinishPool(_PoolId);
            return;
        } else if (
            GetPoolStatus(_PoolId) == PoolStatus.Open &&
            TokensAmount <= pools[_PoolId].Lefttokens //Got The Tokens
        ) {
            //all can invest, no discout price
            pools[_PoolId].Lefttokens=SafeMath.sub(
                pools[_PoolId].Lefttokens,
                TokensAmount
            ); 
            if (pools[_PoolId].IsLocked) {
               Investors[TotalInvestors - 1].TokensOwn = SafeMath.add(
                    Investors[TotalInvestors - 1].TokensOwn,
                    TokensAmount
                );
            } else {
                // not locked, will transfer the tokens
                TransferToken(pools[_PoolId].Token, msg.sender, TokensAmount);
            }
            uint256 RegularFeePay = SafeMath.mul(
                SafeMath.div(msg.value, 10000),
                Fee
            );
            uint256 RegularPaymentMinusFee = SafeMath.sub(_Amount , RegularFeePay);
            FeeMap[pools[_PoolId].Maincoin] = SafeMath.add(FeeMap[pools[_PoolId].Maincoin] ,RegularFeePay);
            TransferToken(
                pools[_PoolId].Maincoin,
                pools[_PoolId].Creator,
                RegularPaymentMinusFee
            ); // send money to project owner - the fee stays on contract
            if (pools[_PoolId].Lefttokens == 0) emit FinishPool(_PoolId);
            return;
        }
        //can't invest OutOfstock,Finished,Close // TODO - make msg
        revert("Investment not complited");
    }
}
