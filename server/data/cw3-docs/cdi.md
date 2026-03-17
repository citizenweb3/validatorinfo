# Chain Data Indexer: CDI

> Built by [Citizen Web3](https://www.citizenweb3.com/) for [ValidatorInfo](https://validatorinfo.com/)

## Chains

- [Cosmos Hub](https://github.com/citizenweb3/chain-data-indexer/tree/main) - Development
- [Aztec Protocol](https://github.com/citizenweb3/chain-data-indexer/tree/aztec) - Production

## Overview

Chain Data Indexer (CDI) is a high-performance, modular blockchain data indexer designed for powering block explorers, analytics platforms, DeFi dashboards, compliance tools, and research projects. It extracts, processes, and stores blockchain data from various networks into a PostgreSQL database, enabling fast and flexible querying.

- Primary Use Case: Powering block explorers with rich, searchable blockchain data.
- Extensible: Suitable for analytics, compliance, DeFi, R&D, and more.
- Multi-Network: This is a monorepo with indexers for multiple blockchain networks.

## Supported Networks

| Network | Branch | Status | Description |
|---------|--------|--------|-------------|
| Cosmos Hub | main | Production | Full indexer for cosmoshub-4 with Protobuf decoding, transaction parsing, and PostgreSQL storage |
| Aztec Protocol | aztec | Development | High-performance L2 indexer with REST API, Kafka streaming, and parallel block processing (270-280 blocks/sec) |

### Switching Networks

To work with a specific network indexer, switch to the corresponding branch:

```bash
# For Cosmos Hub indexer
git checkout main

# For Aztec Protocol indexer
git checkout aztec
```

Each branch contains network-specific configuration, schemas, and documentation.

## Features

Features below are specific to the Cosmos Hub indexer. For other networks, refer to the respective branch documentation.

- High Performance: Efficiently processes large volumes of blocks and transactions.
- Resumable Indexing: Smart resumption from the last indexed block to prevent data loss.
- Dockerized: Simple deployment with Docker Compose.
- PostgreSQL Integration: Robust, scalable storage with partitioning and indexing.
- Advanced Decoding: Supports rich message/transaction type extraction.
- Real-time Capable: Block-by-block processing with adjustable concurrency.
- Modular Branches: Each supported network can be developed and maintained independently.

## Architecture

- RPC Client: Interfaces with blockchain RPC endpoints.
- Message Decoder: Dynamically generates message type definitions for supported chains.
- Database Layer: Optimized PostgreSQL schema with automatic partitioning.
- Configuration System: Environment-based, validated configuration.

## Requirements

- Node.js (v22+ recommended or v22.18.0 LTS)
- yarn
- Docker and docker-compose

## Quick Start

### Using Docker (Recommended)

1. Copy and configure your environment:
   ```bash
   cp .env.example .env
   ```

2. Build and start all services:
   ```bash
   docker compose --env-file .env up --build -d
   ```

3. View indexer logs:
   ```bash
   docker compose logs -f indexer
   ```

By default, the indexer will resume from the last processed block (RESUME=true) and use Postgres as the sink.

## Configuration

All configuration is managed through environment variables. See .env.example for a complete list.

| Variable | Description | Example |
|----------|-------------|---------|
| PG_HOST | PostgreSQL host | localhost |
| PG_PORT | PostgreSQL port | 5432 |
| PG_USER | PostgreSQL user | blockchain |
| PG_PASSWORD | PostgreSQL password | password |
| PG_DATABASE | PostgreSQL database name | indexerdb |
| RPC_URL | Blockchain RPC endpoint | https://rpc.cosmoshub-4-archive.citizenweb3.com |
| SINK | Data sink type | postgres |
| RESUME | Resume from last indexed block | true |

## Contributing

Contributions are welcome! Open issues/PRs for improvements, bug fixes, or new features. For significant changes, please open an issue to discuss your ideas first.

## License

[BE GOOD License](https://github.com/citizenweb3/chain-data-indexer/blob/main/LICENSE-BG)
