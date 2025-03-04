// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DEX is ReentrancyGuard, Ownable {
    // Events
    event TokenSwap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event LiquidityAdded(
        address indexed provider,
        address indexed token,
        uint256 amount
    );

    event LiquidityRemoved(
        address indexed provider,
        address indexed token,
        uint256 amount
    );

    // Structs
    struct Pool {
        uint256 tokenReserve;
        uint256 ethReserve;
        uint256 totalShares;
        mapping(address => uint256) shares;
    }

    // State variables
    mapping(address => Pool) public pools;
    mapping(address => bool) public supportedTokens;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    uint256 private constant PRECISION = 1e18;

    // Modifiers
    modifier validToken(address token) {
        require(supportedTokens[token], "Token not supported");
        _;
    }

    // Functions
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }

    function addLiquidity(address token, uint256 tokenAmount) 
        external 
        payable 
        nonReentrant 
        validToken(token) 
    {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(msg.value > 0, "ETH amount must be greater than 0");

        Pool storage pool = pools[token];
        uint256 shares;

        if (pool.totalShares == 0) {
            shares = msg.value;
            require(shares >= MINIMUM_LIQUIDITY, "Insufficient initial liquidity");
        } else {
            uint256 ethReserve = pool.ethReserve;
            uint256 tokenReserve = pool.tokenReserve;
            uint256 tokenAmount_ = (msg.value * tokenReserve) / ethReserve;
            require(tokenAmount >= tokenAmount_, "Insufficient token amount");
            shares = (msg.value * pool.totalShares) / ethReserve;
        }

        require(shares > 0, "Shares must be greater than 0");

        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        pool.ethReserve += msg.value;
        pool.tokenReserve += tokenAmount;
        pool.totalShares += shares;
        pool.shares[msg.sender] += shares;

        emit LiquidityAdded(msg.sender, token, tokenAmount);
    }

    function removeLiquidity(address token, uint256 shares) 
        external 
        nonReentrant 
        validToken(token) 
    {
        Pool storage pool = pools[token];
        require(shares > 0 && shares <= pool.shares[msg.sender], "Invalid shares");

        uint256 ethAmount = (shares * pool.ethReserve) / pool.totalShares;
        uint256 tokenAmount = (shares * pool.tokenReserve) / pool.totalShares;

        pool.ethReserve -= ethAmount;
        pool.tokenReserve -= tokenAmount;
        pool.totalShares -= shares;
        pool.shares[msg.sender] -= shares;

        if (ethAmount > 0) {
            payable(msg.sender).transfer(ethAmount);
        }
        if (tokenAmount > 0) {
            IERC20(token).transfer(msg.sender, tokenAmount);
        }

        emit LiquidityRemoved(msg.sender, token, tokenAmount);
    }

    function swapExactTokensForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant validToken(tokenIn) {
        require(amountIn > 0, "Amount must be greater than 0");
        Pool storage pool = pools[tokenIn];
        
        uint256 amountOut = getAmountOut(amountIn, pool.tokenReserve, pool.ethReserve);
        require(amountOut >= minAmountOut, "Insufficient output amount");

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        payable(msg.sender).transfer(amountOut);

        pool.tokenReserve += amountIn;
        pool.ethReserve -= amountOut;

        emit TokenSwap(msg.sender, tokenIn, address(0), amountIn, amountOut);
    }

    function swapExactETHForTokens(
        address tokenOut,
        uint256 minAmountOut
    ) external payable nonReentrant validToken(tokenOut) {
        require(msg.value > 0, "Amount must be greater than 0");
        Pool storage pool = pools[tokenOut];
        
        uint256 amountOut = getAmountOut(msg.value, pool.ethReserve, pool.tokenReserve);
        require(amountOut >= minAmountOut, "Insufficient output amount");

        IERC20(tokenOut).transfer(msg.sender, amountOut);

        pool.ethReserve += msg.value;
        pool.tokenReserve -= amountOut;

        emit TokenSwap(msg.sender, address(0), tokenOut, msg.value, amountOut);
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");

        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    function getReserves(address token) 
        external 
        view 
        validToken(token) 
        returns (uint256 tokenReserve, uint256 ethReserve) 
    {
        Pool storage pool = pools[token];
        return (pool.tokenReserve, pool.ethReserve);
    }

    function getShares(address token, address provider) 
        external 
        view 
        validToken(token) 
        returns (uint256) 
    {
        return pools[token].shares[provider];
    }

    // Emergency withdraw function (only owner)
    function emergencyWithdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20(token).transfer(
                owner(),
                IERC20(token).balanceOf(address(this))
            );
        }
    }
}
