import crypto from 'crypto';

interface Block {
  index: number;
  timestamp: Date;
  votes: VoteRecord[];
  previousHash: string;
  hash: string;
  nonce: number;
}

interface VoteRecord {
  voterId: string;
  candidateId: number;
  transactionId: string;
}

interface BlockchainTransaction {
  transactionId: string;
  blockNumber: number;
  timestamp: Date;
}

class Blockchain {
  private chain: Block[];
  private currentVotes: VoteRecord[];
  private difficulty: number;
  
  constructor() {
    this.chain = [];
    this.currentVotes = [];
    this.difficulty = 2; // Difficulty level for proof of work
    
    // Create genesis block
    this.createGenesisBlock();
  }
  
  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: new Date(),
      votes: [],
      previousHash: '0',
      hash: '0',
      nonce: 0
    };
    
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }
  
  private calculateHash(block: Block): string {
    return crypto.createHash('sha256')
      .update(
        block.index +
        block.timestamp.toString() +
        JSON.stringify(block.votes) +
        block.previousHash +
        block.nonce.toString()
      )
      .digest('hex');
  }
  
  private mineBlock(block: Block): Block {
    const target = Array(this.difficulty + 1).join('0');
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
    
    return block;
  }
  
  private getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
  
  public addVote(voterId: string, candidateId: number): BlockchainTransaction {
    // Generate transaction ID
    const transactionId = crypto.createHash('sha256')
      .update(voterId + candidateId + Date.now().toString())
      .digest('hex');
    
    // Create vote record
    const voteRecord: VoteRecord = {
      voterId,
      candidateId,
      transactionId
    };
    
    // Add to pending votes
    this.currentVotes.push(voteRecord);
    
    // For this simplified version, we'll create a new block for each vote
    // In a real blockchain, multiple votes would be batched into blocks
    const latestBlock = this.getLatestBlock();
    
    const newBlock: Block = {
      index: latestBlock.index + 1,
      timestamp: new Date(),
      votes: [voteRecord], // Only include the current vote
      previousHash: latestBlock.hash,
      hash: '',
      nonce: 0
    };
    
    // Mine the block
    const minedBlock = this.mineBlock({...newBlock, hash: this.calculateHash(newBlock)});
    
    // Add to chain
    this.chain.push(minedBlock);
    
    // Clear current votes
    this.currentVotes = [];
    
    // Return transaction info
    return {
      transactionId,
      blockNumber: minedBlock.index,
      timestamp: minedBlock.timestamp
    };
  }
  
  public getChain(): Block[] {
    return this.chain;
  }
  
  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check if hash is correct
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }
      
      // Check if points to correct previous hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }
}

export const blockchain = new Blockchain();
