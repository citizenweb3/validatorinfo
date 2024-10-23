DRAFT - DANGER

-----------------------------------------------

# Validator info: the return of the explorer

### 1. TL;DR
validatorinfo.com: A multichain Proof of Work and Pproof of Stake explorer, with a focus on validators and minign pools. A dashboard and an aggregator for token holders, miners, delegators and validators alike. ValidatoriInfo offers unique insights into validator and minign pools data. Utilizing a mixture of data, such as: user interaction, onchain metrics, social data, public good information, visual data, and numerous retention tools.

Our goals are:

1) Help users navigate the developing multichain landscape of validators and mining pools
2) Make epxlorers an adoption tool. Beyond a technical/analytical webiste
3) Help users find more efficeint ways to park their capital with operators
4) Improve querying on chain databases by introducing random prompts
5) Decrease the gap between operators and their delegators via gamified and meaningful UX and UI
6) Create a verifiable point of reference (the battery) for operator health status in real-time, for the web3 landscape

Interested target audiences, may include: stakers, delegators, miners, holders of proof of stake tokens, holders of proof of work tokens, validators, minign pools, researchers, data analytics and web3 enthusiasts. 

The application will attempt to maximize retention tools and remain open source. Further, are a collection of ideas, calculations, and other `under the hood` detail, that may improve user experience. 

If you would like to contribute, please leave us any feedabck, and look out for `under the hood` labeleed isuues.


-----------------------------------------------

## Content 

