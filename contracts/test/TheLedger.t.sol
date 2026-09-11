// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {TheLedger} from "../sol/TheLedger.sol";
import {Ending, Pact, Takings} from "../sol/LedgerTypes.sol";

/**
 * @dev A pact normally arrives through a proof, which needs the block prover precompile and
 *      a real Ethereum receipt. The settlement rules do not care where the pact came from,
 *      so this harness puts one on the books directly and lets them be tested on their own.
 *      Nothing here is deployed; it exists only inside the test EVM.
 */
contract LedgerUnderTest is TheLedger {
    constructor(address keeper) TheLedger(keeper) {}

    function putAPactOnTheBooks(
        uint256 pactId,
        address raider,
        address patron,
        uint256 coinsStaked,
        uint16 patronShare
    ) external {
        pacts[pactId] = Pact({
            raider: raider,
            patron: patron,
            pactId: pactId,
            coinsStaked: coinsStaked,
            patronShare: patronShare,
            sealedAt: uint64(block.timestamp),
            settled: false
        });

        openPactOf[raider] = pactId;
        pactsBetween[patron][raider] += 1;
    }
}

contract TheLedgerTest is Test {
    LedgerUnderTest ledger;

    address keeper = address(0xA1);
    address patron = address(0xB2);
    address raider = address(0xC3);

    /// @dev The house stakes this much. A hundred times it is under the floor.
    uint256 constant SMALL_STAKE = 0.005 ether;

    /// @dev A hundred times this clears the floor, so the multiple binds instead.
    uint256 constant BIG_STAKE = 0.05 ether;

    function setUp() public {
        ledger = new LedgerUnderTest(keeper);
        vm.deal(raider, 10 ether);
        vm.deal(address(ledger), 0);
    }

    function _aPactOf(uint256 coinsStaked) internal returns (uint256 pactId) {
        pactId = 1;
        ledger.putAPactOnTheBooks(pactId, raider, patron, coinsStaked, 40);

        uint256 bond = ledger.bondFor(raider);
        vm.prank(raider);
        ledger.postBond{value: bond}(pactId);
    }

    // --- what the ceiling is ---

    function test_aFreshRaiderPostsSixtyPercentOfTheBond() public view {
        assertEq(ledger.bondShareFor(raider), 60);
        assertEq(ledger.bondFor(raider), 0.06 ether);
    }

    function test_theCeilingNeverFallsBelowTheFloorForASmallStake() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);

        // 0.005 x 100 is 0.5, which is under the floor, so the floor wins.
        assertEq(ledger.mostThatCanComeOutOf(pactId), ledger.NO_CAP_TIGHTER_THAN());
        assertEq(ledger.mostThatCanComeOutOf(pactId), 1 ether);
    }

    function test_theCeilingIsAHundredTimesALargerStake() public {
        uint256 pactId = _aPactOf(BIG_STAKE);

        assertEq(ledger.mostThatCanComeOutOf(pactId), BIG_STAKE * 100);
        assertEq(ledger.mostThatCanComeOutOf(pactId), 5 ether);
    }

    function test_aPactThatDoesNotExistHasNoCeiling() public view {
        assertEq(ledger.mostThatCanComeOutOf(999), 0);
    }

    // --- what it refuses ---

    function test_settleRaidRefusesAHaulNoDungeonCouldProduce() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);
        uint256 most = ledger.mostThatCanComeOutOf(pactId);

        vm.prank(raider);
        vm.expectRevert(
            abi.encodeWithSelector(
                TheLedger.MoreThanTheDungeonHolds.selector, pactId, most + 1, most
            )
        );
        ledger.settleRaid(pactId, Ending.WalkedOut, most + 1);
    }

    /// @dev The whole point. A raider who never opened the game claims everything.
    function test_settleRaidRefusesTheObviousLie() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);

        vm.prank(raider);
        vm.expectRevert();
        ledger.settleRaid(pactId, Ending.WalkedOut, type(uint256).max);
    }

    /// @dev _reckon records the raw claim even when they fell, so the event would carry an
    ///      absurd number if the ceiling only applied to walking out.
    function test_settleRaidRefusesAnImpossibleHaulEvenWhenTheyFell() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);
        uint256 most = ledger.mostThatCanComeOutOf(pactId);

        vm.prank(raider);
        vm.expectRevert(
            abi.encodeWithSelector(
                TheLedger.MoreThanTheDungeonHolds.selector, pactId, most + 1, most
            )
        );
        ledger.settleRaid(pactId, Ending.Fell, most + 1);
    }

    function test_theCeilingIsRefusedNotTrimmed() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);
        uint256 most = ledger.mostThatCanComeOutOf(pactId);

        vm.prank(raider);
        try ledger.settleRaid(pactId, Ending.WalkedOut, most + 1) {
            fail();
        } catch {
            // A settlement that quietly recorded a smaller number than the player was
            // shown would break the promise the agreement test exists to keep.
            (, , , , , , bool settled) = ledger.pacts(pactId);
            assertEq(settled, false);
        }
    }

    // --- what it still allows ---

    function test_settleRaidAcceptsTheCeilingExactly() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);
        uint256 most = ledger.mostThatCanComeOutOf(pactId);

        vm.prank(raider);
        Takings memory takings = ledger.settleRaid(pactId, Ending.WalkedOut, most);

        assertEq(takings.coinsCarried, most);
        assertEq(takings.debtCleared, true);
    }

    /// @dev The worked example from the README: staked 500 coins, carried out 1,850.
    ///      At 100,000 coins to the ether that is 0.005 and 0.0185.
    function test_theWorkedExampleIsNowhereNearTheCeiling() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);
        uint256 carried = 0.0185 ether;

        assertLt(carried, ledger.mostThatCanComeOutOf(pactId));

        vm.prank(raider);
        Takings memory takings = ledger.settleRaid(pactId, Ending.WalkedOut, carried);

        assertEq(takings.patronTakes, (carried * 40) / 100);
        assertEq(takings.raiderKeeps, carried - takings.patronTakes);
        assertEq(takings.debtCleared, true);
        assertEq(takings.standingAfter, 528);
    }

    /// @dev A long deep raid on the smallest stake must not be refused. The dark keeps
    ///      sending, so an honest haul has no ceiling of its own — this is why the floor
    ///      under the ceiling exists at all.
    function test_aLongHonestRaidOnASmallStakeStillSettles() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);

        // 50,000 coins, well past anything the dungeon has been seen to give up.
        uint256 carried = 0.5 ether;
        assertLt(carried, ledger.mostThatCanComeOutOf(pactId));

        vm.prank(raider);
        ledger.settleRaid(pactId, Ending.WalkedOut, carried);

        assertEq(ledger.standingOf(raider).repaid, 1);
    }

    function testFuzz_anythingUpToTheCeilingSettlesAndAnythingAboveDoesNot(
        uint256 coinsStaked,
        uint256 coinsCarried
    ) public {
        coinsStaked = bound(coinsStaked, 0.001 ether, 10 ether);
        uint256 pactId = _aPactOf(coinsStaked);
        uint256 most = ledger.mostThatCanComeOutOf(pactId);

        coinsCarried = bound(coinsCarried, 0, most * 2);

        vm.prank(raider);
        if (coinsCarried > most) {
            vm.expectRevert(
                abi.encodeWithSelector(
                    TheLedger.MoreThanTheDungeonHolds.selector, pactId, coinsCarried, most
                )
            );
            ledger.settleRaid(pactId, Ending.WalkedOut, coinsCarried);
        } else {
            Takings memory takings = ledger.settleRaid(pactId, Ending.WalkedOut, coinsCarried);
            assertEq(takings.coinsCarried, coinsCarried);
            assertEq(takings.patronTakes + takings.raiderKeeps, coinsCarried);
        }
    }

    // --- what the ceiling does NOT do, said out loud ---

    /// @dev Clearing a debt needs only the stake, not the ceiling. A raider willing to lie
    ///      can still claim a raid they never ran, and the standing still moves. The pair
    ///      rule is what prices that, and a replayable run is what would end it. This test
    ///      exists so nobody reads the cap as a fix it is not.
    function test_theCeilingDoesNotStopStandingBeingFarmed() public {
        uint256 pactId = _aPactOf(SMALL_STAKE);

        vm.prank(raider);
        ledger.settleRaid(pactId, Ending.WalkedOut, SMALL_STAKE);

        assertEq(ledger.standingOf(raider).score, 528);
        assertEq(ledger.standingOf(raider).repaid, 1);
    }
}
