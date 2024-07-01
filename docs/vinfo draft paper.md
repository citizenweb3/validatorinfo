DRAFT - DANGER

# Validator info: the return of the explorer

### TL;DR
This document is an attempt to create a mixture of a white paper / user documentation for validatorinfo.com: validator-focused, multichain explorer, dashboard and aggregator for POS token holders. It is a web application that offers unique insights into validator data. Attempting to mix onchain data, user interaction, social data, public good information, and visualization, such as graphs, unique staking calculators, comparison tools, etc. 

With an aim to help the user navigate their landscape across the developing multichain world of validators. Interested target audiences, may include: any stakers, delegators, holders of proof of stake tokens, validators, researchers, data analytics and web3 enthusiasts. 

The application will attempt to maximize retention tools and remain open source. Further, are a collection of ideas, calculations, and other `under the hood` detail, that may improve user experience

### Introduction and product description
- What will it do and why

### A user story
Might be outdated...

1) A staker of any token wants to find out information about whom to stake tokens with, or simply wanting to find out info about the validator they are already delegating to. 

2) They either search for or find the website validatorinfo.com

3) They arrive at the main page, which present them with a list of validators, written alphabetically, without being broken down by ecosystem. They may also use some of the filters presented to narrow the search down

4) The main page contains not just a validator list, but the validators are presented with metrics and some basic links. Each validator is clickable

5) Upon clicking any of the validators, the user arrives at a validator profile page. The validator profile page presents the user with a various info, such as a visualization of the validators nodes. Various metrics and visualizations about the validator. A table of the validated networks with various metrics. Governance summary, etc

6) A user may also access a left menu from any of the pages of the website. The menu includes links to a more simple a-z validator list, a network a-z page and a metrics a-z page. Each takes the user to the desired page with alphabetical lists. Each item in the list is clickable and takes the user to the appropriate page with the description of the metric. In the case of the validator, it takes the user to the validator profile page. In the case of a network, i.e. cosmos, the user is:

7) Taken to the network summary page. A similar page to the validator profile page, in which they are presented with various metrics and visualizations

8) Bottom of each page contains a sub-menu with our social links

9) The left menu also contains links to such pages as about us, etc. 

10) When a user clicks on a network from the validator profile page, he arrives at the network summary page. From here he can see transactions like on a normal explorer

11) A user can see a table with networks A given validator validates. And other info

12) A user clicks on CosmosHub inside citizenweb3 validator page and gets to /validators/citizenweb3/cosmos - Here they will find info related to that validator on that network, such as governance summary, tx summary etc

13) A user clicks on tx XYZ in that list, and gets to /validators/citizenweb3/cosmos/tx/123456789 they see tx info and can expand tx detail on same page or get a JSON format of the tx

### A journey towards web3 applications
- no email logins
- wallet and Web3 actions
- staking from app
- self-hosting, green energy: decentralized infra
- own llm model

### AI and other tools
- staking calculator. Unique. Include slashing own token, etc
- val comparison: uptime, revenue over time (leading to capital efficiency flow)
- val revenue: own tokens, slashing parameters, compare against network
- Rumors. Matrix style. Leading to tx memo
- Reviews / announcements. Leading to governance forum or bazaar
- capital flow efficiency. Which val would i best put 1 100 USD for period X
- visual comparisons: uptime, etc
- Poaps, token collection
- web browser game. Simple in browser. 80s style
- stylistics: pixelated gaming. Easy info feed
- dashboards: logged-in users and validators via gaming styles (Throne room)
- pixeled characters
- badges. Retention for actions
- AI data. On chain data. Social data feed
- Token swap in platform

### Reasoning for new(-ish) terminology and the latter
- uptime
- jailed / inactive validators
- TVL -> TVS (total value secured)
- Stakers / Delegators -> Followers or fans 

1) Active and inactive validators
- In inactive list, a validator can be working for X time, but with no delegations. Most explorers today show only search by default the active set, there is a feeling that if you are not in the active set, then you simply do not exist. Against decentralization
- Naming inactive is incorrect. Validator can be active, just not signing blocks

### Calculations of internal metrics
- New metrics / Metrics changes
- US, GS, SC, TS
- battery
- other ranking providers in TS, etc

