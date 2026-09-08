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

## The five pages

### One. The landing

<p align="center">
  <img src="docs/shots/landing.png" alt="The wordmark bleeding over red smoke, above a door that opens your purse" width="100%">
</p>

The pitch and a door. Press it and the game asks for your purse, and moves it to Creditcoin
if it is sitting somewhere else. Two scrolls unroll in place: one for raiders, one for
people who would rather put up the coin than carry the sword. The footing names both chains
and says who proved the payment.

Nothing here needs a wallet to read. Bottom right are the two switches for the fighting and
the music, and they are remembered on your machine.

---

### Two. The hall of patrons

<p align="center">
  <img src="docs/shots/hall.png" alt="The header reading live Attestcoin heights, six offers on the board, your raider on the plinth" width="100%">
</p>

Where you take on debt. Six bays across the top: your face and standing, what the
underwriter thinks of you, what the witnesses have agreed, which side you are playing, and
your purse.

**That header is live.** The underwriter has read this raider and will lend 827 at 26
percent. The witnesses have reached Sepolia block 11,660,240 and sit 38 blocks behind, so a
payment made right now proves in about eight minutes.

The board holds every offer open to you, greyed out where your standing is too low. Your
raider turns on the plinth while you pick between Warrior, Knight and Fighter, and the rail
on the right shows the two powers that class brings and the bond it will cost you. Take an
offer and the sealing rite runs its four steps. Only then does the stair unbar.

---

### Three. The patron's table

<p align="center">
  <img src="docs/shots/patron.png" alt="The stake slip on the left, and five raiders seeking coin on the right, each with their record" width="100%">
</p>

The same game from the other side. Switch to Patron in the header and your purse moves to
Sepolia, because that is where the money is.

On the left you write a stake: whose address is going down, how much, and what share you
keep of whatever they carry out. On the right, every raider who wants coin, with their
record laid out plainly and the awkward parts said out loud:

> has lost three patrons and repaid one
>
> every pact came from one purse, and the coin went in a circle

That second one is the game refusing to let two wallets pass the same coin back and forth to
manufacture a reputation. The vault counts how many times each patron has funded each
raider, and the ledger reads that count when it works out what the standing was worth.

You cannot fund yourself, and the table says so if you try.

---

### Four. The dungeon

<p align="center">
  <img src="docs/shots/dungeon.png" alt="A warrior facing a skeleton by torchlight, the attested block named across the top" width="100%">
</p>

Where the debt gets paid or does not. Isometric, drawn straight onto a canvas, no game
server — the fight is entirely on your machine and no transaction runs while you are
swinging.

**Top right names the Ethereum block this floor was carved from.** Nobody chose it, and it
links out so you can check.

Across the top: the floor, what you have killed, and what you owe. Bottom left, your life.
Bottom middle, your two powers and how long until they come back. Bottom right, the only sum
that matters — what you carry, what the patron takes, what you keep, and how far short of
the debt you still are. Extract sits under it, live from the first second.

Clear the floor and the stair opens and stays open. But the dark keeps sending, so every
extra moment spent looting is a moment spent being hunted.

---

### Five. The reckoning

<p align="center">
  <img src="docs/shots/reckoning.png" alt="1,850 carried out, 740 to the patron, 1,110 kept, the debt cleared" width="100%">
</p>

The split, in the order that matters: what you carried out, what the patron takes, what you
keep, whether the debt cleared, and where your standing landed.

Then what you left behind — the gems, the coin never picked up, the barrels never broken,
the powers never used, and whether you ever met the Demonlord. Walking out early is always
allowed. This is the page that tells you what it cost.

---

## How it is put together

<p align="center">
  <img src="docs/architecture.svg" alt="A cross section: the patron's coin at the surface on Ethereum, the Attestcoin stair carrying proof down, the ledger hall on Creditcoin, and the dungeon in your browser below" width="100%">
</p>

Four places, and nothing hidden in a server you cannot see.

**Your browser** draws every screen and runs the whole dungeon. There is no game server.
The fight happens on your machine, and no transaction runs while you are swinging a sword.

**Ethereum** holds the patron's stake. That is the only thing it does.

**Creditcoin** holds everything that outlives a raid: the pact, your standing, the
settlement.

**The worker** is the only thing on the stair between them, and it cannot cheat, because it
carries a proof rather than a message.

**The house** is a convenience, not part of the rules. Turn it off and the game still
works; you just have to go and find a faucet.

---

## How we used Attestcoin

