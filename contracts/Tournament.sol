// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Tournament {
    mapping(uint256 => address[]) public rosters;
    mapping(uint256 => mapping(address=>bool)) public isPlayer;
    mapping(uint256 => uint8) public isActive; //0 = not active, 1 = lobby,2 = active, 3= ended
    mapping(uint256 => mapping(address => uint256)) public scores;
    // mapping(uint256 => uint256) public prizePool;
    // mapping(uint256 => uint256) public entryFee;
    mapping(uint256 => uint256) public maxPlayers;

    uint256 public tournamentCounter = 0;
    event TournamentCreated(uint256 tournamentId);
    event TournamentJoined(uint256 tournamentId, address player);
    event TournamentStarted(uint256 tournamentId);
    event TournamentEnded(uint256 tournamentId);
    address public ORGANISER;

    modifier onlyOrganiser() {
        require(
            ORGANISER == msg.sender,
            "Only organiser can call this function"
        );
        _;
    }

    constructor(address _organiser)  {
        ORGANISER = _organiser;
    }

    function createTournament(uint256 _maxPlayers) public onlyOrganiser {
        maxPlayers[tournamentCounter] = _maxPlayers;
        isActive[tournamentCounter] = 1;
        emit TournamentCreated(tournamentCounter);
        tournamentCounter++;
    }

    function joinTournament(uint256 _tournamentId) external {
        require(isPlayer[_tournamentId][msg.sender] == false, "User already joined");
        require(isActive[_tournamentId] == 1, "Tournament is not available to join");
        rosters[_tournamentId].push(msg.sender);
        isPlayer[_tournamentId][msg.sender] = true;
        if(rosters[_tournamentId].length == maxPlayers[_tournamentId]){
            isActive[_tournamentId] = 2;
            emit TournamentStarted(_tournamentId);
        }
        emit TournamentJoined(_tournamentId, msg.sender);
    }

    function endTournament(
        uint256 _tournamentId,
        uint256[] calldata _scores
    ) external onlyOrganiser {
        require(isActive[_tournamentId] == 2, "Tournament is not active");
        for (uint256 i = 0; i < rosters[_tournamentId].length; i++) {
            scores[_tournamentId][rosters[_tournamentId][i]] = _scores[i];
        }
        isActive[_tournamentId] = 3;
        emit TournamentEnded(_tournamentId);
    }

    function getRoster(
        uint256 _tournamentId
    ) public view returns (address[] memory) {
        return rosters[_tournamentId];
    }

    function getScore(
        uint256 _tournamentId,
        address _user
    ) public view returns (uint256) {
        return scores[_tournamentId][_user];
    }
}
