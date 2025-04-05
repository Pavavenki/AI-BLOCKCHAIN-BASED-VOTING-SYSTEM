
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingContract {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }
    
    struct Voter {
        bool hasVoted;
        uint256 votedFor;
    }
    
    mapping(address => Voter) public voters;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;
    
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    
    function addCandidate(string memory _name, string memory _party) public {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, _party, 0);
    }
    
    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender].hasVoted, "Already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedFor = _candidateId;
        candidates[_candidateId].voteCount++;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    function getCandidate(uint256 _id) public view returns (string memory name, string memory party, uint256 voteCount) {
        Candidate memory candidate = candidates[_id];
        return (candidate.name, candidate.party, candidate.voteCount);
    }
}
