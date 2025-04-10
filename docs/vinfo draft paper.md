DRAFT - DANGER

-----------------------------------------------

# Validator info: the return of the explorer

### 1. TL;DR
> validatorinfo.com: Web3 Blockchain Explorer. Validator, Mining Pool, Token and Network Real-time Metrics. Interactive Onchain Dashboard. Analyzing: user interaction, onchain metrics, social data, public good information, visual data, and more. For both: Proof of Work and Proof of Stake chains. 

Our goals:
- Help users navigate the developing multichain landscape of validators and mining pools
- Make epxlorers an adoption tool. Beyond a technical/analytical webiste
- Help users find more efficeint ways to park their capital with operators
- Improve querying on chain databases by introducing random prompts
- Decrease the gap between operators and their delegators via gamified and meaningful UX and UI
- Create a verifiable point of reference (the battery) for operator health status in real-time, for the web3 landscape

Interested target audiences: 
- Stakers
- Delegators
- Miners
- Proof of stake token holders
- Proof of work token holders
- Validators
- Minign pools
- Researchers
- Data analytics
- Web3 enthusiasts 

The application will attempt to maximize retention tools, remain open source and free. If you would like to contribute, please leave us any feedabck, and look out for `under the hood` labeleed issues.

-----------------------------------------------

### Content 

**[1. TL;DR](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#tldr)**

**[2. Product description](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#introduction-and-product-description)**

  * [2.1. User Story](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#a-user-story)

**[3. Web3 Application](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#a-journey-towards-web3-applications)**

  * [3.1. Staking Calculator](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)
  * [3.2. Validator comparison](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)
  * [3.3. Rumors](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)
  * [3.4. LLM](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)
  * [3.5. Dashboards and Operator-User interaction](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)
  * [3.6. UI and UX](https://github.com/citizenweb3/validatorinfo/blob/main/docs/vinfo%20draft%20paper.md#ai-and-other-tools)

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

### 2. Product Description
Validator info is a free to use, web3 application. It allows users to browse extensive information about networks, validators, mining pools, tokens, and offers a wider range of retention tools for the user, as well as a gamified experience. The idea of validator info is to rethink the explorer. From the UX to the logic, yet without reinventing the wheel. 

The application design hast kept the widely accepted, fashion-style of UI explorers and web3 apps. With a twist of gamification, and a simpler user experience to all types of target audiences. If explorers are meant to be points of access to the blockchain, then they should be multichain, blockchain agnostic, promote decentralization. Be easy and cool to use. 

#### A user story
***For the correct understanding of the description below, the reader should from here and onwards, take into account the fact that the text will refer to validators and mining pools as a synonym AKA validators=mining pools"***

A) A staker/miner/holder, of any token wants to find out information about whom to stake tokens with, or simply wanting to find out info about the validator they are already delegating to. Alternative a miner wants to see the ratings or the status of a mining pool, or just find out overview information about a pool

B) They either search for, or find the website https://validatorinfo.com

C) They arrive at the main page, which present them with a list of validators and mining pools, written alphabetically, without being broken down by ecosystem. They may also use some of the filters and customization options presented to narrow the search down

D) The main page contains not just a validator list, but the validators are presented with metrics and some basic links. Each validator and most metrics are clickable

D1) The main page contains other tools, such as a browser-based rumors chat, global web3 metrics, comparison and staking calculator tools

E) Upon clicking any of the validators, the user arrives at a validator profile page. The validator profile page presents the user with a various info, such as a visualization of the validators nodes. Various metrics and visualizations about the validator. A table of the validated networks with various metrics. Governance summary, etc. This page presents a validator entity, not a specific node

F) A user may also access a left menu from any of the pages of the website. The menu includes links to a more simple a-z validator list, a network a-z page and a metrics a-z page. Each takes the user to the desired page with alphabetical lists. Each item in the list is clickable and takes the user to the appropriate page with the description of the metric. In the case of the validator, it takes the user to the validator profile page. In the case of a network, i.e. cosmos, the user is:

G) Taken to the network summary page. A similar page to the validator profile page, in which they are presented with various metrics and visualizations

H) Bottom of each page contains a sub-menu with our social links

I) The left menu also contains links to such pages as about us, etc. 

J) When a user clicks on a network from the validator profile page, he arrives at a `passport` type page of a validator on a specific network. The validator profile contains a list of all the validators nodes, including info about public goods, and revenue. 

K) When a user opens the passport page, they see a detailed description of a validators' activity on a specific network, broken down into categories, for easier understanding. This page represents the more typical validator as a node, rather than the whole entity

L) A user is presented with numerous tools, such as AI search, favorites, dashboard page, etc. The tools are only accessible after a web3 login is performed

M) The application contains numerous retention tools, such as reward collection, library resources, ability to interact - approve, add and disprove info, etc

N) A user has access to all network related information, such as governance summary, tx summary etc

O) A user clicks on tx XYZ in, and gets to /validators/citizenweb3/cosmos/tx/123456789 they see tx info and can expand tx detail on same page or get a JSON format of the tx

-----------------------------------------------

### 3. A journey towards web3 applications
- no email logins
- wallet and Web3 actions
- onchain registry
- staking from app
- self-hosting, green energy: decentralized infra
- own llm model
- dao and token?

##### User interaction flow with the app
- User logs in via web3 wallet
- Users can add info about validators, such as links to interviews, public goods, other links
- Users can add info to library page
- Users can add or propose info to network page
- Users receive badges for adding info 
- Adding info is signing tx
- Signed tx -> mint poap / nft 

#### AI and other tools

