// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts@5.4.0/token/ERC20/IERC20.sol";

interface TokenInterface {
	function balanceOf(address account) external view returns (uint256);
    function mint(address account, uint256 amount) external;
}

contract BuenoTokenShop {

    address public owner;
	TokenInterface public token;
    uint256 public tokenPrice = 1; //1 token = 0.01 usd, with 2 decimal places

    IERC20 public immutable celoToken;	
    // https://celo.blockscout.com/address/0x471EcE3750Da237f93B8E339c536989b8978a438  
    address celoAddress = 0x471EcE3750Da237f93B8E339c536989b8978a438;

	AggregatorV3Interface internal priceFeed;

    
	constructor(address tokenAddress) {
		owner = msg.sender;

    	token = TokenInterface(tokenAddress);
		celoToken = IERC20(celoAddress);

        /**
        * https://docs.chain.link/data-feeds/price-feeds/addresses
        * 
        * Network: Celo
        * Aggregator: CELO/USD
        * Address: 0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e
		* https://data.chain.link/feeds/celo/mainnet/celo-usd
        */
        priceFeed = AggregatorV3Interface(0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e);
	}

	/**
 	* Returns Chainlink Data Feed latest answer
 	*/
	function getChainlinkDataFeedLatestAnswer() public view returns (int) {
    	(
        	/*uint80 roundID*/,
        	int price,
        	/*uint startedAt*/,
        	/*uint timeStamp*/,
        	/*uint80 answeredInRound*/
    	) = priceFeed.latestRoundData();
    	return price;
	}

	function tokenAmount(uint256 amountNative) public view returns (uint256) {
    	//Sent amountNative, how many usd I have
    	uint256 nativeUsd = uint256(getChainlinkDataFeedLatestAnswer());	//with 8 decimal places
    	uint256 amountUSD = amountNative * nativeUsd / 10**18; 				//ETH = 18 decimal places
    	uint256 amountToken = amountUSD / tokenPrice / 10**(8/2);  			//8 decimal places from ETHUSD / 2 decimal places from token 
    	return amountToken;
	} 

    // Before execute buyToken, you must go to the token and execute the Approve function to the TokenShop Address
    function buyTokenWithCelo(uint256 amountCelo) public returns (uint256 amountToken) {
        amountToken = tokenAmount(amountCelo);
        celoToken.transferFrom(msg.sender, address(this), amountCelo);
        token.mint(msg.sender, amountToken);
        return amountToken;
    } 

    function balances (address account) public view returns (uint256 celoB, uint256 tokenB) {
        celoB = celoToken.balanceOf(account);
        tokenB = token.balanceOf(account);
        return (celoB, tokenB);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function mintToken(address account, uint256 amount) public onlyOwner {
        token.mint(account, amount);
    }

    function withdraw() external onlyOwner {
		celoToken.transfer(msg.sender, celoToken.balanceOf(address(this)));
    }     
}
