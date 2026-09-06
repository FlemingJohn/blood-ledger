// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ASCBase} from "@gluwa/asc-contracts/contracts/readability/ASCBase.sol";
import {EvmV1Decoder} from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";
import {Ending, Pact, Standing, Takings} from "./LedgerTypes.sol";

/**
 * @title TheLedger
 * @notice Lives on Creditcoin. Proves a patron really staked coin on Ethereum, hands the
 *         raider their pact, then settles the raid and moves their standing.
 * @dev Extends ASCBase, which calls the block prover precompile at 0xFD2, refuses a query
 *      it has already seen, and only then calls into `_processAndEmitEvent` below. Every
 *      number this contract acts on came out of a proved Ethereum transaction.
 */
contract TheLedger is ASCBase {
    enum LedgerAction {
        SealPact
    }

    /// @dev keccak256("RaidFunded(address,address,uint256,uint256,uint16)")
    bytes32 public constant RAID_FUNDED_SIGNATURE =
        0x659324302754bd2f6efcab915404935d1ff0a461f33c1dcc23ec9d7ab541bc74;

    uint32 public constant STANDING_STARTS_AT = 500;
    uint32 public constant STANDING_TOPS_OUT_AT = 1000;
    uint32 public constant EARNED_BY_CLEARING = 28;
    uint32 public constant LOST_BY_LEAVING_SHORT = 12;
    uint32 public constant LOST_BY_DEFAULT = 86;
    uint16 public constant SHARE_IS_OUT_OF = 100;

    /// @notice A pair this familiar earns nothing further from each other.
    uint32 public constant PAIR_IS_SPENT_AFTER = 5;

    /// @notice What an unproven raider must lock up before they may descend.
    /// @dev Standing buys this down to nothing. A raider everyone trusts posts no coin,
    ///      because their name is already the collateral. A fresh wallet posts the lot,
    ///      so throwing a raid to spite a rival patron costs something real.
    uint256 public constant FULL_BOND = 0.1 ether;

    address public immutable KEEPER;

    /// @notice The Ethereum vault whose events this ledger will believe.
    address public patronVault;

    /// @notice Which source chain the vault sits on, as Attestcoin numbers them.
    uint64 public sourceChainKey;

    mapping(address => Standing) private standings;
    mapping(uint256 => Pact) public pacts;
    mapping(address => uint256) public openPactOf;

    /// @notice How many pacts this ledger has already sealed between this pair.
    /// @dev Counted here rather than read from the vault, because every pact that
    ///      reaches this mapping arrived through a proof. Standing earned from a pair
    ///      halves each time, so two wallets passing the same coin back and forth
    ///      cannot mint reputation out of it.
    mapping(address => mapping(address => uint32)) public pactsBetween;

    /// @notice Coin a raider locked up to be allowed down.
    mapping(uint256 => uint256) public bondOnPact;

    event VaultNamed(address indexed vault, uint64 chainKey);
    event PactSealed(
        uint256 indexed pactId,
        address indexed raider,
        address indexed patron,
        uint256 coinsStaked,
        uint16 patronShare,
        bytes32 queryId
    );
    event BondPosted(uint256 indexed pactId, address indexed raider, uint256 bond);
    event BondReturned(uint256 indexed pactId, address indexed raider, uint256 bond);
    event BondForfeited(uint256 indexed pactId, address indexed patron, uint256 bond);
    event StandingMoved(
        address indexed raider,
        uint32 was,
        uint32 now_,
        uint32 timesThisPair
    );
    event RaidSettled(
        uint256 indexed pactId,
        address indexed raider,
        Ending ending,
        uint256 coinsCarried,
        uint256 patronTakes,
        uint256 raiderKeeps,
        bool debtCleared,
        uint32 standingAfter
    );

    error NotTheKeeper();
    error VaultAlreadyNamed();
    error VaultIsNobody();
    error UnknownAction(uint8 action);
    error TransactionFailedOnSource();
    error NoFundingInThatTransaction();
    error NotOurVault(address emitter);
    error MalformedFundingLog();
    error RaiderAlreadyOwes(uint256 pactId);
    error NoSuchPact(uint256 pactId);
    error PactAlreadySettled(uint256 pactId);
    error NotYourPact();
    error BondIsWrong(uint256 sent, uint256 wanted);
    error BondAlreadyPosted(uint256 pactId);
    error NoBondPosted(uint256 pactId);
    error CouldNotMoveTheBond();

    constructor(address keeper) {
        KEEPER = keeper;
    }

    modifier onlyKeeper() {
        if (msg.sender != KEEPER) {
            revert NotTheKeeper();
        }
        _;
    }

    /**
     * @notice Name the Ethereum vault and chain this ledger will accept funding from.
     * @dev Set once. Without it every proof is refused, so a proved transaction from some
     *      other contract cannot seal a pact here.
     */
    function nameTheVault(address vault, uint64 chainKey) external onlyKeeper {
        if (patronVault != address(0)) {
            revert VaultAlreadyNamed();
        }
        if (vault == address(0)) {
            revert VaultIsNobody();
        }

        patronVault = vault;
        sourceChainKey = chainKey;

        emit VaultNamed(vault, chainKey);
    }

    function standingOf(address raider) public view returns (Standing memory) {
        Standing memory held = standings[raider];
        if (!held.known) {
            held.score = STANDING_STARTS_AT;
        }
        return held;
    }

    /**
     * @notice What share of the full bond this raider must post, out of 100.
     * @dev Falls as standing rises. A raider at the top posts nothing at all.
     */
    function bondShareFor(address raider) public view returns (uint16) {
        uint32 score = standingOf(raider).score;

        if (score >= 900) {
            return 0;
        }
        if (score >= 750) {
            return 10;
        }
        if (score >= 600) {
            return 30;
        }
        if (score >= 450) {
            return 60;
        }
        if (score >= 300) {
            return 80;
        }
        return 100;
    }

    /// @notice The coin this raider must lock up before they may go down.
    function bondFor(address raider) public view returns (uint256) {
        return (FULL_BOND * bondShareFor(raider)) / 100;
    }

    /**
     * @notice Lock up your bond and take the stair.
     * @dev Walk out and it comes back. Fall and it goes to the patron you cost.
     */
    function postBond(uint256 pactId) external payable {
        Pact storage pact = pacts[pactId];

        if (pact.raider == address(0)) {
            revert NoSuchPact(pactId);
        }
        if (pact.raider != msg.sender) {
            revert NotYourPact();
        }
        if (pact.settled) {
            revert PactAlreadySettled(pactId);
        }
        if (bondOnPact[pactId] != 0) {
            revert BondAlreadyPosted(pactId);
        }

        uint256 wanted = bondFor(msg.sender);
        if (msg.value != wanted) {
            revert BondIsWrong(msg.value, wanted);
        }

        bondOnPact[pactId] = msg.value;

        emit BondPosted(pactId, msg.sender, msg.value);
    }

    /// @inheritdoc ASCBase
    function _processAndEmitEvent(
        uint8 action,
        bytes32 queryId,
        bytes memory encodedTransaction
    ) internal override {
        if (action != uint8(LedgerAction.SealPact)) {
            revert UnknownAction(action);
        }
        _sealPact(queryId, encodedTransaction);
    }

    /// @dev What one proved RaidFunded log says, pulled out so the stack stays shallow.
    struct Funding {
        address raider;
        address patron;
        uint256 pactId;
        uint256 coinsStaked;
        uint16 patronShare;
    }

    function _sealPact(bytes32 queryId, bytes memory encodedTransaction) internal {
        Funding memory funding = _readFunding(encodedTransaction);

        uint256 alreadyOpen = openPactOf[funding.raider];
        if (alreadyOpen != 0) {
            revert RaiderAlreadyOwes(alreadyOpen);
        }

        pacts[funding.pactId] = Pact({
            raider: funding.raider,
            patron: funding.patron,
            pactId: funding.pactId,
            coinsStaked: funding.coinsStaked,
            patronShare: funding.patronShare,
            sealedAt: uint64(block.timestamp),
            settled: false
        });

        openPactOf[funding.raider] = funding.pactId;
        pactsBetween[funding.patron][funding.raider] += 1;

        Standing storage standing = standings[funding.raider];
        if (!standing.known) {
            standing.known = true;
            standing.score = STANDING_STARTS_AT;
        }

        emit PactSealed(
            funding.pactId,
            funding.raider,
            funding.patron,
            funding.coinsStaked,
            funding.patronShare,
            queryId
        );
    }

    /// @dev Reads the one funding log this ledger will believe out of a proved transaction.
    function _readFunding(bytes memory encodedTransaction)
        internal
        view
        returns (Funding memory funding)
    {
        require(
            EvmV1Decoder.isValidTransactionType(
                EvmV1Decoder.getTransactionType(encodedTransaction)
            ),
            "Unsupported transaction type"
        );

        EvmV1Decoder.ReceiptFields memory receipt =
            EvmV1Decoder.decodeReceiptFields(encodedTransaction);

        if (receipt.receiptStatus != 1) {
            revert TransactionFailedOnSource();
        }

        EvmV1Decoder.LogEntry[] memory fundingLogs =
            EvmV1Decoder.getLogsByEventSignature(receipt, RAID_FUNDED_SIGNATURE);

        if (fundingLogs.length == 0) {
            revert NoFundingInThatTransaction();
        }

        EvmV1Decoder.LogEntry memory log = fundingLogs[0];

        if (log.address_ != patronVault) {
            revert NotOurVault(log.address_);
        }
        if (log.topics.length != 3 || log.data.length != 96) {
            revert MalformedFundingLog();
        }

        (uint256 pactId, uint256 coinsStaked, uint256 shareAsWord) =
            abi.decode(log.data, (uint256, uint256, uint256));

        funding = Funding({
            raider: address(uint160(uint256(log.topics[1]))),
            patron: address(uint160(uint256(log.topics[2]))),
            pactId: pactId,
            coinsStaked: coinsStaked,
            patronShare: uint16(shareAsWord)
        });
    }

    /**
     * @notice Close a raid, split the haul, and move the raider's standing.
     * @dev Called by the raider when they walk out or fall. The coin split is recorded
     *      here rather than paid back to Ethereum, because Attestcoin writability is not
     *      live yet and this ledger will not pretend otherwise.
     */
    function settleRaid(
        uint256 pactId,
        Ending ending,
        uint256 coinsCarried
    ) external returns (Takings memory takings) {
        Pact storage pact = pacts[pactId];

        if (pact.raider == address(0)) {
            revert NoSuchPact(pactId);
        }
        if (pact.settled) {
            revert PactAlreadySettled(pactId);
        }
        if (pact.raider != msg.sender) {
            revert NotYourPact();
        }

        if (bondOnPact[pactId] == 0 && bondFor(pact.raider) != 0) {
            revert NoBondPosted(pactId);
        }

        pact.settled = true;
        openPactOf[pact.raider] = 0;

        Standing storage standing = standings[pact.raider];
        uint32 before = standing.known ? standing.score : STANDING_STARTS_AT;

        takings = _reckon(pact, ending, coinsCarried, before);

        standing.known = true;
        standing.score = takings.standingAfter;
        standing.raids += 1;

        if (ending == Ending.Fell) {
            standing.lost += 1;
        } else if (takings.debtCleared) {
            standing.repaid += 1;
        }

        _handTheBondBack(pactId, pact, ending);

        emit StandingMoved(
            pact.raider,
            takings.standingBefore,
            takings.standingAfter,
            pactsBetween[pact.patron][pact.raider]
        );

        emit RaidSettled(
            pactId,
            pact.raider,
            ending,
            takings.coinsCarried,
            takings.patronTakes,
            takings.raiderKeeps,
            takings.debtCleared,
            takings.standingAfter
        );
    }

    /**
     * @notice Give the bond back, or give it to the patron who was let down.
     * @dev Walked out, it returns whole. Fell, the patron takes it, which is the
     *      only thing that makes throwing a raid cost the raider anything.
     */
    function _handTheBondBack(uint256 pactId, Pact storage pact, Ending ending) internal {
        uint256 bond = bondOnPact[pactId];
        if (bond == 0) {
            return;
        }

        bondOnPact[pactId] = 0;

        address goesTo = ending == Ending.WalkedOut ? pact.raider : pact.patron;

        (bool moved, ) = goesTo.call{value: bond}("");
        if (!moved) {
            revert CouldNotMoveTheBond();
        }

        if (ending == Ending.WalkedOut) {
            emit BondReturned(pactId, pact.raider, bond);
        } else {
            emit BondForfeited(pactId, pact.patron, bond);
        }
    }

    /**
     * @notice What a raider earns for clearing a debt to this particular patron.
     * @dev Full the first time, then halved for every pact this pair has already had,
     *      and nothing at all once they are too familiar. Losses are never softened
     *      this way: a default costs the same however well the two know each other.
     */
    function earnedFromThisPair(address patron, address raider) public view returns (uint32) {
        uint32 between = pactsBetween[patron][raider];

        if (between > PAIR_IS_SPENT_AFTER) {
            return 0;
        }

        uint32 earned = EARNED_BY_CLEARING;
        for (uint32 already = 1; already < between; already += 1) {
            earned = earned / 2;
        }

        return earned;
    }

    function _reckon(
        Pact storage pact,
        Ending ending,
        uint256 coinsCarried,
        uint32 standingBefore
    ) internal view returns (Takings memory takings) {
        bool lived = ending == Ending.WalkedOut;
        uint256 carried = lived ? coinsCarried : 0;

        uint256 patronTakes =
            lived ? (carried * pact.patronShare) / SHARE_IS_OUT_OF : pact.coinsStaked;

        uint256 raiderKeeps = lived ? carried - patronTakes : 0;
        bool debtCleared = lived && carried >= pact.coinsStaked;

        uint32 standingAfter;
        if (!lived) {
            standingAfter = standingBefore > LOST_BY_DEFAULT ? standingBefore - LOST_BY_DEFAULT : 0;
        } else if (debtCleared) {
            uint32 raised = standingBefore + earnedFromThisPair(pact.patron, pact.raider);
            standingAfter = raised > STANDING_TOPS_OUT_AT ? STANDING_TOPS_OUT_AT : raised;
        } else {
            standingAfter = standingBefore > LOST_BY_LEAVING_SHORT
                ? standingBefore - LOST_BY_LEAVING_SHORT
                : 0;
        }

        takings = Takings({
            coinsCarried: coinsCarried,
            patronTakes: patronTakes,
            raiderKeeps: raiderKeeps,
            debtCleared: debtCleared,
            standingBefore: standingBefore,
            standingAfter: standingAfter
        });
    }
}
