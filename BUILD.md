> **[ IMAGE: 00-banner.png ]**

# Blood Ledger

An isometric dungeon crawler where somebody else paid for your sword.

| | |
| --- | --- |
| Live application | https://blood-ledger-rosy.vercel.app |
| Wallet needed | None to look. The House funds an empty purse from inside the game. |
| Demo video | https://youtu.be/6gM2qsTxUpg |
| Source code | https://github.com/FlemingJohn/blood-ledger |
| Vault on Ethereum Sepolia | `0xcBB956Fa0358F53B9A83b78d6586a1fbB46fF64e` |
| Ledger on Creditcoin CC3 | `0xBd02a6a9f452217dE9d67B945CB995a6991D1cDD` |

---

## The problem

**Onchain lending demands you post $150 to borrow $100.**

That works, but it only serves people who already have the money. It is a liquidity
tool, not credit. Real credit means being lent more than you can cover, because somebody
believes you will come back.

Four things follow from that, and all of them are checkable:

**Reputation onchain is free to fabricate.** A wallet costs nothing. Any score you can
mint by moving your own money between your own addresses is worth exactly nothing to a
lender, and every naive reputation system has been farmed this way.

**Credit history does not travel.** Your record with one protocol is invisible to the
next. There is no portable primitive, so every lender starts from zero and prices
accordingly.

**Undercollateralized lending onchain is mostly permissioned.** Where it exists it runs
on offchain underwriting and legal recourse, which means an institution decides who is
worth trusting. That is a different product from credit anyone can earn.

**A game is the obvious place to bootstrap one, and games mostly do not.** The chain gets
bolted on as a shop or a leaderboard. The mechanic and the money stay in separate rooms.

---

## The solution

**Make the reputation the game.**

A patron stakes coin on Ethereum to fund a raider they have never met. The raider goes
into a dungeon and decides when to turn back.

| | |
| --- | --- |
| **Walks out** | They split the haul. Standing **+28**. The bond returns whole. |
| **Walks out short** | Standing **-12**. The bond returns whole. |
| **Falls** | The patron's coin is gone, all of it. Standing **-86**, and the bond goes to the patron they cost. |

Standing runs **0 to 1000** and prices the bond a raider must lock before descending:
100% at the bottom, nothing at all at 900, because by then the name *is* the collateral.
That is undercollateralized lending, earned rather than granted, and earning it is the
whole arc of the game.

**The loan is also the difficulty curve.** The more of the patron's coin you are
carrying, the less time you get between arrivals. Take the chain out and the difficulty
goes with it. This is not a shop bolted onto a dungeon crawler.

---

## By the numbers

| | Count |
| --- | --- |
| Contracts deployed | 2, one on each chain, both holding real state |
| Chains | 2 - Ethereum Sepolia and Creditcoin CC3 |
| USC integrations | 3, and the game breaks without any of them |
| Tests | 132 - 103 checks across 7 suites, plus 29 Foundry tests |
| Verifiable transactions | 5, two of which are the contract refusing something |
| Screens | 6, all reading live chain state |
| Human decision points before money moves | 2 - the stake slip, then a second confirmation |
| Standing states the contract can write | 3 - cleared, short, fell |
| Bond tiers | 6, from 100% down to nothing |
| Enemy breeds | 9, from 3 sprites |
| Sound effects | 27, synthesised, no audio files |
| Game servers | 0 |
| Databases of ours | 0 |

---

## The two roles

Both are played from the same site, switched in the header. The demo video uses two
separate wallets, labelled **Gamer A** and **Gamer B**.

| | **The Patron** | **The Raider** |
| --- | --- | --- |
| Has | Coin | A sword |
| Lacks | Any appetite for dying | Coin |
| Their chain | Ethereum Sepolia | Creditcoin CC3 |
| They sign | `fundRaid`, the stake | `postBond`, then `settleRaid` |
| They risk | The entire stake | Their bond, and their name |
| They gain | Their agreed share of the haul | The rest of it, and standing |

### The patron's side

Type a raider's address and the ledger answers **before you spend**. A card appears with
what Creditcoin actually knows about that person, and says the awkward parts out loud:

> **Nobody by that name.** Has never been down. No record, no standing. You would be
> the first to trust them.

> **Already holds a pact from `0x505B...f3ab`.** They must settle it before another.

> **You have backed this raider 1 time.** Another earns them 14 standing instead of 28.

> **That is you.** You cannot put up coin for yourself.

