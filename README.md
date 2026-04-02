# n8n-nodes-wax

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

This n8n community node provides comprehensive integration with the WAX blockchain ecosystem, offering access to 6 key resources including AtomicAssets, AtomicMarket, account management, and transaction operations. It enables seamless automation of NFT marketplace operations, blockchain account monitoring, and asset management workflows within n8n.

![n8n Community Node](https://img.shields.io/badge/n8n-Community%20Node-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![WAX Blockchain](https://img.shields.io/badge/WAX-Blockchain-orange)
![AtomicAssets](https://img.shields.io/badge/AtomicAssets-NFT-purple)
![AtomicMarket](https://img.shields.io/badge/AtomicMarket-Marketplace-green)

## Features

- **AtomicAssets Integration** - Complete NFT asset management including minting, transferring, and querying assets
- **AtomicMarket Operations** - Full marketplace functionality for listings, sales, auctions, and market analytics
- **Account Management** - Comprehensive WAX account operations including balance checks, permission management, and account history
- **Transfer Operations** - Native WAX token and NFT transfer capabilities with transaction tracking
- **Burn Operations** - Asset burning functionality for NFT destruction and token deflation mechanisms
- **Configuration Management** - Dynamic WAX network configuration and endpoint management
- **Real-time Monitoring** - Live blockchain event monitoring and transaction status tracking
- **Batch Processing** - Efficient bulk operations for large-scale asset and transaction management

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
| API Key | Your WAX API access key for authenticated operations | Yes |
| Environment | Target WAX network environment (mainnet/testnet) | Yes |
| Endpoint URL | Custom WAX API endpoint URL (optional override) | No |

## Resources & Operations

### 1. AtomicAssets

| Operation | Description |
|-----------|-------------|
| Get Assets | Retrieve NFT assets by owner, collection, or template |
| Get Asset Details | Fetch detailed information for a specific asset |
| Create Asset | Mint new NFT assets with metadata |
| Transfer Asset | Transfer assets between WAX accounts |
| Update Asset | Modify mutable asset attributes |
| Get Collections | List available NFT collections |
| Get Templates | Retrieve asset templates and schemas |
| Get Schema | Fetch collection schema definitions |

### 2. AtomicMarket

| Operation | Description |
|-----------|-------------|
| Get Sales | Retrieve active and completed marketplace sales |
| Create Sale | List assets for sale on the marketplace |
| Cancel Sale | Remove assets from marketplace listings |
| Purchase Asset | Buy assets from marketplace listings |
| Get Auctions | Fetch active and completed auction listings |
| Create Auction | List assets for auction with bidding |
| Place Bid | Submit bids on auction listings |
| Get Market Stats | Retrieve marketplace analytics and statistics |

### 3. Accounts

| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve detailed WAX account information |
| Get Account Balance | Check WAX and token balances |
| Get Account History | Fetch transaction history for accounts |
| Get Permissions | Retrieve account permission structure |
| Update Permissions | Modify account permission settings |
| Get Resources | Check CPU, NET, and RAM allocations |
| Stake Resources | Stake WAX for CPU and NET resources |

### 4. Transfers

| Operation | Description |
|-----------|-------------|
| Send WAX | Transfer native WAX tokens between accounts |
| Send Tokens | Transfer custom tokens on WAX blockchain |
| Get Transfer History | Retrieve transfer transaction records |
| Bulk Transfer | Execute multiple transfers in batch |
| Validate Transfer | Verify transfer parameters before execution |
| Get Transaction Status | Check status of pending transfers |

### 5. Burns

| Operation | Description |
|-----------|-------------|
| Burn Asset | Permanently destroy NFT assets |
| Burn Tokens | Burn fungible tokens to reduce supply |
| Get Burn History | Retrieve records of burned assets |
| Bulk Burn | Execute multiple burn operations |
| Validate Burn | Verify burn parameters before execution |

### 6. Config

| Operation | Description |
|-----------|-------------|
| Get Network Info | Retrieve WAX network configuration |
| Get API Endpoints | List available API endpoints |
| Update Settings | Modify node configuration settings |
| Test Connection | Verify connectivity to WAX network |
| Get Chain Info | Fetch current blockchain information |

## Usage Examples

```javascript
// Get all NFTs owned by an account
{
  "resource": "AtomicAssets",
  "operation": "Get Assets",
  "owner": "waxaccount123",
  "limit": 100,
  "page": 1
}
```

```javascript
// Create a marketplace sale listing
{
  "resource": "AtomicMarket", 
  "operation": "Create Sale",
  "seller": "mynftaccount",
  "asset_ids": ["1099511627776", "1099511627777"],
  "listing_price": "100.00000000 WAX",
  "settlement_symbol": "WAX"
}
```

```javascript
// Transfer WAX tokens between accounts
{
  "resource": "Transfers",
  "operation": "Send WAX",
  "from": "senderaccount",
  "to": "receiveracct",
  "quantity": "50.00000000 WAX",
  "memo": "Payment for services"
}
```

```javascript
// Check account balance and resources
{
  "resource": "Accounts",
  "operation": "Get Account Info",
  "account_name": "waxaccount123",
  "include_resources": true,
  "include_permissions": false
}
```

## Error Handling

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid API Key | Authentication failed with provided credentials | Verify API key is correct and has necessary permissions |
| Insufficient Resources | Account lacks CPU/NET for transaction | Stake more WAX for resources or wait for regeneration |
| Asset Not Found | Requested NFT asset does not exist | Verify asset ID is correct and asset hasn't been burned |
| Account Not Found | WAX account name does not exist | Check account name spelling and existence on blockchain |
| Transaction Failed | Blockchain transaction was rejected | Review transaction parameters and account permissions |
| Rate Limit Exceeded | Too many API requests in short timeframe | Implement delays between requests or upgrade API plan |

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
- **WAX Developer Portal**: [developer.wax.io](https://developer.wax.io)
- **AtomicAssets Documentation**: [github.com/pinknetworkx/atomicassets-api](https://github.com/pinknetworkx/atomicassets-api)