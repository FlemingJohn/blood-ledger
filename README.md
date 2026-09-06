<p align="center">
  <img src="docs/banner.svg" alt="Blood Ledger" width="100%">
</p>

<p align="center">
  <strong>An isometric dungeon crawler where somebody else paid for your sword.</strong>
</p>

---

## The short version

You are broke. The dungeon will kill you.

A patron puts up the coin for your descent. They pay on Ethereum. Creditcoin proves that
payment actually happened, then hands you a blade and a debt. You go down, you kill what
moves, and you decide when to turn back.

Walk out alive and you split the haul. Fall on the stair and their coin dies with you, and
the ledger writes your name next to the loss. Everyone can read it. Nobody funds a raider
who does not come back.

---

## One raid, end to end

<p align="center">
  <img src="docs/raid-loop.svg" alt="How one raid runs from patron to ledger" width="100%">
</p>

The chain waits at both doors and nowhere in between. No transaction runs while you are
swinging a sword.

---

## Where Attestcoin does the work

Blood Ledger uses the Attestcoin Protocol four times, for four different reasons. Take it
out and the game stops working.

| | What it proves | Why nothing else does it |
| --- | --- | --- |
| Funding | A patron really staked coin on Ethereum | The gear cannot be minted on a promise |
| Fair ground | The dungeon seed came from a real Ethereum block | Nobody picked the number, and anyone can check |
| Standing | A newcomer's past on Ethereum is genuine | You bring your reputation instead of grinding from nothing |
| Settling | Ten raids close under one continuity proof | Ten separate proofs would cost ten times as much |

Every proof is checked on Creditcoin by the block prover precompile at
`0x0000000000000000000000000000000000000FD2`, inside a single block.

One honest note. Attestcoin readability is live and writability is not, so payment flows
from Ethereum to Creditcoin and settlement happens on Creditcoin. Nothing is written back
to Ethereum, because that road does not exist yet.

---

## The realms

| | Creditcoin CC3 Testnet | Ethereum Sepolia |
| --- | --- | --- |
| Chain number | `102031` | `11155111` |
| Node | `https://rpc.cc3-testnet.creditcoin.network` | `https://rpc.sepolia.org` |
| Explorer | `creditcoin-testnet.blockscout.com` | `sepolia.etherscan.io` |
| Coin | tCTC | ETH |
| Its job | Where the game lives and settles | Where patrons put up their coin |

Testnet coin comes from the Creditcoin Discord, in the `token-faucet` channel:
`/faucet address:0xYourAddress`. There is no web faucet.

---

## Running it

You need Node 20 or newer, and a copy of the art pack.

