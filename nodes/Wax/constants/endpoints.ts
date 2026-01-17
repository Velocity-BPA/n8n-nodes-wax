// WAX API Endpoints Constants
// Author: Velocity BPA - https://velobpa.com

// Chain API Endpoints (EOSIO standard)
export const CHAIN_ENDPOINTS = {
	getInfo: '/v1/chain/get_info',
	getBlock: '/v1/chain/get_block',
	getBlockInfo: '/v1/chain/get_block_info',
	getAccount: '/v1/chain/get_account',
	getAbi: '/v1/chain/get_abi',
	getRawAbi: '/v1/chain/get_raw_abi',
	getCode: '/v1/chain/get_code',
	getTableRows: '/v1/chain/get_table_rows',
	getTableByScope: '/v1/chain/get_table_by_scope',
	getCurrencyBalance: '/v1/chain/get_currency_balance',
	getCurrencyStats: '/v1/chain/get_currency_stats',
	getProducers: '/v1/chain/get_producers',
	pushTransaction: '/v1/chain/push_transaction',
	sendTransaction: '/v1/chain/send_transaction',
	abiJsonToBin: '/v1/chain/abi_json_to_bin',
	abiBinToJson: '/v1/chain/abi_bin_to_json',
	getRequiredKeys: '/v1/chain/get_required_keys',
};

// Hyperion History API Endpoints
export const HYPERION_ENDPOINTS = {
	health: '/v2/health',
	getActions: '/v2/history/get_actions',
	getTransaction: '/v2/history/get_transaction',
	getDeltas: '/v2/history/get_deltas',
	getCreator: '/v2/history/get_creator',
	getKeyAccounts: '/v2/state/get_key_accounts',
	getTokens: '/v2/state/get_tokens',
	getAccountDeltas: '/v2/state/get_account_deltas',
	getVoters: '/v2/state/get_voters',
	getProposals: '/v2/state/get_proposals',
	getLinks: '/v2/state/get_links',
};

// AtomicAssets API Endpoints
export const ATOMIC_ASSETS_ENDPOINTS = {
	// Assets
	getAssets: '/atomicassets/v1/assets',
	getAssetById: '/atomicassets/v1/assets/{asset_id}',
	getAssetStats: '/atomicassets/v1/assets/{asset_id}/stats',
	getAssetLogs: '/atomicassets/v1/assets/{asset_id}/logs',
	
	// Collections
	getCollections: '/atomicassets/v1/collections',
	getCollectionById: '/atomicassets/v1/collections/{collection_name}',
	getCollectionStats: '/atomicassets/v1/collections/{collection_name}/stats',
	getCollectionLogs: '/atomicassets/v1/collections/{collection_name}/logs',
	
	// Schemas
	getSchemas: '/atomicassets/v1/schemas',
	getSchemaById: '/atomicassets/v1/schemas/{collection_name}/{schema_name}',
	getSchemaStats: '/atomicassets/v1/schemas/{collection_name}/{schema_name}/stats',
	getSchemaLogs: '/atomicassets/v1/schemas/{collection_name}/{schema_name}/logs',
	
	// Templates
	getTemplates: '/atomicassets/v1/templates',
	getTemplateById: '/atomicassets/v1/templates/{collection_name}/{template_id}',
	getTemplateStats: '/atomicassets/v1/templates/{collection_name}/{template_id}/stats',
	getTemplateLogs: '/atomicassets/v1/templates/{collection_name}/{template_id}/logs',
	
	// Offers
	getOffers: '/atomicassets/v1/offers',
	getOfferById: '/atomicassets/v1/offers/{offer_id}',
	getOfferLogs: '/atomicassets/v1/offers/{offer_id}/logs',
	
	// Transfers
	getTransfers: '/atomicassets/v1/transfers',
	
	// Accounts
	getAccounts: '/atomicassets/v1/accounts',
	getAccountById: '/atomicassets/v1/accounts/{account}',
	getAccountCollection: '/atomicassets/v1/accounts/{account}/{collection_name}',
	
	// Burns
	getBurns: '/atomicassets/v1/burns',
	
	// Config
	getConfig: '/atomicassets/v1/config',
};

// AtomicMarket API Endpoints
export const ATOMIC_MARKET_ENDPOINTS = {
	// Sales
	getSales: '/atomicmarket/v1/sales',
	getSaleById: '/atomicmarket/v1/sales/{sale_id}',
	getSaleLogs: '/atomicmarket/v1/sales/{sale_id}/logs',
	getSalesTemplates: '/atomicmarket/v1/sales/templates',
	
	// Auctions
	getAuctions: '/atomicmarket/v1/auctions',
	getAuctionById: '/atomicmarket/v1/auctions/{auction_id}',
	getAuctionLogs: '/atomicmarket/v1/auctions/{auction_id}/logs',
	
	// Buyoffers
	getBuyoffers: '/atomicmarket/v1/buyoffers',
	getBuyofferById: '/atomicmarket/v1/buyoffers/{buyoffer_id}',
	getBuyofferLogs: '/atomicmarket/v1/buyoffers/{buyoffer_id}/logs',
	
	// Marketplaces
	getMarketplaces: '/atomicmarket/v1/marketplaces',
	getMarketplaceById: '/atomicmarket/v1/marketplaces/{marketplace_name}',
	
	// Prices
	getPrices: '/atomicmarket/v1/prices',
	getAssetPrices: '/atomicmarket/v1/prices/assets',
	getTemplatePrices: '/atomicmarket/v1/prices/templates',
	getPriceDays: '/atomicmarket/v1/prices/days',
	getSalesPrices: '/atomicmarket/v1/prices/sales',
	
	// Stats
	getStats: '/atomicmarket/v1/stats',
	getStatsCollections: '/atomicmarket/v1/stats/collections',
	getStatsAccounts: '/atomicmarket/v1/stats/accounts',
	getStatsSchemas: '/atomicmarket/v1/stats/schemas',
	getStatsGraph: '/atomicmarket/v1/stats/graph',
	getStatsSales: '/atomicmarket/v1/stats/sales',
	
	// Config
	getConfig: '/atomicmarket/v1/config',
};

// AtomicTools API Endpoints (Drops, Packs, Blends)
export const ATOMIC_TOOLS_ENDPOINTS = {
	// Drops (atomicdropsx)
	getDrops: '/atomictools/v1/drops',
	getDropById: '/atomictools/v1/drops/{drop_id}',
	
	// Packs
	getPacks: '/atomictools/v1/packs',
	getPackById: '/atomictools/v1/packs/{pack_id}',
	
	// Blends (NeftyBlocks)
	getBlends: '/atomictools/v1/blends',
	getBlendById: '/atomictools/v1/blends/{blend_id}',
	
	// Links
	getLinks: '/atomictools/v1/links',
	getLinkById: '/atomictools/v1/links/{link_id}',
};

// Build URL with parameters
export function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, string>): string {
	let url = endpoint;
	
	// Replace path parameters
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			url = url.replace(`{${key}}`, encodeURIComponent(value));
		}
	}
	
	return `${baseUrl}${url}`;
}

// Build query string
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
	const filtered = Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== '')
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
	
	return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}
