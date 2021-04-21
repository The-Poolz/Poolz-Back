// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./PoolsData.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "poolz-helper/contracts/IPozBenefit.sol";

contract Invest is PoolsData {
    event NewInvestorEvent(uint256 Investor_ID, address Investor_Address);

    modifier CheckTime(uint256 _Time) {
        require(now >= _Time, "Pool not open yet");
        _;
    }

    modifier validateSender(){
        require(
            msg.sender == tx.origin && !isContract(msg.sender),
            "Some thing wrong with the msgSender"
        );
        _;
    }

    //using SafeMath for uint256;
    constructor() public {
        //TotalInvestors = 0;
    }

    //Investorsr Data
    uint256 internal TotalInvestors;
    mapping(uint256 => Investor) Investors;
    mapping(address => uint256[]) InvestorsMap;
    struct Investor {
        uint256 Poolid; //the id of the pool, he got the rate info and the token, check if looked pool
        address InvestorAddress; //
        uint256 MainCoin; //the amount of the main coin invested (eth/dai), calc with rate
        uint256 TokensOwn; //the amount of Tokens the investor needto get from the contract
        uint256 InvestTime; //the time that investment made
    }

    function getTotalInvestor() external view returns(uint256){
        return TotalInvestors;
    }
    
    //@dev Send in wei
    function InvestETH(uint256 _PoolId)
        external
        payable
        ReceivETH(msg.value, msg.sender, MinETHInvest)
        whenNotPaused
        CheckTime(pools[_PoolId].MoreData.StartTime)
        isPoolId(_PoolId)
        validateSender()
    {
        require(pools[_PoolId].BaseData.Maincoin == address(0x0), "Pool is only for ETH");
        uint256 ThisInvestor = NewInvestor(msg.sender, msg.value, _PoolId);
        uint256 Tokens = CalcTokens(_PoolId, msg.value, msg.sender);
        
        TokenAllocate(_PoolId, ThisInvestor, Tokens);

        uint256 EthMinusFee =
            SafeMath.div(
                SafeMath.mul(msg.value, SafeMath.sub(10000, CalcFee(_PoolId))),
                10000
            );
        // send money to project owner - the fee stays on contract
        TransferETH(payable(pools[_PoolId].BaseData.Creator), EthMinusFee); 
        RegisterInvest(_PoolId, Tokens);
    }

    function InvestERC20(uint256 _PoolId, uint256 _Amount)
        external
        whenNotPaused
        CheckTime(pools[_PoolId].MoreData.StartTime)
        isPoolId(_PoolId)
        validateSender()
    {
        require(
            pools[_PoolId].BaseData.Maincoin != address(0x0),
            "Pool is for ETH, use InvestETH"
        );
        TransferInToken(pools[_PoolId].BaseData.Maincoin, msg.sender, _Amount);
        uint256 ThisInvestor = NewInvestor(msg.sender, _Amount, _PoolId);
        uint256 Tokens = CalcTokens(_PoolId, _Amount, msg.sender);

        TokenAllocate(_PoolId, ThisInvestor, Tokens);

        uint256 RegularFeePay =
            SafeMath.div(SafeMath.mul(_Amount, CalcFee(_PoolId)), 10000);

        uint256 RegularPaymentMinusFee = SafeMath.sub(_Amount, RegularFeePay);
        FeeMap[pools[_PoolId].BaseData.Maincoin] = SafeMath.add(
            FeeMap[pools[_PoolId].BaseData.Maincoin],
            RegularFeePay
        );
        TransferToken(
            pools[_PoolId].BaseData.Maincoin,
            pools[_PoolId].BaseData.Creator,
            RegularPaymentMinusFee
        ); // send money to project owner - the fee stays on contract
        RegisterInvest(_PoolId, Tokens);
    }

    function TokenAllocate(uint256 _PoolId, uint256 _ThisInvestor, uint256 _Tokens) internal {
        if (isPoolLocked(_PoolId)) {
            Investors[_ThisInvestor].TokensOwn = SafeMath.add(
                Investors[_ThisInvestor].TokensOwn,
                _Tokens
            );
        } else {
            // not locked, will transfer the tokens
            TransferToken(pools[_PoolId].BaseData.Token, Investors[_ThisInvestor].InvestorAddress, _Tokens);
        }
    }

    function RegisterInvest(uint256 _PoolId, uint256 _Tokens) internal {
        pools[_PoolId].MoreData.Lefttokens = SafeMath.sub(
            pools[_PoolId].MoreData.Lefttokens,
            _Tokens
        );
        if (pools[_PoolId].MoreData.Lefttokens == 0) emit FinishPool(_PoolId);
        else emit PoolUpdate(_PoolId);
    }

    function NewInvestor(
        address _Sender,
        uint256 _Amount,
        uint256 _Pid
    ) internal returns (uint256) {
        Investors[TotalInvestors] = Investor(
            _Pid,
            _Sender,
            _Amount,
            0,
            block.timestamp
        );
        InvestorsMap[msg.sender].push(TotalInvestors);
        emit NewInvestorEvent(TotalInvestors, _Sender);
        TotalInvestors = SafeMath.add(TotalInvestors, 1);
        return SafeMath.sub(TotalInvestors, 1);
    }

    function CalcTokens(
        uint256 _Pid,
        uint256 _Amount,
        address _Sender
    ) internal returns (uint256) {
        uint256 msgValue = _Amount;
        uint256 result = 0;
        if (GetPoolStatus(_Pid) == PoolStatus.Created) {
            IsWhiteList(_Sender, pools[_Pid].MoreData.WhiteListId, _Amount);
            result = SafeMath.mul(msgValue, pools[_Pid].BaseData.POZRate);
        }
        if (GetPoolStatus(_Pid) == PoolStatus.Open) {
            require(
                msgValue >= MinETHInvest && msgValue <= MaxETHInvest,
                "Investment amount not valid"
            );
            require(VerifyPozHolding(_Sender), "Only POZ holder can invest");
            LastRegisterWhitelist(_Sender, pools[_Pid].MoreData.WhiteListId);
            result = SafeMath.mul(msgValue, pools[_Pid].BaseData.Rate);
        }
        if (result >= 10**21) {
            if (pools[_Pid].MoreData.Is21DecimalRate) {
                result = SafeMath.div(result, 10**21);
            }
            require(
                result <= pools[_Pid].MoreData.Lefttokens,
                "Not enough tokens in the pool"
            );
            return result;
        }
        revert("Wrong pool status to CalcTokens");
    }

    function VerifyPozHolding(address _Sender) internal view returns(bool){
        if(Benefit_Address == address(0)) return true;
        return IPOZBenefit(Benefit_Address).IsPOZHolder(_Sender);
    }

    function LastRegisterWhitelist(address _Sender,uint256 _Id) internal returns(bool) {
        if (_Id == 0) return true; //turn-off
        IWhiteList(WhiteList_Address).LastRoundRegister(_Sender, _Id);
        return true;
    }

    function CalcFee(uint256 _Pid) internal view returns (uint256) {
        if (GetPoolStatus(_Pid) == PoolStatus.Created) {
            return PozFee;
        }
        if (GetPoolStatus(_Pid) == PoolStatus.Open) {
            return Fee;
        }
        //will not get here, will fail on CalcTokens
    }

    //@dev use it with  require(msg.sender == tx.origin)
    function isContract(address _addr) internal view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    //  no need register - will return true or false base on Check
    //  if need register - revert or true
    function IsWhiteList(
        address _Investor,
        uint256 _Id,
        uint256 _Amount
    ) internal returns (bool) {
        if (_Id == 0) return true; //turn-off
        IWhiteList(WhiteList_Address).Register(_Investor, _Id, _Amount); //will revert if fail
        return true;
    }
}
