import { ethers } from 'ethers';

export interface DexInterface {
  getReserves(token: string): Promise<{
    tokenReserve: string;
    ethReserve: string;
  }>;
  
  getShares(token: string, provider: string): Promise<ethers.BigNumber>;
  
  supportedTokens(token: string): Promise<boolean>;
  
  getAmountOut(
    amountIn: string,
    reserveIn: string,
    reserveOut: string
  ): Promise<string>;
  
  addLiquidity(
    token: string,
    tokenAmount: string | ethers.BigNumber,
    ethAmount: string
  ): Promise<ethers.ContractTransaction>;
  
  removeLiquidity(
    token: string,
    shares: string | ethers.BigNumber
  ): Promise<ethers.ContractTransaction>;
  
  swapExactTokensForETH(
    tokenIn: string,
    amountIn: string,
    minAmountOut: string
  ): Promise<ethers.ContractTransaction>;
  
  swapExactETHForTokens(
    tokenOut: string,
    minAmountOut: string,
    ethAmount: string
  ): Promise<ethers.ContractTransaction>;
}