### What Attestcoin is, in one paragraph

A group of witnesses watch Ethereum and write down what they saw, on Creditcoin. Once
enough of them agree about a block, any program running on Creditcoin can ask two questions
and trust the answer without trusting us:

**How far have you got?** — the last Ethereum block the witnesses agree on.

**Did this exact payment really happen?** — proof of one transaction inside one block.

Blood Ledger asks the first question in the browser and the second in the contract. Take
either one away and the game stops working.

### The first question, asked in the browser, live right now

Open the game and look at the top right of any screen. Those numbers are not decoration.
The game asks Creditcoin, several times a minute, which chains the witnesses are watching
and how far they have got on each.

The same answer decides your dungeon. Before you descend, the game takes the last Ethereum
block the witnesses agreed on and builds the floor from it — the rooms, the corridors,
where the enemies stand, where the loot fell.

**Nobody chose that number.** Not us, not you. The bar at the top of the dungeon names the
block it came from, so a player who does not trust us can go and look it up on either
explorer. If Creditcoin cannot be reached, the game rolls locally and says so in blood red
rather than pretending.

A dungeon crawler whose own author cannot reseed the map is a small thing to build and a
very strange thing to fake.

| | Where |
| --- | --- |
| Which chains are watched | `src/chain/witnesses.ts:52` |
| How far the witnesses have got | `src/chain/witnesses.ts:57` |
| The floor you play | `src/chain/attestedSeed.ts:16` |

This part needs no contracts of our own. It works against the live testnet today.

### The second question, asked by the contract

When a patron pays on Ethereum, the vault shouts one thing: *this person staked this much
on that raider.* Nothing else.

The worker sees it, waits for the witnesses, fetches the proof, and hands it to the ledger
on Creditcoin. The ledger reads the payment **out of the proof itself** — it never takes the
worker's word for anything. A proof already used is refused. A proof from a vault it was
not told to trust is refused.

That last guard matters more than it sounds. Until someone names the one vault the ledger
should believe, every proof is refused. Without it, anybody could point at some other
contract that happens to shout a similar thing, prove it, and get a free pact.

| | Where |
| --- | --- |
| The proof checker | `contracts/sol/TheLedger.sol:16` |
| Reading the payment out of the proof | `contracts/sol/TheLedger.sol:267` |
| The one vault it will believe | `contracts/sol/TheLedger.sol:126` |

### One thing we will say plainly

Attestcoin can prove things **to** Creditcoin today, but not back the other way. So coin
flows from Ethereum to Creditcoin and settlement happens on Creditcoin. Nothing is written
back to Ethereum, because that road does not exist yet. We built for the road that is
there.

---

## One raid, end to end

<p align="center">
  <img src="docs/raid-loop.svg" alt="How one raid runs from patron to ledger" width="100%">
</p>

The chain waits at both doors and nowhere in between.

---

## How the game works

### The three you can be

| | Life | Hurts | Reach | Pace | Powers |
| --- | --- | --- | --- | --- | --- |
| Warrior | 100 | 26 | 78 | 168 | Cleave, Bulwark |
| Knight | 140 | 30 | 84 | 128 | Slam, Guard |
| Fighter | 80 | 20 | 72 | 210 | Flurry, Dash |

Nothing levels up inside a raid. You are as strong on floor nine as on floor one, and every
floor you descend heals you to full. Depth is not attrition; depth is arithmetic.

### The floor

Each floor takes one of five shapes, carved into chambers and joined by corridors from the
seed. `5 + floor × 2` enemies stand where the seed put them. Nine breeds come out of three
sprites, tinted and scaled and given their own life, reach and pace. Barrels break open,
gems are graded by colour so you can read what one is worth from across a room, and
braziers light the corners.

### The dark keeps sending

Clearing a floor used to make it safe forever, which meant looting cost nothing and the
decision the game is named for had no teeth. Now the dungeon keeps sending things at you
for as long as you stay.

```
gap between arrivals = 15.0s
    − 1.1s × (floor − 1)                 how deep you are
    − 2.4s × (minutes on this floor)     how long you have lingered
    − 3.6s × (coins carried ÷ owed)      how much of their money you hold
    never faster than 4.2s, never more than 16 awake at once
```

Worked example — floor 5, two minutes in, carrying one and a half times your stake:
`15.0 − 4.4 − 4.8 − 5.4` clamps to **4.2 seconds**. Something every four seconds. You are
not looting that floor any more, you are running for the stair.

