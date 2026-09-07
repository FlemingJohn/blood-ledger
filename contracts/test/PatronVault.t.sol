// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {PatronVault} from "../sol/PatronVault.sol";

contract PatronVaultTest is Test {
    PatronVault vault;

    address patron = address(0xA1);
    address raider = address(0xB2);
    address stranger = address(0xC3);

    event RaidFunded(
        address indexed raider,
        address indexed patron,
        uint256 pactId,
        uint256 coinsStaked,
        uint16 patronShare
    );

    event StakeReclaimed(uint256 indexed pactId, address indexed patron, uint256 coinsReturned);

    function setUp() public {
        vault = new PatronVault();
        vm.deal(patron, 100 ether);
        vm.deal(stranger, 100 ether);
    }

    function test_fundRaidHoldsTheCoin() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 1 ether}(raider, 40);

        assertEq(pactId, 1);
        assertEq(address(vault).balance, 1 ether);
        assertEq(vault.nextPactId(), 2);
    }

    function test_fundRaidShoutsTheEventAttestcoinWatches() public {
        vm.expectEmit(true, true, true, true);
        emit RaidFunded(raider, patron, 1, 1 ether, 40);

        vm.prank(patron);
        vault.fundRaid{value: 1 ether}(raider, 40);
    }

    function test_fundRaidWritesTheStake() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 2 ether}(raider, 55);

        (
            address heldPatron,
            address heldRaider,
            uint256 coinsStaked,
            uint16 patronShare,
            uint64 stakedAt,
            bool reclaimed
        ) = vault.stakes(pactId);

        assertEq(heldPatron, patron);
        assertEq(heldRaider, raider);
        assertEq(coinsStaked, 2 ether);
        assertEq(patronShare, 55);
        assertEq(stakedAt, uint64(block.timestamp));
        assertEq(reclaimed, false);
    }

    function test_fundRaidCountsPactsForTheRaider() public {
        vm.startPrank(patron);
        vault.fundRaid{value: 1 ether}(raider, 40);
        vault.fundRaid{value: 1 ether}(raider, 40);
        vm.stopPrank();

        assertEq(vault.howManyPacts(raider), 2);
        assertEq(vault.timesFunded(patron, raider), 2);
    }

    function test_fundRaidCountsEachPairApart() public {
        vm.prank(patron);
        vault.fundRaid{value: 1 ether}(raider, 40);

        vm.prank(stranger);
        vault.fundRaid{value: 1 ether}(raider, 40);

        assertEq(vault.timesFunded(patron, raider), 1);
        assertEq(vault.timesFunded(stranger, raider), 1);
        assertEq(vault.howManyPacts(raider), 2);
    }

    function test_fundRaidRefusesNothing() public {
        vm.prank(patron);
        vm.expectRevert(PatronVault.StakeIsEmpty.selector);
        vault.fundRaid{value: 0}(raider, 40);
    }

    function test_fundRaidRefusesDust() public {
        uint256 smallest = vault.SMALLEST_STAKE_WORTH_ANYTHING();

        vm.prank(patron);
        vm.expectRevert(
            abi.encodeWithSelector(PatronVault.StakeTooSmall.selector, smallest - 1, smallest)
        );
        vault.fundRaid{value: smallest - 1}(raider, 40);
    }

    function test_fundRaidRefusesNobody() public {
        vm.prank(patron);
        vm.expectRevert(PatronVault.RaiderIsNobody.selector);
        vault.fundRaid{value: 1 ether}(address(0), 40);
    }

    function test_fundRaidRefusesYourself() public {
        vm.prank(patron);
        vm.expectRevert(PatronVault.CannotFundYourself.selector);
        vault.fundRaid{value: 1 ether}(patron, 40);
    }

    function test_fundRaidRefusesAGreedyShare() public {
        uint16 most = vault.MOST_A_PATRON_MAY_KEEP();

        vm.prank(patron);
        vm.expectRevert(abi.encodeWithSelector(PatronVault.ShareTooGreedy.selector, most + 1));
        vault.fundRaid{value: 1 ether}(raider, most + 1);
    }

    function test_fundRaidAllowsTheHighestShare() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 1 ether}(raider, vault.MOST_A_PATRON_MAY_KEEP());
        assertEq(pactId, 1);
    }

    function test_reclaimStakeReturnsTheCoinAfterTheWait() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 3 ether}(raider, 40);

        vm.warp(block.timestamp + vault.WAIT_BEFORE_RECLAIM());

        vm.expectEmit(true, true, true, true);
        emit StakeReclaimed(pactId, patron, 3 ether);

        vm.prank(patron);
        vault.reclaimStake(pactId);

        assertEq(patron.balance, 100 ether);
        assertEq(address(vault).balance, 0);
    }

    function test_reclaimStakeRefusesBeforeTheWait() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 1 ether}(raider, 40);

        uint64 readyAt = uint64(block.timestamp) + vault.WAIT_BEFORE_RECLAIM();

        vm.warp(block.timestamp + vault.WAIT_BEFORE_RECLAIM() - 1);

        vm.prank(patron);
        vm.expectRevert(abi.encodeWithSelector(PatronVault.TooSoonToReclaim.selector, readyAt));
        vault.reclaimStake(pactId);
    }

    function test_reclaimStakeRefusesAStranger() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 1 ether}(raider, 40);

        vm.warp(block.timestamp + vault.WAIT_BEFORE_RECLAIM());

        vm.prank(stranger);
        vm.expectRevert(PatronVault.NotYourStake.selector);
        vault.reclaimStake(pactId);
    }

    function test_reclaimStakeRefusesTwice() public {
        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: 1 ether}(raider, 40);

        vm.warp(block.timestamp + vault.WAIT_BEFORE_RECLAIM());

        vm.startPrank(patron);
        vault.reclaimStake(pactId);
        vm.expectRevert(PatronVault.AlreadyReclaimed.selector);
        vault.reclaimStake(pactId);
        vm.stopPrank();
    }

    function testFuzz_fundRaidHoldsWhateverIsStaked(uint96 coins, uint16 share) public {
        coins = uint96(bound(coins, vault.SMALLEST_STAKE_WORTH_ANYTHING(), 90 ether));
        share = uint16(bound(share, 0, vault.MOST_A_PATRON_MAY_KEEP()));

        vm.prank(patron);
        uint256 pactId = vault.fundRaid{value: coins}(raider, share);

        (, , uint256 coinsStaked, uint16 patronShare, , ) = vault.stakes(pactId);

        assertEq(coinsStaked, coins);
        assertEq(patronShare, share);
        assertEq(address(vault).balance, coins);
    }
}
