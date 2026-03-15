# Internal Links Map — ValidatorInfo

## Base URL
https://validatorinfo.com

## Main Pages

| Page | URL pattern | Description |
|------|-------------|-------------|
| Home | / | Landing page |
| Validators | /validators | All validators across chains |
| Networks | /networks | All supported networks |
| Nodes | /nodes | Node explorer |
| Web3 Stats | /web3stats | Cross-chain analytics dashboard |
| Staking Calculator | /stakingcalculator | Calculate staking rewards |
| Compare Validators | /comparevalidators | Side-by-side validator comparison |
| Mining Pools | /pools | Mining pool explorer |
| Blog | /blog | Articles and updates |

## Dynamic Pages

### Network Pages
- `/networks/[chainName]` — Network landing (e.g., `/networks/cosmoshub`)
- `/networks/[chainName]/overview` — Network overview with APR, TVL, validator count
- `/networks/[chainName]/validators` — Validators list for specific chain
- `/networks/[chainName]/proposals` — Governance proposals

### Validator Pages
- `/validators/[address]/[chainName]` — Individual validator profile
  - Example: `/validators/cosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3ual4tzqj2cv/cosmoshub`

### Chain Names (URL slugs)
aztec, cosmoshub, namada, stride, celestia, dymension, nillion,
osmosis, polkadot, solana, ethereum, neutron, nym, union,
atomone, althea, axone, bostrom, gravitybridge, likecoin,
nomic, oraichain, quicksilver, symphony, uptick, spacepussy

## Linking Rules

1. **Always use specific pages** — link to `/networks/cosmoshub/overview`, not just `/networks`
2. **Validator links need address** — link to `/validators/[address]/[chain]`, not generic
3. **Prefer deep links** — specific chain/validator pages over listing pages
4. **Blog posts** should link to relevant network/validator pages as CTAs
5. **Social posts** should always end with a relevant deep link

## Common Link Patterns for Content

| Content type | Link to |
|-------------|---------|
| APR/yield data | /networks/[chain]/overview |
| Validator ranking | /validators?chain=[chain] |
| Staking how-to | /stakingcalculator |
| Validator comparison | /comparevalidators |
| Slashing event | /validators/[address]/[chain] |
| Network stats | /web3stats or /networks/[chain]/overview |
| New chain announcement | /networks/[chain] |
