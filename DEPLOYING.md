# Putting Blood Ledger on chain

Two contracts, one on each chain, and a worker between them. This walks the whole way
from an empty `.env` to a sealed pact.

Nothing here spends real money. Sepolia and Creditcoin CC3 are both testnets.

---

## What you need first

| | |
| --- | --- |
| Node | 20 or newer |
| A wallet | MetaMask, or any private key you are willing to paste into a testnet `.env` |
| Sepolia ETH | a few hundredths is plenty |
| Testnet CTC | from the Creditcoin Discord, see below |
| The art pack | `npm run gather-art` needs it, but deployment does not |

**Use a throwaway key.** The `.env` holds private keys in plain text. Make a fresh wallet
for this and never put real funds in it.

---

## Step 1 — Fill in the .env

```
cp worker/.env.example .env
```

It goes in the **project root**, not in `worker/`. Both the deploy scripts and the worker
read `.env` from wherever npm was run.

Open it and set the two keys. Everything else is already filled in for testnet:

```
SOURCE_CHAIN_RPC_URL=https://rpc.sepolia.org
SOURCE_CHAIN_KEY=1
PATRON_VAULT_ADDRESS=0x
SEPOLIA_WALLET_PRIVATE_KEY=0x        <- yours

CREDITCOIN_RPC_URL=https://rpc.cc3-testnet.creditcoin.network
THE_LEDGER_ADDRESS=0x
CREDITCOIN_WALLET_PRIVATE_KEY=0x     <- yours

PROOF_BUILDER_URL=https://prover.cc3-testnet.creditcoin.network

LOOK_BACK_BLOCKS=0
POLL_EVERY_MS=12000
```

`SOURCE_CHAIN_KEY=1` is Sepolia, the way Attestcoin numbers its source chains. Mainnet is
`3`. Do not change it unless you mean to.

The two address lines stay `0x` for now. Steps 3 and 4 fill them in.

---

## Step 2 — Get coin into both purses

**Sepolia ETH** comes from any Sepolia faucet. A few hundredths of an ETH covers the
deployment and a handful of raids.

**Testnet CTC** comes from the Creditcoin Discord. There is no web faucet.

1. Join [the Creditcoin Discord](https://discord.gg/Gu43zTfmtc)
2. Go to the `token-faucet` channel
3. Send `/faucet address:0xYourEvmAddress`
4. Wait for **CTC Faucet successful**

Use the address that belongs to `CREDITCOIN_WALLET_PRIVATE_KEY`, not your Sepolia one,
unless they are the same wallet.

Then check both landed:

```
npm run build-contracts
npm run check-setup
```

`check-setup` reads your `.env`, reaches both chains, reports the balance in each purse,
and asks Attestcoin whether Sepolia is attested. It spends no gas. Run it whenever
something is not working.

---

## Step 3 — Put the vault on Ethereum

```
npm run deploy-vault
```

It prints the address and the line to paste:

```
deploying PatronVault from 0x…
PatronVault is at 0xABC…
put PATRON_VAULT_ADDRESS=0xABC… in your .env
```

Paste it into `.env`.

`PatronVault` is 1,507 bytes and holds no logic worth attacking. Its only job is to take a
stake and emit `RaidFunded`.

---

## Step 4 — Put the ledger on Creditcoin

```
npm run deploy-ledger
```

Same shape. Paste `THE_LEDGER_ADDRESS` into `.env`.

The wallet that deploys becomes the **keeper**, which is the only address allowed to run
step 5. It is fixed at construction and cannot be changed afterwards.

`TheLedger` is 8,119 bytes and extends `ASCBase` from `@gluwa/asc-contracts`. That base
holds the precompile call and the replay guard, so this contract is only the part that is
ours.

---

## Step 5 — Tell the ledger which vault to believe

```
npm run name-vault
```

This is the step people forget, and the worker refuses to start without it.

The ledger will only act on a funding log emitted by **one** address. Until you name it,
`patronVault` is the zero address and every proof is refused. That is deliberate: without
it, anyone could prove a transaction from some other contract that happens to emit a
matching event, and seal a pact for free.

`nameTheVault` may be called once. If you deploy a new vault, deploy a new ledger too.

Now:

```
npm run check-setup
```

Everything should read `ok`.

---

## Step 6 — Run the worker

```
npm run worker
```

It prints what it is watching, then waits:

```
Blood Ledger worker
  vault   0xABC… on chain key 1
  ledger  0xDEF…
  keeper  0x123…
  reading the vault from block 9384712
```

Leave it running. It polls Sepolia every twelve seconds.

---

## Step 7 — Fund a raid and watch it seal

Call `fundRaid(raider, patronShare)` on the vault with some ETH attached. The raider is
whichever address will play; the share is what the patron keeps, out of 100, and may not
exceed 80.

From a MetaMask console, Remix, or `cast`:

```
cast send $PATRON_VAULT_ADDRESS \
  "fundRaid(address,uint16)" 0xTheRaider 40 \
  --value 0.01ether \
  --rpc-url $SOURCE_CHAIN_RPC_URL \
  --private-key $SEPOLIA_WALLET_PRIVATE_KEY
```

The worker picks it up within a poll and prints its way through:

```
a patron staked 10000000000000000 for 0xTheRaider
   at 0x9f2…
   witnesses have reached height 11645240, this pact sits at 11645288
   proof built, carrying it to Creditcoin
   pact sealed at 0x4c1…
```

**The attestation wait is the slow part — around eight minutes, sometimes up to twenty.**
That is the Attestcoin witnesses reaching agreement about the Sepolia block your funding
landed in, and it is not something the worker can hurry. It is also the thing that makes
the proof worth having.

---

## What can go wrong

**`the ledger believes 0x000…, not 0xABC…`**
Step 5 was skipped. Run `npm run name-vault`.

**`Query already processed`**
The same funding transaction was proved twice. That is the replay guard in `ASCBase`
working, not a fault. Fund a new raid.

**`NotOurVault`**
The funding log came from a contract the ledger was not told to believe. Check
`PATRON_VAULT_ADDRESS` matches what you deployed.

**The worker sits at "waiting for attestation" for a long time**
Normal. Around eight minutes is usual. It gives up after twenty.

**Gas estimation fails on Creditcoin**
Also normal, and handled. Precompiles do not always report revert reasons during
estimation, so the worker falls back to a gas limit worked out from the size of the
continuity proof, the same way Gluwa's own examples do.

**`insufficient funds`**
Check `npm run check-setup`. Faucets are per-day; you may need to wait.

---

## Turning the game over to the chain

Until the contracts are deployed the hall reads worked examples and says `rehearsal` in its
top bar. Once your addresses are in `.env`, flip:

```ts
// src/chain/theLedger.ts
export const contractsAreLive = true
```

and point the reads at your deployed ledger. The parts never learn where the data came
from, so that one file is the whole change.

Rolling floors from an attested block already works with no contracts at all, because it
reads the chain info precompile rather than anything of ours.

---

## What this costs

| | |
| --- | --- |
| Deploy the vault | a few hundredths of Sepolia ETH |
| Deploy the ledger | a little tCTC |
| Name the vault | almost nothing |
| Seal one pact | tCTC, and it rises with the size of the continuity proof |
| Roll a floor | nothing, it only reads |

Every one of those is testnet coin from a faucet.
