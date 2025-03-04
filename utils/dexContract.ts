import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { DexInterface } from '../types/dex';

const dexAbi = [
  "function getReserves(address token) external view returns (uint256 tokenReserve, uint256 ethReserve)",
  "function getShares(address token, address provider) external view returns (uint256)",
  "function supportedTokens(address) external view returns (bool)",
  "function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256)",
  "function addLiquidity(address token, uint256 tokenAmount) external payable",
  "function removeLiquidity(address token, uint256 shares) external",
  "function swapExactTokensForETH(address tokenIn, uint256 amountIn, uint256 minAmountOut) external",
  "function swapExactETHForTokens(address tokenOut, uint256 minAmountOut) external payable",
  "event TokenSwap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)",
  "event LiquidityAdded(address indexed provider, address indexed token, uint256 amount)",
  "event LiquidityRemoved(address indexed provider, address indexed token, uint256 amount)"
];

export class DexContract implements DexInterface {
  private contract: ethers.Contract;
  private provider: Web3Provider;

  constructor(contractAddress: string, provider: Web3Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress,
      dexAbi,
      provider.getSigner()
    );
  }

  async getReserves(tokenAddress: string) {
    try {
      const [tokenReserve, ethReserve] = await this.contract.getReserves(tokenAddress);
      return {
        tokenReserve: ethers.utils.formatUnits(tokenReserve, 18),
        ethReserve: ethers.utils.formatEther(ethReserve)
      };
    } catch (error) {
      console.error('Error getting reserves:', error);
      throw error;
    }
  }

  async getShares(tokenAddress: string, provider: string) {
    try {
      return await this.contract.getShares(tokenAddress, provider);
    } catch (error) {
      console.error('Error getting shares:', error);
      throw error;
    }
  }

  async supportedTokens(tokenAddress: string) {
    try {
      return await this.contract.supportedTokens(tokenAddress);
    } catch (error) {
      console.error('Error checking supported token:', error);
      throw error;
    }
  }

  async getAmountOut(amountIn: string, reserveIn: string, reserveOut: string) {
    try {
      const amountOut = await this.contract.getAmountOut(
        ethers.utils.parseUnits(amountIn, 18),
        ethers.utils.parseUnits(reserveIn, 18),
        ethers.utils.parseUnits(reserveOut, 18)
      );
      return ethers.utils.formatUnits(amountOut, 18);
    } catch (error) {
      console.error('Error calculating amount out:', error);
      throw error;
    }
  }

  async addLiquidity(tokenAddress: string, tokenAmount: string | ethers.BigNumber, ethAmount: string) {
    try {
      const tokenAmountBN = typeof tokenAmount === 'string' 
        ? ethers.utils.parseUnits(tokenAmount, 18)
        : tokenAmount;
      
      return await this.contract.addLiquidity(
        tokenAddress,
        tokenAmountBN,
        { value: ethers.utils.parseEther(ethAmount) }
      );
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  async removeLiquidity(tokenAddress: string, shares: string | ethers.BigNumber) {
    try {
      const sharesBN = typeof shares === 'string'
        ? ethers.utils.parseUnits(shares, 18)
        : shares;
      
      return await this.contract.removeLiquidity(
        tokenAddress,
        sharesBN
      );
    } catch (error) {
      console.error('Error removing liquidity:', error);
      throw error;
    }
  }

  async swapExactTokensForETH(tokenIn: string, amountIn: string, minAmountOut: string) {
    try {
      return await this.contract.swapExactTokensForETH(
        tokenIn,
        ethers.utils.parseUnits(amountIn, 18),
        ethers.utils.parseEther(minAmountOut)
      );
    } catch (error) {
      console.error('Error swapping tokens for ETH:', error);
      throw error;
    }
  }

  async swapExactETHForTokens(tokenOut: string, minAmountOut: string, ethAmount: string) {
    try {
      return await this.contract.swapExactETHForTokens(
        tokenOut,
        ethers.utils.parseUnits(minAmountOut, 18),
        { value: ethers.utils.parseEther(ethAmount) }
      );
    } catch (error) {
      console.error('Error swapping ETH for tokens:', error);
      throw error;
    }
  }

  onSwap(callback: (event: any) => void) {
    this.contract.on('TokenSwap', callback);
    return () => this.contract.off('TokenSwap', callback);
  }

  onLiquidityAdded(callback: (event: any) => void) {
    this.contract.on('LiquidityAdded', callback);
    return () => this.contract.off('LiquidityAdded', callback);
  }

  onLiquidityRemoved(callback: (event: any) => void) {
    this.contract.on('LiquidityRemoved', callback);
    return () => this.contract.off('LiquidityRemoved', callback);
  }
}

export const createDexContract = (contractAddress: string, provider: Web3Provider) => {
  return new DexContract(contractAddress, provider);
};