That third line is the part we care about. **Difficulty is a function of the loan.** The
more of the patron's money you are holding, the harder the dungeon fights to keep it.

Every arrival comes from an unlit tile at least 560 pixels away and off the edge of your
screen, so the only warning is a sound. Stay long enough and it stops sending rank and file
and starts sending elites.

### The Demonlord

He waits on floor six, once. Not before, and not again.

| | Hits to kill him | His hits to kill you |
| --- | --- | --- |
| Warrior | 13 | 5 |
| Knight | 11 | 7 |
| Fighter | 16 | 4 |

He has 320 life and a reach of 104, which outranges every class. Standing and trading blows
always loses. His pace is 92 against your 128 to 210, so kiting is the whole fight.

### Walking out, or going down

The stair opens once you have cleared the floor and stays open after, even as more arrive.
Then it is your call: settle now, or take the stair.

Walk out and the patron takes their share of what you carried. Fall and they lose the
stake. Standing moves by **+28** for clearing your debt, **−12** for walking out short, and
**−86** for dying.

---

## The underwriter, and what the model is allowed to do

There is a language model in here, and it decides nothing.

| | |
| --- | --- |
| `src/chain/underwriting.ts` | `judge()` — the decision. Plain rules. No model. |
| `underwriter/masking.ts` | `handleFor()` — `0x7a3f…` becomes *Ashfoot* before anything leaves |
| `underwriter/explain.ts` | `putItInWords()` — the model writes the reason, and nothing else |
| `underwriter/masking.ts` | `scrubbed()` — a last pass on the way out |

The rules work out the risk of default and what they will lend. Only then is a model handed
a decision that has already been made, along with a fantasy handle, and asked to write two
sentences of prose about it. It never sees an address, a balance or a key.

If there is no API key, or the answer comes back malformed, or it takes longer than twelve
seconds, the game uses hand written words instead and nothing breaks. There are tests for
what it refuses to print.

```
npm run underwriter
```

---

## What is real and what is not

We would rather say this ourselves than have it found.

| | |
| --- | --- |
| Attestcoin reads, in the browser | **Live.** Real heights, real hashes, every refresh |
| Floors seeded from an attested block | **Live** |
| The dungeon, start to finish | **Playable** |
| `PatronVault` and `TheLedger` | **Written, compiling, 16 tests passing.** Not deployed |
| The patron board, standing, ledger feed | **Stand-in data**, and the page says so on its face |
| The four step sealing rite | **A rehearsal clock**, not real block times |
| The house purse and house patron | **Written and running.** Waiting on faucet coin |

`contractsAreLive` in `src/chain/theLedger.ts` is the one switch. Swapping that file for
real reads is the only change the pages need. Deployment is blocked on faucet coin, not on
code.

---

## Built with

| | |
| --- | --- |
| Front end | TypeScript and Vite, no framework. Plain DOM parts |
| The dungeon | Canvas 2D, a trimmed sprite atlas, `sort by y` |
| Character art | Canvas `Path2D` over SVG path data, drawn at device resolution |
| Sound | Web Audio. 27 effects, synthesised, no files. One streamed track |
| Talking to purses | ethers v6 |
| Reading Attestcoin | `@gluwa/usc-sdk` |
| Contracts | Solidity 0.8.30, Foundry, `@gluwa/asc-contracts` |
| The worker | Node and tsx, polling Sepolia every twelve seconds |
| The house | Node's own `http`, no framework |
| The underwriter | Azure OpenAI, narration only, behind a scrubber |

The dungeon draws straight onto a canvas rather than through a game engine, because the
whole of its rendering is one line, `sort by y`, and a framework would have cost more than
it returned.

Type is set in Nosifer for the wordmark, Cinzel for anything you click, Crimson Pro for
reading and JetBrains Mono for numbers, all four from Google Fonts.

---

## Running it

### Five minutes, no coin needed

```
npm install
npm run dev
```

Press the door. Watch the witness bay count real Attestcoin heights. Take a pact from the
board and go down.

Want a wallet with something in it? Open the house and it will fill an empty one from
inside the game, so nobody has to leave for a faucet:

```
npm run house
```

### The whole thing

You need Node 20 or newer.

**1. Gather the art.**

```
npm install
npm run gather-art
```

That collects sixty five pieces of art into `public/art`, which is ignored by git so the
images never land in the repository.

**2. Open the door.**

```
npm start
```

**How to play.** W A S D to move, click or space to swing, Q and E for your two powers.
Walk over coin and gems to take them, swing at barrels to break them open, and press
Extract before something kills you.

