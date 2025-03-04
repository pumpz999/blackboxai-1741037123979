import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import dexAbi from '../artifacts/contracts/DEX.sol/DEX.json';

export class DexContract {
  private contract: ethers.Contract;
  private provider: Web3Provider;

  constructor(contractAddress: string, provider: Web3Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      contractAddress,
      dexAbi.abi,
      provider.getSigner()
    );
  }

  async addLiquidity(tokenAddress: string, tokenAmount: string, ethAmount: string) {
    try {
      const tx = await this.contract.addLiquidity(
        tokenAddress,
        ethers.utils.parseUnits(tokenAmount, 18),
        { value: ethers.utils.parseEther(ethAmount) }
      );
      return await tx.wait();
    } catch (error) {
      console.error('Error adding liquidity:', error);
      throw error;
    }
  }

  async swapExactTokensForETH(
    tokenIn: string,
    amountIn: string,
    minAmountOut: string
  ) {
    try {
      const tx = await this.contract.swapExactTokensForETH(
        tokenIn,
        ethers.utils.parseUnits(amountIn, 18),
        ethers.utils.parseEther(minAmountOut)
      );
      return await tx.wait();
    } catch (error) {
      console.error('Error swapping tokens for ETH:', error);
      throw error;
    }
  }

  async swapExactETHForTokens(
    tokenOut: string,
    minAmountOut: string,
    ethAmount: string
  ) {
    try {
      const tx = await this.contract.swapExactETHForTokens(
        tokenOut,
        ethers.utils.parseUnits(minAmountOut, 18),
        { value: ethers.utils.parseEther(ethAmount) }
      );
      return await tx.wait();
    } catch (error) {
      console.error('Error swapping ETH for tokens:', error);
      throw error;
    }
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

  async isSupportedToken(tokenAddress: string) {
    try {
      return await this.contract.supportedTokens(tokenAddress);
    } catch (error) {
      console.error('Error checking supported token:', error);
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