That third one is the anti-farming rule showing its face before you spend rather than
after. Then the game asks once more, and says the line that matters: *if they fall, your
coin is gone. All of it.*

### The raider's side

Take what is offered, lock the bond your standing asks of you, and descend. **No
transaction runs while you are swinging a sword.** When the raid ends you sign the
settlement yourself, and the contract does the rest: splits the haul, decides whether
the debt cleared, moves your standing, returns or forfeits your bond.

---

## The six screens

### One. The landing

> **[ IMAGE: 01-screen-landing.png ]**

A hooded skull and a wordmark of running fire, both real 3D models turning slowly in the
dark and leaning toward your pointer. Press the door and the game asks for your purse,
moving it to Creditcoin if it is sitting somewhere else.

Nothing here needs a wallet to read.

### Two. The hall of patrons

> **[ IMAGE: 02-screen-hall.png ]**

Where you take on debt. **That header is live.** Your standing, grade and bond are read
from the ledger on Creditcoin, and the witness bay shows how far the Attestcoin witnesses
have actually got on Ethereum.

**So is the board.** It is not a list we wrote. The page walks the vault on Ethereum for
every stake ever made, asks Creditcoin what became of each one, and shows the ones
pointed at your address. There is no such thing as an unclaimed offer here: a patron
names the raider in the same breath as they pay.

### Three. The patron's table

> **[ IMAGE: 03-screen-patron.png ]**

The same game from the other side. Switch to Patron and your purse moves to Sepolia,
because that is where the money is.

On the right, **Who Has Been Down**, everyone the ledger has ever heard of, sorted by
standing. A raider who already owes gets no **Back This One** button, because the
contract would refuse that pact anyway. Better to say so than offer a button that fails.

### Four. The dungeon

> **[ IMAGE: 04-screen-dungeon.png ]**

Where the debt gets paid or does not. Isometric, drawn straight onto a canvas, no game
server, and the fight is entirely on your machine.

**Top right names the Ethereum block this floor was carved from.** Nobody chose it, and
it links out so you can check.

Bottom right is the only sum that matters: what you carry, what the patron takes, what
you keep, and how far short of the debt you still are.

### Five. Your record

> **[ IMAGE: 05-screen-profile.png ]**

Built from the `RaidSettled` events the ledger emits, joined against the vault's stakes
on Ethereum. Both sides of the same raid agree because both are reading the same event:

> **raider** walked out, kept 1,110, paid `0x505B...f3ab`
>
> **patron** backed `0xCa05...257e`, they returned, +240

Carried 1,850, the patron's 40% is 740, the raider keeps 1,110, the patron who staked 500
cleared 240. Nobody typed those numbers.

### Six. The reckoning

> **[ IMAGE: 06-screen-reckoning.png ]**

The split, in the order that matters, then what you left behind: the gems, the coin never
picked up, the powers never used. Walking out early is always allowed. This is the page
that tells you what it cost.

---

## How it flows

### Why it needs two chains

> **[ IMAGE: 08-flow-two-chains.png ]**

The patron's capital **already lives on Ethereum**, and asking them to bridge it first
would be a worse game and a worse idea. But a debt and a reputation must survive the
raid, be cheap to write, and be readable by anyone, which is **Creditcoin's** job.

That leaves one problem: Creditcoin has no way of knowing what happened on Ethereum.
**USC is the only honest answer to that**, and the whole credit system hangs off it.

### How a pact gets sealed

> **[ IMAGE: 09-flow-sealing.png ]**

The worker is the only thing on the stair between the two chains, **and it cannot cheat,
because it carries a proof rather than a message.** The ledger reads the payment amount
out of the proof itself and never takes the worker's word for anything.

Two guards matter as much as the proof:

**A query id may only be spent once.** `ASCBase` refuses a proof it has already seen, so
one funding cannot seal two pacts.

**The ledger will only ever believe one vault.** `nameTheVault` is set once. Without it,
anyone could point at some other contract that emits a similar log, prove it, and get a
free pact.

### Where USC is used

| | What happens | Where |
| --- | --- | --- |
| Attestation state | `PrecompileChainInfoProvider` polled in the browser for how far the witnesses have got | `src/chain/witnesses.ts:57` |
| Game randomness | Every floor seeded from the last attested Ethereum block. Nobody picks it. | `src/chain/attestedSeed.ts:16` |
| Proving the payment | `ProofBuilder` fetches Merkle and continuity proofs; the contract reads the amount out of them | `contracts/sol/TheLedger.sol:267` |