**Trimming, for the dungeon.** Every sprite arrives on a 256 by 256 frame and most of that
frame is empty, so the dungeon ships a trimmed copy instead:

```
npm run trim-art
```

That reads `public/art`, crops each animation to the union of its solid pixels across all
frames, and writes the result plus the original offsets to `public/art/trimmed`. Around 86
percent of the bytes go, and the offsets are kept so sprites still line up with each other
in the world. Ground textures and the vignette are copied whole on purpose. Pages one and
two read the untrimmed originals and are not affected by this step.

---

## The realms

| | Creditcoin CC3 Testnet | Ethereum Sepolia |
| --- | --- | --- |
| Chain number | `102031` | `11155111` |
| Node | `https://rpc.cc3-testnet.creditcoin.network` | `https://ethereum-sepolia-rpc.publicnode.com` |
| Explorer | `creditcoin-testnet.blockscout.com` | `sepolia.etherscan.io` |
| Coin | tCTC | ETH |
| Its job | Where the game lives and settles | Where patrons put up their coin |

Testnet coin comes from the Creditcoin Discord, in the `token-faucet` channel:
`/faucet address:0xYourAddress`. There is no web faucet.

---

## Checking it

```
npm run check-setup      # reaches both chains, spends no gas, says what is still missing
npm test                 # settlement, agreement, attacks, the underwriter, the dark
npm run test-contracts   # 16 Foundry tests over PatronVault
npm run test-testnet     # reaches the live Attestcoin testnet
```

The settlement tests read the constants straight out of `TheLedger.sol`, so the contract
cannot drift away from them quietly. The agreement test holds `src/chain/settling.ts`
against the same constants, because a game that shows one number while the chain records
another is worse than a game that shows nothing.

Run `check-setup` first. It reads your `.env`, reaches both chains, reports the balance in
each purse, and asks Attestcoin whether Sepolia is attested. It will tell you exactly which
deployment steps are still outstanding and why.

---

## The contracts

Two contracts, one on each chain, and a worker between them.

**`PatronVault.sol`** sits on Ethereum and does one thing: hold a stake and shout
`RaidFunded(raider, patron, pactId, coinsStaked, patronShare)`. It knows nothing about
Creditcoin. The smallest stake worth anything is 0.001 ETH, a patron may keep at most 80
percent, and an unclaimed stake can be taken back after seven days.

**`TheLedger.sol`** sits on Creditcoin and extends `ASCBase` from `@gluwa/asc-contracts`.
That base calls the block prover precompile at
`0x0000000000000000000000000000000000000FD2`, refuses any query id it has already seen, and
only then hands control to our `_processAndEmitEvent`. So every number the ledger acts on
came out of a proved Ethereum transaction, and no proof can be spent twice.

The ledger will only believe one vault. `nameTheVault` is set once, and a funding log from
any other address is refused, so a proved transaction from some other contract cannot seal
a pact here.

It also holds the bond, which falls as you earn it:

| Standing | Bond |
| --- | --- |
| below 300 | 100 percent of 0.1 tCTC |
| 300 and up | 80 percent |
| 450 and up | 60 percent |
| 600 and up | 30 percent |
| 750 and up | 10 percent |
| 900 and up | nothing at all |

Reputation is the only thing in this game worth real money.

**The worker** watches the vault, waits for the block to be attested, asks the proof builder
for a Merkle and continuity proof, and calls `execute` on the ledger.

```
npm run build-contracts
npm run check-setup       # reads your .env, spends no gas
npm run deploy-vault      # on Sepolia
npm run deploy-ledger     # on Creditcoin
npm run name-vault        # tell the ledger which vault to believe
npm run worker            # carry proofs
npm run house             # fill empty wallets from inside the game
```

**[DEPLOYING.md](DEPLOYING.md) walks the whole way**, from an empty `.env` to a sealed
pact, including where to get testnet coin and what the errors mean.

Contracts compile with `viaIR` and evm version `shanghai`, matching Gluwa's own settings,
because `ASCBase` hits stack-too-deep without it.

One thing to plan a demo around: **the attestation wait is around eight minutes, sometimes
twenty.** That is the witnesses reaching agreement about the Sepolia block your funding
landed in, and it is not something the worker can hurry. It is also the thing that makes the
proof worth having.

---

## Licence

The code here is ours. The art is licensed, and the images are kept out of the repository
by `.gitignore` rather than committed.
