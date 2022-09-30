# Poolz-Back
[![Build Status](https://travis-ci.com/The-Poolz/Poolz-Back.svg?branch=main)](https://travis-ci.com/The-Poolz/Poolz-Back)
[![codecov](https://codecov.io/gh/The-Poolz/Poolz-Back/branch/master/graph/badge.svg)](https://codecov.io/gh/The-Poolz/Poolz-Back)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/poolz-back/badge)](https://www.codefactor.io/repository/github/the-poolz/poolz-back)

**The-Poolz** core decentralized application for creating **Initial DEX Offerings**.

### Navigation

- [Installation](#installation)
- [Contract relations](#uml)
- [Pool types](#pool-types)
- [Pool statuses](#pool-statuses)
- [License](#license)
#### Installation

```console
npm install
```

#### Testing

```console
truffle run coverage
```

#### Deployment

```console
truffle dashboard
```

```console
truffle migrate --f 1 --to 1 --network dashboard
```
## UML

![classDiagram](https://user-images.githubusercontent.com/68740472/193278591-43301008-4720-4484-a313-e224d02c54b4.svg)

## Pool types
The main types are Direct Selling Pools (**DSP**) and Time Locked Pools (**TLP**).
- **Direct Sale Pools (DSP):** These are pools without any lock-in period, where investors get the token immediately after the swap.
 - **Time-Locked Pools (TLP):** These pools have a predefined lock-in period and investors receive their swapped tokens only after the completion of this duration.

## Pool statuses
https://github.com/The-Poolz/Poolz-Back/blob/6206ad88b15697946453ddfd26e02610bef93ec6/contracts/PoolsData.sol#L7
- **Created:** the pool is exclusively available for $POOLZ token holders.

- **Open:** the pool is available for all Poolz users.

- **Out of Stock:** the predefined supply of auctioning tokens has been sold-out, but the pool’s duration has not ended. In the case of TLP, tokens will be locked for the remaining duration.

- **Finished:** the pool has reached the end of its stipulated duration. Both for DSP and TLP, the leftover tokens are returned to the PO’s wallet at this point. Investors, on the other hand, get their tokens purchased (swapped) through TLP.

- **Closed:** the pool is complete and tokens have been duly disbursed.

## License
The-Poolz Contracts is released under the MIT License.