A dungeon crawler whose own author cannot reseed the map is a small thing to build and a
very strange thing to fake.

---

## The credit rules, as the contract states them

### The bond falls as you earn it

| Standing | Posts | of 0.1 tCTC |
| --- | --- | --- |
| below 300 | **100%** | 0.100 |
| 300 and up | **80%** | 0.080 |
| 450 and up | **60%** | 0.060 |
| 600 and up | **30%** | 0.030 |
| 750 and up | **10%** | 0.010 |
| **900 and up** | **nothing at all** | |

Walk out and it returns whole. Fall and it goes to the patron you cost, which is the only
thing making a thrown raid cost the raider anything.

### Two wallets cannot manufacture a reputation

Standing earned from the same patron halves every time that pair deals again:

| Times this pair has dealt | 1st | 2nd | 3rd | 4th | 5th | 6th |
| --- | --- | --- | --- | --- | --- | --- |
| The raider earns | **+28** | +14 | +7 | +3 | +1 | **nothing** |

Losses are never softened this way. A default costs 86 however well the two know each
other. A stake below `0.001 ETH` buys no standing at all, so farming costs real coin.

Reaching the top of the board therefore costs **ten distinct funded wallets** and real
Sepolia coin, every one of them visible on chain.

### An impossible haul is refused

The fight happens in your browser, so the contract bounds what it will accept:
**100x the stake, never below 1 tCTC (100,000 coins) whichever is larger.**

```
MoreThanTheDungeonHolds(pactId 4,
                        claimed 1000000000000000001,
                        most    1000000000000000000)
```

One wei over the line, refused on chain. The refusal costs the raider nothing but gas and
strands nothing: the pact stays open and the bond stays held.

---

## Deployments

**Two contracts, one proof between them.**

| Contract | Chain | Holds | Who can call it | Terms |
| --- | --- | --- | --- | --- |
| `PatronVault` | Ethereum Sepolia | the patron's stake, and nothing else | anyone with 0.001 ETH or more | patron keeps at most 80%, unclaimed stake reclaimable after 7 days |
| `TheLedger` | Creditcoin CC3 | the pact, the bond, the standing, the settlement | `execute` is permissionless; `postBond` and `settleRaid` only by the raider named in the pact | bond 100% to 0% by standing, haul capped at 100x the stake |

The vault knows nothing about Creditcoin. The ledger believes exactly one vault, and reads
the staked amount out of an Attestcoin proof rather than from whoever delivered it.
**`execute` is deliberately open**: the proof is the authority, so it does not matter who
carries it.

### Key addresses

Creditcoin CC3 testnet, chainId `102031`, and Ethereum Sepolia, chainId `11155111`:

