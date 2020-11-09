This is the solidity contracts:

*Pausable //openzeppelin-solidity (add admin and pause/unpause)

TokenList //When on - only allawed tokens can be traded

ERC20Helper //Operation on erc20 tokens

PozBenefit //POZ Holder settings

ETHHelper //ETH Operations

Manageable //settings

MainCoinManager //CRUD tokens as main payment

Pools //Make a pool

PoolsData //pools data + WithdrawLeftOvers

Invest //invest in a pool

InvestorData // investment data + WithdrawInvestment

ThePoolz // Worker for WithdrawInvestment + WithdrawLeftOvers,
integrated to work with ChainLink: https://github.com/smartcontractkit/external-initiator/wiki/ETH-Call

TestToken + TestMainToken = tokens for testing 
