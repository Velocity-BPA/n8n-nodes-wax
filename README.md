# n8n-nodes-wax

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the WAX blockchain providing full support for NFT operations (AtomicAssets/AtomicMarket), gaming integrations, resource management, and blockchain interactions. Includes collections, minting, drops, packs, blends, staking, marketplace operations, and Hyperion history queries.

![WAX](https://img.shields.io/badge/WAX-Blockchain-orange)
![n8n](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen)

## Features

### Account Management
- Get account info, balances, and resources (CPU/NET/RAM)
- Buy/sell RAM, stake/unstake CPU/NET
- Validate account names
- Get account NFTs

### NFT Operations (AtomicAssets)
- Get asset info and data
- Transfer, batch transfer, burn, and back assets
- Query assets by owner, collection, schema, or template
- View asset sales and history

### Marketplace (AtomicMarket)
- Create, cancel, and purchase sales
- Manage auctions (create, bid, claim)
- Handle buy offers (create, accept, decline)
- Get market stats and suggested prices

### Collections, Schemas & Templates
- Create and manage collections
- Define schemas with custom attributes
- Create templates with max supply, transferable/burnable settings
- Query collection assets and statistics

### Minting & Drops
- Mint single or batch assets
- Estimate minting costs
- Claim drops, check eligibility
- Get drop statistics

### Packs & Blends
- Open mystery packs
- View pack contents and odds
- Execute blends (NFT crafting)
- Check blend eligibility and ingredients

### Staking
- Stake/unstake NFTs
- Claim staking rewards
- View staking pools
- Stake CPU/NET resources

### Gaming
- Integration with popular WAX games
- Execute game actions
- View leaderboards and rewards
- Get player statistics

### Token Operations
- Transfer tokens
- Create, issue, and retire tokens
- View token balances and supply
- Query token holders

### Smart Contracts
- Generic contract interaction
- Query table rows
- Execute any action
- Get contract ABIs

### Resource Management
- Buy/sell RAM
- Stake/unstake CPU/NET
- Powerup (temporary resource rental)
- Estimate resource costs

### History (Hyperion)
- Get actions and transactions
- Search history with filters
- Get account creator
- Query key accounts

### Utilities
- Convert WAX units
- Validate account names and asset IDs
- Sign and verify data
- Get chain info and blocks

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Search for `n8n-nodes-wax`
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/nodes

# Install the package from tarball
npm install /path/to/n8n-nodes-wax-1.0.0.tgz

# Restart n8n
n8n start
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-wax.zip
cd n8n-nodes-wax

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-wax

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-wax %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### WAX Network Credentials

| Field | Description | Example |
|-------|-------------|---------|
| Network | WAX network to connect to | `WAX Mainnet` |
| Chain API Endpoint | RPC endpoint URL | `https://wax.greymass.com` |
| Hyperion Endpoint | History API URL | `https://wax.eosphere.io` |
| Private Key | Your WAX private key | `5K...` |
| Account Name | Your 12-character WAX account | `myaccount123` |
| Permission | Permission level | `active` |

### AtomicAssets API Credentials (Optional)

| Field | Description | Example |
|-------|-------------|---------|
| API Endpoint | AtomicAssets API URL | `https://wax.api.atomicassets.io` |
| API Key | Optional rate-limit key | `your-api-key` |

### WAX Cloud Wallet Credentials (Optional)

| Field | Description | Example |
|-------|-------------|---------|
| WCW Endpoint | WAX Cloud Wallet API | `https://api-idm.wax.io` |
| Account Name | Your .wam account | `abc12.wam` |
| Auth Token | Authentication token | `eyJ...` |

## Resources & Operations

| Resource | Operations | Description |
|----------|------------|-------------|
| Account | 12 ops | Balance, resources, NFTs, RAM, staking |
| Transaction | 8 ops | Send, sign, push, history |
| Transfer | 6 ops | WAXP, tokens, batch, history |
| AtomicAssets | 12 ops | Get, transfer, burn, back assets |
| AtomicMarket | 11 ops | Sales, purchases, stats, search |
| Auctions | 9 ops | Create, bid, claim, cancel |
| Buy Offers | 8 ops | Create, accept, decline, queries |
| Collection | 10 ops | Info, stats, create, authors |
| Schema | 6 ops | Info, create, extend, queries |
| Template | 7 ops | Info, create, lock, queries |
| Minting | 6 ops | Mint, batch, estimate, history |
| Drops | 7 ops | Info, claim, eligibility, stats |
| Packs | 6 ops | Info, open, contents, odds |
| Blends | 8 ops | Info, execute, ingredients |
| Staking | 10 ops | Stake/unstake NFTs, CPU/NET |
| Game | 9 ops | Info, stats, actions, leaderboard |
| Token | 9 ops | Info, balance, transfer, create |
| Contract | 7 ops | Generic interaction, tables |
| Resource | 12 ops | RAM, CPU/NET, powerup |
| Hyperion | 12 ops | Actions, transactions, search |
| Utility | 11 ops | Convert, validate, serialize |

## Trigger Node

The **WAX Trigger** node monitors blockchain events in real-time.

### Event Categories

| Category | Events |
|----------|--------|
| Account | WAXP/token received/sent, resource changes |
| NFT | Asset received/sent/burned/backed/minted |
| Market | Sales created/completed, auctions, buyoffers |
| Collection | Assets minted, templates/schemas created |
| Staking | NFTs staked/unstaked, rewards claimed |
| Game | Game actions, rewards, achievements |
| Pack/Blend | Packs opened, drops claimed, blends completed |
| Block | New blocks, specific actions executed |

## Usage Examples

### Get Account Balance

```javascript
// Resource: Account
// Operation: Get WAXP Balance
// Account Name: yourwaxaccount
```

### Transfer NFT

```javascript
// Resource: Atomic Assets (NFT)
// Operation: Transfer Asset
// Asset ID: 1099511627776
// Recipient: recipientacct
// Memo: "Transfer from n8n"
```

### Create a Sale

```javascript
// Resource: Atomic Market
// Operation: Create Sale
// Asset IDs: ["1099511627776"]
// Price: 10.00000000 WAX
```

### Mint NFT

```javascript
// Resource: Minting
// Operation: Mint Asset
// Collection: yourcollection
// Schema: yourschema
// Template ID: 12345
// New Owner: yourwaxaccount
```

### Query Table Rows

```javascript
// Resource: Smart Contract
// Operation: Get Table Rows
// Contract: atomicassets
// Table: assets
// Scope: yourwaxaccount
// Limit: 100
```

## WAX Concepts

| Concept | Description |
|---------|-------------|
| **WAXP** | Native token (8 decimals) |
| **Account Names** | 12 characters (a-z, 1-5, .) |
| **Resources** | CPU, NET, RAM |
| **Powerup** | Temporary resource rental |
| **AtomicAssets** | NFT standard on WAX |
| **Collection** | NFT grouping/brand |
| **Schema** | NFT attribute definitions |
| **Template** | NFT blueprint with immutable data |
| **Packs** | Mystery box NFTs |
| **Blends** | NFT crafting recipes |
| **Drops** | NFT distribution events |

## Networks

| Network | Chain API | Hyperion | AtomicAssets |
|---------|-----------|----------|--------------|
| Mainnet | `https://wax.greymass.com` | `https://wax.eosphere.io` | `https://wax.api.atomicassets.io` |
| Testnet | `https://testnet.wax.pink.gg` | `https://testnet.waxsweden.org` | `https://test.wax.api.atomicassets.io` |

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Account does not exist | Invalid account name | Verify 12-char format (a-z, 1-5, .) |
| Insufficient RAM | Not enough RAM for action | Buy RAM via Resource node |
| CPU time exceeded | Transaction too complex | Stake more CPU or use Powerup |
| Transaction expired | Network/clock issues | Sync system clock, retry |
| Missing required authority | Wrong key/permission | Verify private key matches account |

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive credentials
3. **Test on testnet first** before mainnet operations
4. **Limit permissions** - use `active` not `owner` permission
5. **Monitor resource usage** to avoid failed transactions
6. **Validate inputs** before executing transactions

## Development

### Build Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Format code
npm run format
```

### Project Structure

```
n8n-nodes-wax/
├── credentials/
│   ├── WaxNetwork.credentials.ts
│   ├── AtomicAssets.credentials.ts
│   └── WaxCloudWallet.credentials.ts
├── nodes/
│   └── Wax/
│       ├── Wax.node.ts
│       ├── WaxTrigger.node.ts
│       ├── actions/
│       ├── transport/
│       ├── constants/
│       └── utils/
├── test/
│   ├── unit/
│   └── integration/
├── scripts/
├── package.json
├── tsconfig.json
├── LICENSE
├── COMMERCIAL_LICENSE.md
├── LICENSING_FAQ.md
└── README.md
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation:** [README.md](README.md)
- **Issues:** [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-wax/issues)
- **Website:** [velobpa.com](https://velobpa.com)

## Acknowledgments

- [WAX Blockchain](https://wax.io)
- [AtomicAssets](https://atomicassets.io)
- [n8n.io](https://n8n.io)
- [EOSIO/Antelope](https://antelope.io)
