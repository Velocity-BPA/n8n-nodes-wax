# n8n-nodes-wax

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the WAX blockchain ecosystem, providing seamless integration with 8 core resources including AtomicAssets, Collections, Templates, Schemas, AtomicMarket, Accounts, Transfers, and Offers for building powerful NFT and gaming automation workflows.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![WAX Blockchain](https://img.shields.io/badge/WAX-Blockchain-orange)
![AtomicAssets](https://img.shields.io/badge/AtomicAssets-NFT-purple)
![Gaming](https://img.shields.io/badge/Gaming-DeFi-green)

## Features

- **AtomicAssets Integration** - Full NFT asset management with create, transfer, and query operations
- **Collection Management** - Complete collection lifecycle from creation to modification and analytics
- **Template Operations** - Design and deploy NFT templates with schema validation and metadata handling
- **Schema Definition** - Define and manage data structures for NFT collections with type enforcement
- **AtomicMarket Support** - Marketplace operations including listings, sales, auctions, and price monitoring
- **Account Operations** - Comprehensive account management with balance checking and resource monitoring
- **Transfer Handling** - Secure asset transfers with multi-signature support and transaction tracking
- **Offer Management** - Create, accept, decline, and monitor trading offers with automated workflows

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-wax`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-wax
```

### Development Installation

```bash
git clone https://github.com/Velocity-BPA/n8n-nodes-wax.git
cd n8n-nodes-wax
npm install
npm run build
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-wax
n8n start
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | Your WAX API key for authenticated requests | Yes |
| Environment | Select production or testnet environment | Yes |
| Rate Limit | Requests per second limit (default: 10) | No |

## Resources & Operations

### 1. AtomicAssets

| Operation | Description |
|-----------|-------------|
| Get Asset | Retrieve detailed information about a specific asset |
| List Assets | Query multiple assets with filtering options |
| Transfer Asset | Transfer asset ownership to another account |
| Create Asset | Mint new assets using existing templates |
| Update Asset | Modify mutable asset data |
| Burn Asset | Permanently destroy an asset |

### 2. Collections

| Operation | Description |
|-----------|-------------|
| Get Collection | Retrieve collection details and statistics |
| List Collections | Browse collections with pagination and filters |
| Create Collection | Initialize new NFT collection |
| Update Collection | Modify collection metadata and settings |
| Get Collection Stats | Retrieve trading volume and holder statistics |

### 3. Templates

| Operation | Description |
|-----------|-------------|
| Get Template | Fetch template configuration and schema |
| List Templates | Query templates by collection or attributes |
| Create Template | Design new NFT templates with metadata |
| Update Template | Modify template immutable data |
| Get Template Stats | Retrieve minting and usage statistics |

### 4. Schemas

| Operation | Description |
|-----------|-------------|
| Get Schema | Retrieve schema definition and structure |
| List Schemas | Browse available schemas by collection |
| Create Schema | Define new data structures for NFTs |
| Update Schema | Modify schema attributes and validation rules |

### 5. AtomicMarket

| Operation | Description |
|-----------|-------------|
| Get Sale | Retrieve marketplace sale information |
| List Sales | Browse active and completed sales |
| Create Sale | List assets for sale on the marketplace |
| Cancel Sale | Remove assets from marketplace |
| Get Auction | Fetch auction details and bid history |
| List Auctions | Query active auctions with filtering |
| Place Bid | Submit bids on auction items |

### 6. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account | Retrieve account information and balances |
| Get Account Assets | List all assets owned by an account |
| Get Account Collections | Show collections associated with account |
| Get Account History | Fetch transaction history and activities |
| Check Resources | Monitor CPU, NET, and RAM usage |

### 7. Transfers

| Operation | Description |
|-----------|-------------|
| Execute Transfer | Send assets between WAX accounts |
| Get Transfer | Retrieve transfer transaction details |
| List Transfers | Query transfer history with filters |
| Batch Transfer | Execute multiple transfers in sequence |
| Verify Transfer | Confirm transfer completion and status |

### 8. Offers

| Operation | Description |
|-----------|-------------|
| Get Offer | Retrieve offer details and status |
| List Offers | Browse sent and received offers |
| Create Offer | Propose asset trades with other users |
| Accept Offer | Accept incoming trade offers |
| Decline Offer | Reject trade proposals |
| Cancel Offer | Withdraw sent offers |

## Usage Examples

```javascript
// Get collection statistics for Alien Worlds
{
  "resource": "Collections",
  "operation": "Get Collection Stats",
  "collection_name": "alien.worlds",
  "symbol": "TLM"
}
```

```javascript
// List high-value sales from AtomicMarket
{
  "resource": "AtomicMarket",
  "operation": "List Sales",
  "min_price": "100.00000000 WAX",
  "state": "1",
  "limit": 50
}
```

```javascript
// Create new NFT template for gaming assets
{
  "resource": "Templates",
  "operation": "Create Template",
  "authorized_account": "gamedev.wax",
  "collection_name": "mygame.nfts",
  "schema_name": "weapons",
  "transferable": true,
  "burnable": false,
  "immutable_data": {
    "name": "Legendary Sword",
    "rarity": "Legendary",
    "attack": 150
  }
}
```

```javascript
// Monitor account for new asset transfers
{
  "resource": "Accounts",
  "operation": "Get Account History",
  "account": "player.wax",
  "limit": 100,
  "page": 1,
  "order": "desc"
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key in credential configuration |
| Rate Limit Exceeded | Too many requests sent within time window | Reduce request frequency or upgrade API plan |
| Asset Not Found | Requested asset ID does not exist | Verify asset ID and check if asset was burned |
| Insufficient Resources | Account lacks CPU/NET for transaction | Stake more WAX or wait for resource regeneration |
| Collection Not Found | Specified collection name is invalid | Check collection name spelling and existence |
| Template Mismatch | Asset template doesn't match collection schema | Verify template ID belongs to correct collection |

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run dev
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

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. All tests pass (`npm test`)
3. Linting passes (`npm run lint`)
4. Documentation is updated for new features
5. Commit messages are descriptive

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-wax/issues)
- **WAX Developer Documentation**: [WAX Developer Portal](https://developer.wax.io/)
- **AtomicAssets API Docs**: [AtomicAssets Documentation](https://atomicassets.io/)