1) Metrics calculation that can be calculated as averages to a network
- Rather than showing normal `uptime`, we can show uptime compares to the average uptime on the network in question
- Same goes for `missed blocks` - we need to calculate the average missed blocks per validator per round of time and show it in comparison + amount of missed blocks. So it will be the normal amount + % out of 100 or similar
- Any other such metrics? That can be shown using medians/averages?
- TVL can also be compared to the rest of the network. That is already shown in power of total network. i.e. percent of total stake. Maybe they should be shown together somehow

2) Ranking and sorting
- i.e. At start there are 100 validators, each has 100 tokens or, 10000 units staked total or 100 per validator. After 3 months, validator X has 60 units. Assuming the average still remains 100. Our validators TVl would be 0.6 out of 1. It would be more important to delegate to him in terms of decentralization 
- Random (added to ip address call)

3) Extra metrics 
- ratios (i.e. self stake / stake) (median of delegated tokens on a given network in comparison to other vals)

4) Validator revenue
- On a val profile page, there is a revenue tab, going further we can try to develop a basic metric to be later on used in calculations
- We can show this and calculate easily a metric, such as: user A stakes amount B for period of time C, during period of time D. For that he receives Cashback (if provided) or validator token + staking rewards, that's E 
- If value of E over a period of time, D is larger than sole value of staking rewards. We have something to work with

5) Technical score, Social score, Governance score, User score (TS, SS, GS, US) are metrics we calculate on our side
5A) Technical score:
- Uptime using median compares to other validators on each network, then use an average or a sum of 
a) Paramters that we will count per each chain and increment the score
- RPC / LCD/  Indexer / Archive node
- provable GH activity per network?

5B) Social score :
- Average(?) sum of existing indexes / scores
a) Paramters that we will count per each chain and increment the score
- amount staked on validator per chain compares to average % of VP per validator
- #X network interaction per chain (rss?)
b) Overall paramnets that can increment the score
- Website / Twitter / GH / CW3 interview

5C) Governance score
- sum of voted on by a valdiator props in USD (devision factor?)
a ) Paramters that we will count per each chain and increment the score
- Created prop 
- Ambassadors (how to calculate?)

5D) User score
- per iteraction 
i.e.
- by how many people val added to favourites
- other reviews?
- minted nfts / poaps per val (future)

5E) battery
- user score
- badges
- % of other scores

6E) chain health calculation:
- use own?
- include health meter on each chain profile page?

### Multichain reputation: a possible hope
- Reputation

### NFTs, validator wars and Bubbles
- NFTs: many ideas. nft pools. 
- Staking on validators: creating unique NFTs with value
- Where is the money, Lebowski?: Providing API calls. Ads to foundations. cw3 retail and foundation delegations
- Incorporating knowledge graphs
- own token: end goal - governance token

1) A logged in via web 3 user can staked any? Tokens on a validator. Staking on a validator mints an NFT. For example, NFT gives cash back if staked back to citizen web 3 and merch discount, etc. This can be heavily integrated into provable reputation mechanics. To add game theory. You can create staking pools on a specific validator, which mint tradable nfts in return that can be used as game cards

2) Token / NFT ideas:
A) (1)CC guest NFTs / (2)Cw3 guest NFTs (podcast)
B) (1)Web3 society collection (old bostrom game design) / (2)Access NFTs (web3 society)
C) (1)Daily tokens or POAPS / (2)Badges / (3)Stakign on val (v.info)
D) (1)Cashback CW3 val / (2)Merch (cw3 val)
E) (1)Drops / (2)Bubbles (dao)

- User A has NFT A or B + staking D = D1 + C2
- User B: can use A/B to purchase D2
- User C: collects C1, stakes to D = C2
- User D has C2 + A/B + stakes to D -> can mint E1/E2 and C3?

2A) More flows examples
- Computation: staking to val D1
- Proof of activity / bandwidth: A/B/C
- storage/value: use A/B/C/D in combo to mint E and to
- stake E to receive voting rights
- Staking c3 should be on favorite validators. Wrap any value into E1 or E2 to receive fav NFT. Stake fav NFT?

### Summary / Conclusion
- description of what is offered to whom and why its needed
  
