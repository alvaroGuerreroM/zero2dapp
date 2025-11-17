# Chainlink Integration Guide

This guide will show you how to create a Token Shop to sell the BUENO token paying with CELO token.

## Overview

- The goal is to create a TokenShop to sell the BUENO token.
- The TokenShop has a token price defined, 0.01 usd per token.
- At the CELO token, the user will execute the function approve to allow the TokenShop to transferFrom CELO tokens from the user account to the Token Shop
- When approved, the user can execute the function buyTokenWithCelo sending some CELO token. 
- It will use Chainlink Data Feed CELO/USD rate to calculate how many tokens the user can buy using the CELO amount defined.
- The contract will mint BUENO tokens to the user account.

## On Celo mainet - Example

BuenoToken

[0xCFA45ECA955dd195b5b5Fc0E40d1A1B06f16793C]
(https://celoscan.io/address/0xCFA45ECA955dd195b5b5Fc0E40d1A1B06f16793C)

BuenoTokenShop
[0xf2ba31c76785c728049b4d3C020807867B323272]
(https://celoscan.io/address/0xf2ba31c76785c728049b4d3C020807867B323272)

## Deploy step-by-step

- Your wallet will be on CELO mainnet
- Connect Remix to your wallet
- Deploy BuenoTokenShop on Remix
    - [BuenoTokenShop.sol](https://remix.ethereum.org/#url=https://github.com/ryestew/zero2dapp/blob/chainlink/contracts/BuenoTokenShop.sol)
    - The parameter is the Bueno Token Address
- On Bueno Token, allow BuenoTokenShop to mint Bueno Token
    - execute grantRole
    - role: 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6
        - this is the hash of [MINTER_ROLE](https://github.com/ryestew/zero2dapp/blob/remix-solved/contracts/BuenoToken.sol#L8)
    - account: BuenoTokenShop address
- The BuenoTokenShop is ready to sell Bueno tokens!

## How to buy Bueno tokens

- Go to the CELO token
- Approve the BuenoTokenShop to transferFrom CELO tokens from the user account to the Token Shop
    - spender: BuenoTokenShop address
    - value: the minimum you'd like to spend buying Bueno tokens
- In BuenoTokenShop, execute the function buyTokenWithCelo 
    - amountCelo: the amount in CELO token that you'd like to buy Bueno tokens
    - The amount will be defined in wei, use [eth-converter](https://eth-converter.com/)