##### Staking calculator 
Existing stakign calculators do not offer real time information and are inaccurate. They exclude various data from calculations, such as slashing and revenue, hence misleading users by providign wrong information. We have developed our stakign caluclator to include the following:
- Allow a user to calculate income from staking in: currency `X`, over `Y` amount of time, in `Z` network from `P` operator or `XYZP`
- Allow a user to calculate returns from either mining or staking (no scattering)
- Include validator revenue and slashing params, hence providing a realtime, more precise answer

##### Validator comparison 
- uptime, revenue over time (leading to capital efficiency flow)
- val revenue: own tokens, slashing parameters, compare against network
- capital flow efficiency. Which val would i best put 1 100 USD for period X

##### Rumours 
- Rumors. Matrix style. Leading to tx memo

##### LLM / Random prompts
- AI data. On chain data. Social data feed

##### Dashboards, reviews and interactions
- Reviews / announcements. Leading to governance forum or bazaar
- Dashboards: logged-in users and validators via gaming styles (Throne room)

##### UI and UX
- stylistics: pixelated gaming. Easy info feed
- pixeled characters
- gamification
- badges. Retention for actions
- visual comparisons: uptime, etc
- Poaps, token collection
- Token swap in platform
- web browser game. Simple in browser. 80s style

-----------------------------------------------

### 4. Calculations of internal metrics
- New metrics / Metrics changes
- US, GS, SC, TS
- battery
- other ranking providers in TS, etc

#### Validator Metrics that are compared as averages to a network
1) `uptime`: Caluculate uptime over epoch. Compare to other validators in network. Show uptime as comparison to other validators on netowrk over N period of time
2) `missed blocks`: Caluculate missed blocks over epoch. Compare to other validators in network. Show missed blocks as comparison to other validators on netowrk over N period of time
3) `self delegation`: Self Delegation shoudl be calculated as ratio and comapred to other valdiators on network, with 3 states: high / medeium / low

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
- Chain health index is a public metric that clearly shows the current status of its liveliness, based on 3 separate and commonly known pillars: security, scalability, decentralization (for easier calculations, further blocks might be added, such as: financial, privacy, technological, social, etc)
- Display: include health meter on each chain profile page, as shown on [global tab now](https://validatorinfo.com/global) - in the form of 3 meters
- Under the hood: Under the hood, these metrics should be calculated as one, as it will be used to calculate each individual validator / pool metric. In the future logged in users can adjust settings / params
- NA means that the metric cannot be calculated now. rather than removing it altogether from calculations, i suggest setting 0 score to it, to show that no one is perfect =)

 1) Security (32.5%)

 1A) Onchain (20%):
   - <b>Network latency:</b>
      - The delay between the initiation of a transaction and its confirmation, affecting user experience and transaction speed (can also be scalability)
      - Time it takes from the moment of a tx registration by a node OR tx registration in mempool - up to - the time the tx is finalized in a block (the timestamp)
      - Should native and non native tokens e coutned seperatly?
      - Averages p/network - count per time/epoch  
   - Uptime of network
   - Hashrate (POW) or TVL in terms of token % out of supply (POS)

 1B) Offchain (5%):
   - Consensus algo? (how to measure?)
   - security audits? (what to include?)
   - bug bounty program existance

 1C) Mixed (7.5%): 
   - Mining / staking growth over time
   - C.P. / M. cap?
   - Median of validator health (NA)

 2) Scalability (32.5%)

 2A) Onchain (20%):
   - Total value locked on chain (how much money inflow there is) 
   - active wallets
   - tx volume
   - revenue / fees
   - account growth over time in comparison to others (NA)
   - T.P.S. or througphput
   - % of completed transactions?

 2B) Offchain (5%):
   - twitter mentions (is it possible to use now?)
   - code commits: if too difficult to calculate (branches, etc) - can take existing rating
   - amount of builders compares to others (NA)
   - gh starts (which repo?)
   - gh active forks? (active: 1 commit over last month)
   - dev docs existance

 3C) Mixed (7.5%): 
   - live explorer: https://openchains.info/status
   - Other ratings https://cer.live/token | stakign rewards | bro n bro | observatory | substrate scan | solscan | etc 
   - L'2s and L'3 or rather, how many network extensions are building on top of your L1
   - user value: m.cap/accounts
   - tvl/fdv (total value locked on chain - capital / fully diluted valuation) 
   - smart contract existance / complexity and usage (how to calculate compelxity?)

 3) Decentralization (32.5%)

 3A) Onchain (20%):
   - cost to run a node comnapres to others / cost to mine compares to others (can be scalability too) (NA)
   - gini cooeficient: distribution of wealth on a network
   - nakomoto cooficeint: distribution of mining power or validator stake on a network
   - distribution params in comaprison to others. for example: holders with 1K compares to others chains (NA)
   - active user cost (how to calcualte?) (NA)
   - token concentration / distribution (how much of stake is held by top 100 accounts, top 1000, etc)

 3B) Offchain (5%):
   - nodes/clients: how many are run on top of it
 
3C) Mixed (7.5%): 
   - geography of nodes / services
   - governance + influence on users

4) User Sentiment: 2.5% (NA)
  

#### Others, research:
- At start there are 100 validators, each has 100 tokens or, 10000 units staked total or 100 per validator. After 3 months, validator X has 60 units. Assuming the average still remains 100. Our validators TVl would be 0.6 out of 1. It would be more important to delegate to him in terms of decentralization 
- Random (added to ip address call)
- ratios (i.e. self stake / stake) (median of delegated tokens on a given network in comparison to other vals)
 - some other methodologies: https://tokeninsight.gitbook.io/support/methodologies/rating/token-rating

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
  
