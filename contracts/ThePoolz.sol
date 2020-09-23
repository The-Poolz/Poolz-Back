// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract ThePoolz {
    constructor() public {
        Admin = msg.sender;
        Fee = 20; // *10000
        PozFee = 17; // *10000
        PozTimer = 1000; // *10000
        PozDiscount = 1200; // *10000
        MinPoz = 80; // ^Token.decimals
        MinDuration = 0; //need to set
        poolsCount = 0; //Start with 0
        //investors data
        TotalInvestors = 0; // start with 0
    }
    //@dev allow contract to receive funds
    //function() public payable {}
    address public Admin; //only admin can change the global settings
    //Global settings
    uint256 public Fee; //the fee for the pool
    uint256 public PozFee; // the fee for the first part of the pool
    uint256 public PozTimer; //the timer for the first part fo the pool
    uint256 public PozDiscount; // The discout the first part of the pool got
    //address FeeWallet; //keep in contract //the wallet getting the fee
    uint256 public MinPoz; //minimum ammount ofpoz to be part of the discount
    uint256 public MinDuration; //the minimum duration of a pool, in seconds
    enum PoolStatus {Created, Open, OutOfstock, Finished, Close} //the status of the pools
    //ERC20 public ERC20Interface; // for transfering ERC20 tokens // save the last token
    uint256 public poolsCount; // the is of the pool
    struct Pool {
        address Token; //the address of the erc20 toke for sale
        address Creator; //the project owner
        uint256 FinishTime; //Until what time the pool is active
        uint256 Rate; //in Szabo for eth, in $/10000 cent/100
        bool PaymentIsETH; // true- its ETH false - its dai
        uint256 StartAmount; //The total amount of the tokens for sale
        bool IsLocked; // true - the investors getting the tokens after the FinishTime. false - intant deal
        uint256 Lefttokens; // the ammount of tokens left for sale
        uint256 StartTime; // the time the pool open
        uint256 OpenForAll; // The Time that all investors can invest
        uint UnlockedTokens; //for locked pools
        bool TookLeftOvers; //The Creator took the left overs after the pool finished
    }
    mapping(uint256 => Pool) public pools; //the id of the pool with the data
    mapping(address => uint256[]) public poolsMap; //the address and all of the pools id's
    //create a new pool
    function CreatePool(
        address _Token,
        uint256 _FinishTime,
        uint256 _Rate,
        bool _PaymentIsETH,
        uint256 _StartAmount,
        bool _IsLocked
    ) external {
        require(IsERC20(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        require(now + MinDuration <= _FinishTime, "Need more then MinDuration"); // check if the time is OK
        require(
            ERC20(_Token).allowance(msg.sender, address(this)) >= _StartAmount,
            "Must Approve the Transaction"
        );
        uint256 Openforall = ((_FinishTime - block.timestamp) * PozTimer) /
            10000 +
            block.timestamp;
        //register the pool
        pools[poolsCount] = Pool(
            _Token,
            msg.sender,
            _FinishTime,
            _Rate,
            _PaymentIsETH,
            _StartAmount,
            _IsLocked,
            _StartAmount,
            block.timestamp,
            Openforall,
            0,
            false
        );
        poolsMap[msg.sender].push(poolsCount);
        poolsCount++;
        //transfer the tokens
        ERC20(_Token).transferFrom(msg.sender, address(this), _StartAmount);
    }
    // Basic check if this is a erc20 token
    function IsERC20(address _contractAddress) internal view returns (bool) {
        if (ERC20(_contractAddress).totalSupply() > 0) return true;
        return false;
    }
    //Give all the id's of the pools open by sender address
    function GetMyPoolsId() public view returns (uint256[]) {
        return poolsMap[msg.sender];
    }
    function WithdrawLeftOvers(uint _PoolId) external {
        require(pools[_PoolId].Creator == msg.sender || Admin == msg.sender, 'Only the creator can Withdraw (or Admin)'); //or admin
        require(pools[_PoolId].FinishTime >= now && pools[_PoolId].Lefttokens > 0 && !pools[_PoolId].TookLeftOvers, 'Wrong pool status not enable to withdraw'); //pool is finished + got left overs + did not took them    
            pools[_PoolId].TookLeftOvers = true;
            ERC20(pools[_PoolId].Token).transfer(pools[_PoolId].Creator,pools[_PoolId].Lefttokens);
        //check if owner, check if finished, check if got leftovers , transfer Tokens
    }
    //give the full data of the pool, by id
    function GetPoolData(uint256 _id)
        public
        view
        returns (
            address,
            uint256,
            uint256,
            bool,
            uint256,
            bool
        )
    {
        return (
            //check if sender POZ Invester
            pools[_id].Creator,
            pools[_id].FinishTime,
            pools[_id].Rate,
            pools[_id].PaymentIsETH,
            pools[_id].StartAmount,
            pools[_id].IsLocked
        );
    }

    //calculate the status of a pool - TODO
    function GetPoolStatus(uint256 _id) public view returns (PoolStatus) {
        require(_id < poolsCount,'Wrong pool id');
        //Don't like the logic here - ToDo Boolean checks (truth table)
        if (now < pools[_id].OpenForAll && pools[_id].Lefttokens > 0) { //got tokens + only poz investors
            return PoolStatus.Created;
        }
        if (now >= pools[_id].OpenForAll && pools[_id].Lefttokens > 0 && now < pools[_id].FinishTime) { //got tokens + all investors
            return PoolStatus.Created;
        }
        if (pools[_id].Lefttokens == 0 && pools[_id].IsLocked && now < pools[_id].FinishTime)  //no tokens on locked pool, got time 
        {
            return PoolStatus.OutOfstock;
        }
        if (pools[_id].Lefttokens == 0 && !pools[_id].IsLocked) //no tokens on direct pool 
        {
            return PoolStatus.Close;
        }
        if (pools[_id].Lefttokens > 0 && !pools[_id].IsLocked && !pools[_id].TookLeftOvers) { //Got left overs on direct pool
            return PoolStatus.Finished;
        }
        if (now >= pools[_id].FinishTime && !pools[_id].IsLocked) {// After finish time 
           if (pools[_id].TookLeftOvers)         
               return PoolStatus.Close;
            return PoolStatus.Finished;      
        }
        
    }

    address public POZ_Address;
    address public Dai_Address;

    function IsPozInvestor(address _investor) public view returns (bool) {
        if (POZ_Address == Dai_Address) return true; // for test
        return (ERC20(POZ_Address).balanceOf(_investor) >= MinPoz);
    }

    //@dev Send in wei
    function InvestETH(uint256 _PoolId) external payable   
    { 
        require(_PoolId < poolsCount, 'Wrong pool id');
        require(pools[_PoolId].PaymentIsETH,'Pool is not for ETH');
        require(msg.value > 0,'send ETH to invest');
        //check if Poz investor;
        Investors[TotalInvestors] = Investor(
            _PoolId,
            msg.sender,
            msg.value,
            IsPozInvestor(msg.sender),
            0,
            now
        );
        InvestorsMap[msg.sender].push(TotalInvestors);
        TotalInvestors++;
        uint WithDiscount = msg.value/(pools[_PoolId].Rate*(100*10000-PozDiscount)/10000);
        uint TokensAmount = msg.value/pools[_PoolId].Rate;
        if (
            GetPoolStatus(_PoolId) == PoolStatus.Created &&
            IsPozInvestor(msg.sender) &&
            WithDiscount <= pools[_PoolId].Lefttokens //Got The Tokens
        ) {
            //Only for Poz Investor, better price
            pools[_PoolId].Lefttokens-= WithDiscount;
            if (pools[_PoolId].IsLocked) // not locked, will transfer the tokens
                Investors[TotalInvestors-1].TokensOwn = WithDiscount;
            else
                ERC20(pools[_PoolId].Token).transfer(msg.sender,WithDiscount);
            pools[_PoolId].Creator.transfer(msg.value*(100*10000-PozFee)/10000); // send money to project owner - the fee stays on contract
            return;
        }
        if (GetPoolStatus(_PoolId) == PoolStatus.Open &&
            TokensAmount <= pools[_PoolId].Lefttokens //Got The Tokens
            )  {
            //all can invest, no discout price
            pools[_PoolId].Lefttokens-= TokensAmount;
            if (pools[_PoolId].IsLocked) // not locked, will transfer the tokens
                Investors[TotalInvestors-1].TokensOwn = TokensAmount;
            else
                ERC20(pools[_PoolId].Token).transfer(msg.sender,TokensAmount);
            pools[_PoolId].Creator.transfer(msg.value*(100*10000-Fee)/10000); // send money to project owner - the fee stays on contract
            return;
        }
        //can't invest OutOfstock,Finished,Close // TODO - make msg
        revert('Investment not complited');
    }

      //Give all the id's of the investment  by sender address
    function GetMyInvestmentIds() public view returns (uint256[]) {
        return InvestorsMap[msg.sender];
    }

    //Investorsr Data
    uint256 TotalInvestors;
    mapping(uint256 => Investor) Investors;
    mapping(address => uint256[]) InvestorsMap;
    struct Investor {
        uint256 Poolid; //the id of the pool, he got the rate info and the token, check if looked pool
        address InvestorAddress; //      
        uint256 MainCoin; //the amount of the main coin invested (eth/dai), calc with rate
        bool IsPozInvestor; //If the blance of the address got > MinPoz, can get discout if got early
        uint TokensOwn; //the amount of Tokens the investor needto get from the contract
        uint InvestTime; //the time that investment made
    }
} //end of ThePoolz