**1. Get the art.** Blood Ledger draws with *Lords Of Pain - Old School Isometric Assets*
by Trevor Pupkin. The pack may not be redistributed, so it is not in this repository.
Buy it from [trevor-pupkin.itch.io/lords-of-pain](https://trevor-pupkin.itch.io/lords-of-pain)
and unzip it next to this folder.

**2. Gather what the game needs.**

```
npm install
npm run gather-art
```

That copies sixty five pieces of art out of the pack and into `public/art`, which is ignored by
git. If you unzipped the pack somewhere else, point at it:

```
LORDS_OF_PAIN_PACK="/path/to/the/pack" npm run gather-art
```

**How to play.** W A S D to move, click or space to swing, Q and E for your two powers.
Walk over coin and gems to take them, swing at barrels to break them open, and press
Extract before something kills you.

**3. Open the door.**

```
npm start
```

**Trimming, for the dungeon.** Every sprite in the pack sits on a 256 by 256 frame and
most of that frame is empty, so the dungeon ships a trimmed copy instead:

```
npm run trim-art
```

That reads `public/art`, crops each animation to the union of its solid pixels across all
frames, and writes the result plus the original offsets to `public/art/trimmed`. Around 86
percent of the bytes go, and the offsets are kept so sprites still line up with each other
in the world. Ground textures and the vignette are copied whole on purpose. Pages one and
two read the untrimmed originals and are not affected by this step.

---

## How the code is named

The code speaks the same language as the game. There are no abbreviations and no cryptic
names, and nothing is called a manager or a handler.

| In the code | What it means |
| --- | --- |
| `purse` | The player's wallet |
| `realm` | A chain |
| `homeRealm` | Creditcoin, where the game lives |
| `door` | The button that opens the purse |
| `scroll` | A panel that unrolls in place |
| `torch` | A burning brazier |
| `flipbook` | A sprite animation, one frame at a time |
| `watcher` | The Demonlord, waiting in the dark |
| `facing` | Which of eight ways a fighter is turned |
| `move` | Walk, attack or death |
| `blow` | One swing landing on frame four |
| `takings` | What a raid was worth once it was reckoned |
| `breed` | What kind of enemy, and how it is tinted and sized |
| `chamber` | One carved room on a floor |
| `power` | A thing a class can do beyond swinging |
| `belt` | Where your powers sit and rest |
| `standing` | What a raider is worth, F through A |
| `plinth` | Where your raider stands and turns |
| `offer` | A patron's terms, before you take them |
| `pact` | An offer you accepted, and the debt it carries |
| `rite` | The four steps that seal a pact across the chains |
| `tally` | The bar across the top: purse, coins, standing |

---

## What stands so far

| | |
| --- | --- |
| Page one, the landing | Built |
| Page two, the hall of patrons | Built, reading worked examples |
| Page three, the dungeon | Built, playable |
| The contract on Ethereum | Written and compiling |
| The contract on Creditcoin | Written and compiling |
| The worker that carries proofs | Written |
| Deployed to testnet | Not yet |

The hall reads its patrons, standing and ledger from stand-in data while the contracts are
still to come, and says so on the page itself. The four step sealing rite runs on a
rehearsal clock rather than real block times. Swapping `src/chain/theLedger.ts` for real
reads is the only change the pages need.

The dungeon runs its whole loop. Each floor takes one of five shapes, carved into rooms
and joined by corridors from the seed. Nine breeds of enemy come out of three sprites,
tinted and scaled and given their own stats, and they arrive deeper as you go. Barrels
break open. Gems are graded by colour so you can read what one is worth from across a
room. Braziers light the corners. You play whichever of the three classes you chose in the
hall, each with two powers on Q and E. Walking out or falling settles the pact and moves
your standing.

The seed is a made up hash for now, and becomes an attested Ethereum block once the
contracts land.

---

## The contracts

Two contracts, one on each chain, and a worker between them.

**`PatronVault.sol`** sits on Ethereum and does one thing: hold a stake and shout
`RaidFunded(raider, patron, pactId, coinsStaked, patronShare)`. It knows nothing about
Creditcoin.

**`TheLedger.sol`** sits on Creditcoin and extends `ASCBase` from `@gluwa/asc-contracts`.
That base calls the block prover precompile at
`0x0000000000000000000000000000000000000FD2`, refuses any query id it has already seen,
and only then hands control to our `_processAndEmitEvent`. So every number the ledger acts
on came out of a proved Ethereum transaction, and no proof can be spent twice.

The ledger will only believe one vault. `nameTheVault` is set once, and a funding log from
any other address is refused, so a proved transaction from some other contract cannot seal
a pact here.

**The worker** watches the vault, waits for the block to be attested, asks the proof
builder for a Merkle and continuity proof, and calls `execute` on the ledger.

```
npm run build-contracts
npm run deploy-vault      # on Sepolia
npm run deploy-ledger     # on Creditcoin
npm run name-vault        # tell the ledger which vault to believe
npm run worker            # carry proofs
```

Copy `worker/.env.example` to `.env` and fill it in first. Contracts compile with
`viaIR` and evm version `shanghai`, matching Gluwa's own settings, because `ASCBase`
hits stack-too-deep without it.

---

## Built with

TypeScript and Vite throughout, ethers for talking to purses, Foundry for the contracts,
and `@gluwa/usc-sdk` for the proofs. The dungeon draws straight onto a canvas rather than
through a game engine, because the whole of its rendering is one line, `sort by y`, and a
framework would have cost more than it returned.

Type is set in Nosifer for the wordmark, Cinzel for anything you click, Crimson Pro for
reading and JetBrains Mono for numbers. The art pack ships no font, so all four come from
Google Fonts.

---

## Licence and credit

The code here is ours. The art is not. *Lords Of Pain - Old School Isometric Assets* is
licensed for use in free and commercial work but may not be redistributed, even modified,
so you must bring your own copy. No attribution is required by that licence, but it is
given here anyway, because the art is most of what you see.
