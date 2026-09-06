// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title PatronVault
 * @notice Lives on Ethereum. A patron stakes coin here to send a raider into the dungeon.
 * @dev The only job of this contract is to hold the stake and shout one unmistakable event.
 *      Creditcoin proves that event happened through the Attestcoin Protocol and seals the
 *      pact on its own side. Nothing here knows anything about Creditcoin.
 */
contract PatronVault {
    /// @notice Raised when a patron stakes coin for a named raider.
    /// @dev The Attestcoin worker watches for exactly this signature and nothing else.
    event RaidFunded(
        address indexed raider,
        address indexed patron,
        uint256 pactId,
        uint256 coinsStaked,
        uint16 patronShare
    );

    event StakeReclaimed(uint256 indexed pactId, address indexed patron, uint256 coinsReturned);

    struct Stake {
        address patron;
        address raider;
        uint256 coinsStaked;
        uint16 patronShare;
        uint64 stakedAt;
        bool reclaimed;
    }

    uint16 public constant SHARE_IS_OUT_OF = 100;
    uint16 public constant MOST_A_PATRON_MAY_KEEP = 80;
    uint64 public constant WAIT_BEFORE_RECLAIM = 7 days;

    uint256 public nextPactId = 1;

    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256[]) public pactsOfRaider;

    error StakeIsEmpty();
    error RaiderIsNobody();
    error ShareTooGreedy(uint16 asked);
    error NotYourStake();
    error AlreadyReclaimed();
    error TooSoonToReclaim(uint64 readyAt);
    error CouldNotReturnCoin();

    /**
     * @notice Stake coin so a raider can descend. Emits the event Creditcoin proves.
     * @param raider The address going into the dungeon.
     * @param patronShare What share of the haul the patron keeps, out of 100.
     */
    function fundRaid(address raider, uint16 patronShare) external payable returns (uint256 pactId) {
        if (msg.value == 0) {
            revert StakeIsEmpty();
        }
        if (raider == address(0)) {
            revert RaiderIsNobody();
        }
        if (patronShare > MOST_A_PATRON_MAY_KEEP) {
            revert ShareTooGreedy(patronShare);
        }

        pactId = nextPactId;
        nextPactId = pactId + 1;

        stakes[pactId] = Stake({
            patron: msg.sender,
            raider: raider,
            coinsStaked: msg.value,
            patronShare: patronShare,
            stakedAt: uint64(block.timestamp),
            reclaimed: false
        });

        pactsOfRaider[raider].push(pactId);

        emit RaidFunded(raider, msg.sender, pactId, msg.value, patronShare);
    }

    /**
     * @notice Take back a stake nobody ever descended on.
     * @dev Only after the wait, and only by the patron who put it up.
     */
    function reclaimStake(uint256 pactId) external {
        Stake storage stake = stakes[pactId];

        if (stake.patron != msg.sender) {
            revert NotYourStake();
        }
        if (stake.reclaimed) {
            revert AlreadyReclaimed();
        }

        uint64 readyAt = stake.stakedAt + WAIT_BEFORE_RECLAIM;
        if (block.timestamp < readyAt) {
            revert TooSoonToReclaim(readyAt);
        }

        stake.reclaimed = true;
        uint256 coinsReturned = stake.coinsStaked;

        (bool sent, ) = msg.sender.call{value: coinsReturned}("");
        if (!sent) {
            revert CouldNotReturnCoin();
        }

        emit StakeReclaimed(pactId, msg.sender, coinsReturned);
    }

    function howManyPacts(address raider) external view returns (uint256) {
        return pactsOfRaider[raider].length;
    }
}