**[1. TL;DR](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#tldr)**

**[2. Product description](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#introduction-and-product-description)**

  * [2.1. User Story](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#a-user-story)

**[3. Web3 Application](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#a-journey-towards-web3-applications)**

  * [3.1. Tools](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)

**[4. Metrics](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#calculations-of-internal-metrics)**

  * [4.1. Average metrics](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#validator-metrics-that-are-compared-as-averages-to-a-network)
  * [4.2. Validator revenue](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#validator-revenue)
  * [4.3. TS, SS, GS, US](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ts-ss-gs-us)
  * [4.4. Battery](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#battery)
  * [4.5. Chain Health](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#chain-health)
  * [4.6. Others](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#others-research)
  * [4.7. New Terminology](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#reasoning-for-new-ish-terminology-and-the-latter)

**[5. Super Panckake]()**

  * [5.1. Multichain reputation](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#multichain-reputation-a-possible-hope)
  * [5.2. NFT's and bubbles](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#nfts-validator-wars-and-bubbles)

**[6. Summary](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#summary--conclusion)**

-----------------------------------------------

### 2. Product description
- What will it do and why in detail

#### A user story
***For the correct understadnign of the description below, the reader shoudl from here and onwards, take into accoutn the fact that the text will refer to validators and mining pools as a synonim AKA validators=mining pools"***

1) A staker of any token wants to find out information about whom to stake tokens with, or simply wanting to find out info about the validator they are already delegating to. Alternativle a miner wants to see the ratings or the status of a mining pool, or just find out overview information about a pool

2) They either search for, or find the website https://validatorinfo.com

3) They arrive at the main page, which present them with a list of validators and mining pools, written alphabetically, without being broken down by ecosystem. They may also use some of the filters and customization options presented to narrow the search down

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

-----------------------------------------------

### 3. A journey towards web3 applications
- no email logins
- wallet and Web3 actions
- onchain registry
- staking from app
- self-hosting, green energy: decentralized infra
- own llm model
- dao and token?

#### AI and other tools
1) Staking calculator:
Existing stakign calculators do not offer real time information and are inaccurate. They exclude various data from calculations, such as slashing and revenue, hence misleading users by providign wrong information. We have developed our stakign caluclator to include the following:
- Allow a user to calculate income from staking in: currency `X`, over `Y` amount of time, in `Z` network from `P` operator or `XYZP`
- Allow a user to calculate returns from either mining or staking (no scattering)
- Include validator revenue and slashing params, hence providing a realtime, more precise answer

2) val comparison: uptime, revenue over time (leading to capital efficiency flow)
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

-----------------------------------------------

### 4. Calculations of internal metrics
- New metrics / Metrics changes
- US, GS, SC, TS
- battery
- other ranking providers in TS, etc

#### Validator Metrics that are compared as averages to a network
1) `uptime`: Caluculate uptime over epoch. Compare to other validators in network. Show uptime as comparison to other validators on netowrk over N period of time
2) `missed blocks`: Caluculate missed blocks over epoch. Compare to other validators in network. Show missed blocks as comparison to other validators on netowrk over N period of time

Research:
- TVL can also be compared to the rest of the network. That is already shown in power of total network. i.e. percent of total stake. Maybe they should be shown together somehow

#### Validator revenue
- The validator profile page cotains a revenue tab, whcih dispalys total validator revenue across his activities
- Induvidual revenue is still shown for each network, but on val on X pages
- User `A` stakes amount `B` for period of time `C` = ABC
- Validator `V` does not offer cashback and has not been slashed. Validator `V1` offers cashback (has own token) + slashed over period `C`
- Hence `ABC`*`V` != `A1BC` *`V1`
- In other words, validators that provide own tokens can provide higher revenue over same period of time
- Equaly, slashing events shoudl be included in calculations, as they can influence overall payouts  
- Self stake ratios shoudl be somehow included after calculating the revenue, as to show payout risks
- Previous slashing cases should also be included in risk calculations
- Slashign boards: https://services.kjnodes.com/cosmos-tools/validator-slashboard/

#### TS, SS, GS, US
- The scores must meet the following criteria:
  - Be multichain aplicable
  - Be verifiable
  - Determenistic
  - Easily calculated
  - Have as less bias as possible
- To achieve that, we shall apply a health rank to any chain N. Where, for example, Technical score for validator X would be calculated as his technical score on chains N + N1 + N2... then added together to provide a score. The same goes for most of the following scores. Chain health is subjective, yet will be public and based on verifiable chain perforamnce metrics. 

##### Technical score:
- Uptime is the only primamry metric possible to verify and cross chain. we will calculate uptime as a median on each particualr chain in comparison to other valdiators, assign a score to each chain, and then sum the uptime scores.   Uptime, in this case should be calculated as average over period of time, in comparison to other valdiators.
- Variables that we will count per each chain and increment the score for eadch validator:
    - RPC / LCD / API / ARCVHIVE / INDEXER / LIGHT NODE
    - Provable GH activity per network?

##### Social score :
- Not a full onchain metric. Sum of all other existing ratings, such as staking rewords, etc (once again we will need to smoothen the numbers and find some average devisive factor)
- Variables (global):
   - Website / Twiiter / GH / CW3 interview  
- Variables that we will count per each chain and increment the score for eadch validator:
   - Amount of delegators per network (to add an onchain touch to this)
   - RESEARCH: % for # interaction per network (rss feeds?)

##### Governance score:
- Sum of voted on by a valdiator props in USD (bang) on their networks. This will need to be further smoothened (the number). Possibly some devidign factor introduced, such as sum of prop value / amount of networks or by something average. Once again, this seems to be the only governance metric is a)cross chain, b)open source, c)verifiable
- Variables that we will count per each chain and increment the score for eadch validator:
   - Craeted props on a network
   - RESEARCH: network ambassadros (how to check this?)

##### User score:
- per iteraction
- by how many people val added to favourites
- other reviews?
- minted nfts / poaps per val (future)

#### Battery
- user score and interactions (50%)
- badges and other web3 actions (15%)
- % of other scores (35%: TS - 20%, GS - 10%, SS - 5%) 

#### Chain health:
- use own?
- include health meter on each chain profile page?

#### Others, research:
- At start there are 100 validators, each has 100 tokens or, 10000 units staked total or 100 per validator. After 3 months, validator X has 60 units. Assuming the average still remains 100. Our validators TVl would be 0.6 out of 1. It would be more important to delegate to him in terms of decentralization 
- Random (added to ip address call)
- ratios (i.e. self stake / stake) (median of delegated tokens on a given network in comparison to other vals)

#### Reasoning for new(-ish) terminology and the latter
- uptime
- jailed / inactive validators
- TVL -> TVS (total value secured)
- Stakers / Delegators -> Followers or fans 

1) Active and inactive validators
- In inactive list, a validator can be working for X time, but with no delegations. Most explorers today show only search by default the active set, there is a feeling that if you are not in the active set, then you simply do not exist. Against decentralization
- Naming inactive is incorrect. Validator can be active, just not signing blocks

----------------------------------------------------------

### 5. Multichain reputation: a possible hope
- Reputation

#### NFTs, validator wars and Bubbles
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

### 6. Summary / Conclusion
- description of what is offered to whom and why its needed
  
