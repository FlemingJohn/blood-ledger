// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice What the ledger keeps about one raider.
struct Standing {
    uint32 score;
    uint32 raids;
    uint32 repaid;
    uint32 lost;
    bool known;
}

/// @notice A funded pact, once Creditcoin has proved the patron really paid.
struct Pact {
    address raider;
    address patron;
    uint256 pactId;
    uint256 coinsStaked;
    uint16 patronShare;
    uint64 sealedAt;
    bool settled;
}

/// @notice How a raid ended.
enum Ending {
    WalkedOut,
    Fell
}

/// @notice What one raid was worth once it was reckoned.
struct Takings {
    uint256 coinsCarried;
    uint256 patronTakes;
    uint256 raiderKeeps;
    bool debtCleared;
    uint32 standingBefore;
    uint32 standingAfter;
}
