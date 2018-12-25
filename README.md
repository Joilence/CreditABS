# CreditABS

Play with Assets-Backed Security Application on Ethereum

## Build

``` javascript
node scripts/compile.js
```

## Test

[mocha](https://github.com/mochajs/mocha) is required.

``` javascript
mocha tests
```

## TODO

- [ ] Allow issuer to cancel a payment.

## Acknowledgement

Basic idea to make a token contract refers to [ERC20](https://theethereum.wiki/w/index.php/ERC20_Token_Standard).

Project structure and several ideas refers to [wangshijun/ethereum-contract-workflow](https://github.com/wangshijun/ethereum-contract-workflow)

The way to check contract address refers to [ERC223 implementation](https://github.com/Dexaran/ERC223-token-standard/blob/master/token/ERC223/ERC223_token.sol).