| Contract | Address |
| --- | --- |
| `PatronVault` (Ethereum Sepolia) | [`0xcBB956Fa0358F53B9A83b78d6586a1fbB46fF64e`](https://sepolia.etherscan.io/address/0xcBB956Fa0358F53B9A83b78d6586a1fbB46fF64e) |
| `TheLedger` (Creditcoin CC3) | [`0xBd02a6a9f452217dE9d67B945CB995a6991D1cDD`](https://creditcoin-testnet.blockscout.com/address/0xBd02a6a9f452217dE9d67B945CB995a6991D1cDD) |
| Block-prover precompile (Gluwa) | [`0x0000000000000000000000000000000000000FD2`](https://creditcoin-testnet.blockscout.com/address/0x0000000000000000000000000000000000000FD2) |
| House patron wallet (Sepolia) | [`0x468abBDE787a2dd3927788B6f5143204aF4b14ef`](https://sepolia.etherscan.io/address/0x468abBDE787a2dd3927788B6f5143204aF4b14ef) |

Read it without us: `pacts(3)` on the ledger, `stakes(3)` on the vault, and
`standingOf(0xa0AC3b91b0FD736934262c7058DAd575b6A5c68c)` comes back at **528, one raid,
one repaid**. All three agree.

---

## Does it actually work

**132 tests, and they read the contract rather than a copy of it.**

| Suite | Checks | What it holds |
| --- | --- | --- |
| `PatronVault.t.sol` | 16 | Foundry, deployed in a test EVM and called |
| `TheLedger.t.sol` | 13 | Foundry, mostly the haul ceiling |
| `attacks.test.mjs` | 32 | Prices out farming and griefing |
| `underwriter.test.mjs` | 20 | What the model refuses to print |
| `settlement.test.mjs` | 18 | Reads the constants out of `TheLedger.sol` |
| `prowl.test.mjs` | 15 | The dark keeps sending |
| `pairs.test.mjs` | 9 | The halving, 28 down to nothing |
| `garrison.test.mjs` | 6 | A deep floor can still be cleared |
| `agreement.test.mjs` | 3 | The UI's arithmetic against the contract's |

The settlement and agreement suites parse `TheLedger.sol` as text, so the contract cannot
drift away from the game quietly. A game that shows one number while the chain records
another is worse than a game that shows nothing.

One Foundry test is named `test_theCeilingDoesNotStopStandingBeingFarmed`, because it
does not, and a test is a better place to say so than a paragraph.

**And five transactions on chain, two of which are refusals.**

**A patron staked on Ethereum** — Sepolia

[`0x2ca926253b19eb0aed10b8ad64794f98b2c17508a5e8ec2850f24a7ab88ed640`](https://sepolia.etherscan.io/tx/0x2ca926253b19eb0aed10b8ad64794f98b2c17508a5e8ec2850f24a7ab88ed640)

**Attestcoin proved it, the pact sealed** — Creditcoin CC3

[`0xc2e73a8ca6ea750c2a626c18d434556a362c9cb47cf437c049c481f118a2df04`](https://creditcoin-testnet.blockscout.com/tx/0xc2e73a8ca6ea750c2a626c18d434556a362c9cb47cf437c049c481f118a2df04)

**The raid settled, standing 500 to 528** — Creditcoin CC3

[`0x53482ca5c60adadf4ded3f7f155f6de79338f45dffda3b81a470535e89b88459`](https://creditcoin-testnet.blockscout.com/tx/0x53482ca5c60adadf4ded3f7f155f6de79338f45dffda3b81a470535e89b88459)

**A haul above the ceiling, refused** — Creditcoin CC3

[`0x19d2b34ad5f11ca136cfb4c2fb4c50e70a35e6cca7875cdb6dc3c048762fc77d`](https://creditcoin-testnet.blockscout.com/tx/0x19d2b34ad5f11ca136cfb4c2fb4c50e70a35e6cca7875cdb6dc3c048762fc77d)

**A replayed proof, refused by the query-id guard** — Creditcoin CC3

[`0xeedd1d2f22be6abaa08e4b94c237a0c4a67387e927cad38b5467fa29887458bb`](https://creditcoin-testnet.blockscout.com/tx/0xeedd1d2f22be6abaa08e4b94c237a0c4a67387e927cad38b5467fa29887458bb)

That last one was supposed to fail. **A replay guard nobody has watched refuse anything
is a claim rather than a guard.**

---

## What is real and what is not

We would rather say this ourselves than have it found.

| | |
| --- | --- |
| USC reads, in the browser | **Live.** Real heights, real hashes, every refresh |
| Floors seeded from an attested block | **Live** |
| Both contracts | **Deployed**, holding real sealed pacts |
| Standing, grade, bond, the board, every record | **Read from chain** at the moment you look |
| Locking the bond, settling a raid | **Written to Creditcoin** by your own wallet |
| The coin you carried out | **Reported by your browser, bounded by the contract.** Not proved |
| Deepest floor and best haul | **Your browser only.** The contract has no field for a floor |
| The four-step sealing animation | **A stand-in clock.** Real sealing takes about nine minutes |

**The haul is reported, not proved.** The fight happens in your browser, so the number of
coins you carried out is a number your own machine hands the contract. Nothing on
Creditcoin watched you pick them up.

**This bounds the lie; it does not end it.** Clearing a debt needs only the stake itself,
so a raider willing to lie can still claim a raid they did not run. What stops that being
worth doing is the pair rule, and `tests/attacks.test.mjs` prices it out.

**The real answer is replay, and the architecture already allows it.** Floors are seeded
from an attested Ethereum block, so a raid is deterministic: same seed, same map, same
enemies, same loot. A run submitted with its input trace can be re-simulated by anyone
and the haul checked against it, with no trust in the player and no combat on a chain.
That is the next contract, and it is the reason the attested seed is worth more than a
nice line in the header.

---

## Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Contracts | Solidity 0.8.30, Foundry, `@gluwa/asc-contracts` | `ASCBase` gives the precompile call and the replay guard for free |
| Cross-chain proof | `@gluwa/usc-sdk` | The only way Creditcoin can know what Ethereum did |
| Front end | TypeScript and Vite, no framework | Six screens of plain DOM. A framework would have cost more than it returned |
| The dungeon | Canvas 2D, trimmed sprite atlas | The whole of its rendering is one line, `sort by y` |
| Landing and plinth | three.js, five Draco-compressed models | Real models, not sprites, because the skull has to lean at your pointer |
| Sound | Web Audio, 27 synthesised effects | No audio files at all, so nothing to download |
| Purses | ethers v6 | Two chains, two networks, one library |
| The worker | Node and tsx, polling Sepolia every twelve seconds | The only thing on the stair, and it carries a proof |
| The house | Node's own `http`, serverless on Vercel | So a judge with an empty wallet can still play |
| The underwriter | Azure OpenAI, narration only | Behind a scrubber, and it decides nothing |
| Deployment | Vercel | Verified: the full patron and raider paths run in production |

No indexer and no database. The browser reads both contracts directly and joins the
answers, which means there is nothing of ours you have to trust. If our server vanished
tonight the record would be exactly where it is now.

### Two rules that shaped the code

**The model never touches money.** `judge()` in `src/chain/underwriting.ts` is plain
arithmetic with no model near it. The model is handed a decision already made and asked
for two sentences. What it writes is thrown away if it is empty, too long, cut off, or
carrying a link or an address, and `ourOwnWords()` writes the sentence instead. Every
path ends in a sentence. The worst thing a compromised model can do here is get its prose
discarded.

**Risk is shown before it is taken, not after.** What you would owe, what the bond costs,
what a patron would keep, whether this raider has ever repaid anyone. All of it is on
screen before the button, which is why the patron page reads the ledger live as you type
rather than after you commit.

---

## Who it is for

**For a raider with no money.** The whole point. You cannot post collateral, so the game
prices your bond off a reputation you build by actually coming back. Reach 900 and you
post nothing at all.

**For a patron.** You are lending to a stranger, so the game tells you everything the
chain knows about them before you spend, including the parts that argue against the
loan. That card is read live from Creditcoin, not from anything the page invented.

**For a protocol that wants portable credit.** `standingOf(address)` is a public read on
a deployed contract. Any other Creditcoin contract can price off it today without asking
us for anything. The record is already portable; this is one application writing to it.

**The honest limit.** This is a testnet game with a haul its own contract cannot verify.
It demonstrates that reputation can be earned, priced and enforced across two chains. It
does not demonstrate that the reported number is true, and every screen that touches that
number says so.

---

## Try it

**https://blood-ledger-rosy.vercel.app**

No wallet needed to look around. The landing, the hall and the witness heights all read
without connecting anything.

To play, connect MetaMask and press **Get A Purse**. The House fills an empty wallet on
both chains and will put up real coin for you, so nobody has to go hunting for a faucet.
A fresh wallet opens at standing 500, which posts a 60% bond.

**To watch a whole raid without waiting**, the demo video is the fastest route. Sealing a
pact genuinely takes about nine minutes, because that is the witnesses reaching agreement
about the Sepolia block your funding landed in. It is not something the worker can hurry,
and it is also the thing that makes the proof worth having.

```
npm install
npm run dev          # the game, against both live testnets
npm run house        # fills empty purses from inside the game
npm test             # 103 checks across 7 suites
npm run test-contracts   # 29 Foundry tests
```

---

## Watch it run

**https://youtu.be/6gM2qsTxUpg**

Six minutes: the two roles, the words the game uses, the chain flow, both deployed
contracts, a full raid, and the settlement landing on Creditcoin. Two wallets are used
and labelled on screen throughout as **Gamer A** and **Gamer B**.

Every number shown is live testnet state. The narration was written and voiced first,
then every caption and diagram was cued to the millisecond each word is actually spoken,
which is checked by a script rather than by eye.

---

## Documentation

| | |
| --- | --- |
| Full README | [README.md](README.md) |
| Deploying, from an empty `.env` to a sealed pact | [DEPLOYING.md](DEPLOYING.md) |
| The ledger | [contracts/sol/TheLedger.sol](contracts/sol/TheLedger.sol) |
| The vault | [contracts/sol/PatronVault.sol](contracts/sol/PatronVault.sol) |
| The proof worker | [worker/carryProof.ts](worker/carryProof.ts) |

---

*The proof is the authority, not the messenger.*
