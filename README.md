# CreditABS

Play with Assets-Backed Security Application on Ethereum

## Build

``` shell
node scripts/compile.js
# or
npm run compile
```

## Test

This project has unit tests on the contract.

[mocha](https://github.com/mochajs/mocha) is required.

``` shell
mocha tests
# or
npm run test
```

## Run

[MetaMask](https://metamask.io) is required.

``` shell
npm run dev
```

## TODO

- [ ] Allow issuer to cancel a payment.

## Acknowledgement

Basic idea to make a token contract refers to [ERC20](https://theethereum.wiki/w/index.php/ERC20_Token_Standard).

Project structure and web UI refers to [wangshijun/ethereum-contract-workflow](https://github.com/wangshijun/ethereum-contract-workflow)

The way to check contract address refers to [ERC223 implementation](https://github.com/Dexaran/ERC223-token-standard/blob/master/token/ERC223/ERC223_token.sol).