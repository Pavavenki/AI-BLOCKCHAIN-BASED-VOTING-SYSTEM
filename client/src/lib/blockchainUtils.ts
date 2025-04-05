import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import votingContractABI from '../../contracts/VotingContract.json';

const contractAddress = process.env.VITE_CONTRACT_ADDRESS as string;
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

class BlockchainService {
  private contract;

  constructor() {
    this.contract = new web3.eth.Contract(
      votingContractABI.abi as AbiItem[],
      contractAddress
    );
  }

  async connectWallet(): Promise<string[]> {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }
    return await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async castVote(candidateId: number, voterAddress: string): Promise<string> {
    try {
      const result = await this.contract.methods.vote(candidateId).send({
        from: voterAddress,
        gas: 200000
      });
      return result.transactionHash;
    } catch (error) {
      throw new Error(`Failed to cast vote: ${error.message}`);
    }
  }

  async getCandidateDetails(candidateId: number): Promise<any> {
    try {
      return await this.contract.methods.getCandidate(candidateId).call();
    } catch (error) {
      throw new Error(`Failed to get candidate details: ${error.message}`);
    }
  }

  async hasVoted(address: string): Promise<boolean> {
    try {
      const voter = await this.contract.methods.voters(address).call();
      return voter.hasVoted;
    } catch (error) {
      throw new Error(`Failed to check voting status: ${error.message}`);
    }
  }
}

export const blockchainService = new BlockchainService();