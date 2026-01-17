// AtomicAssets API Client Transport
// Author: Velocity BPA - https://velobpa.com

import { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions } from 'n8n-workflow';
import { NETWORKS, getNetworkConfig } from '../constants/networks';
import { buildQueryString } from '../constants/endpoints';

const fetch = require('node-fetch');

export interface AtomicCredentials {
	network: string;
	atomicAssetsEndpoint?: string;
	atomicMarketEndpoint?: string;
	apiKey?: string;
}

/**
 * Get AtomicAssets credentials from n8n context
 */
export async function getAtomicCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions
): Promise<AtomicCredentials> {
	const credentials = await context.getCredentials('atomicAssets');
	return {
		network: credentials.network as string,
		atomicAssetsEndpoint: credentials.atomicAssetsEndpoint as string,
		atomicMarketEndpoint: credentials.atomicMarketEndpoint as string,
		apiKey: credentials.apiKey as string,
	};
}

/**
 * Get AtomicAssets API endpoint
 */
export function getAtomicAssetsEndpoint(credentials: AtomicCredentials): string {
	if (credentials.network === 'custom' && credentials.atomicAssetsEndpoint) {
		return credentials.atomicAssetsEndpoint;
	}
	const config = getNetworkConfig(credentials.network);
	return config.atomicAssets;
}

/**
 * Get AtomicMarket API endpoint
 */
export function getAtomicMarketEndpoint(credentials: AtomicCredentials): string {
	if (credentials.network === 'custom' && credentials.atomicMarketEndpoint) {
		return credentials.atomicMarketEndpoint;
	}
	const config = getNetworkConfig(credentials.network);
	return config.atomicMarket;
}

/**
 * Make API request to AtomicAssets
 */
export async function atomicAssetsRequest(
	credentials: AtomicCredentials,
	endpoint: string,
	params?: Record<string, string | number | boolean | undefined>
): Promise<any> {
	const baseUrl = getAtomicAssetsEndpoint(credentials);
	const queryString = params ? buildQueryString(params) : '';
	const url = `${baseUrl}${endpoint}${queryString}`;
	
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	
	if (credentials.apiKey) {
		headers['X-API-Key'] = credentials.apiKey;
	}
	
	const response = await fetch(url, {
		method: 'GET',
		headers,
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`AtomicAssets API error: ${response.status} - ${errorText}`);
	}
	
	return response.json();
}

/**
 * Make API request to AtomicMarket
 */
export async function atomicMarketRequest(
	credentials: AtomicCredentials,
	endpoint: string,
	params?: Record<string, string | number | boolean | undefined>
): Promise<any> {
	const baseUrl = getAtomicMarketEndpoint(credentials);
	const queryString = params ? buildQueryString(params) : '';
	const url = `${baseUrl}${endpoint}${queryString}`;
	
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	
	if (credentials.apiKey) {
		headers['X-API-Key'] = credentials.apiKey;
	}
	
	const response = await fetch(url, {
		method: 'GET',
		headers,
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`AtomicMarket API error: ${response.status} - ${errorText}`);
	}
	
	return response.json();
}

// ==================== ASSETS ====================

/**
 * Get assets with filters
 */
export async function getAssets(
	credentials: AtomicCredentials,
	params?: {
		owner?: string;
		collection_name?: string;
		schema_name?: string;
		template_id?: number;
		burned?: boolean;
		match?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicAssetsRequest(credentials, '/atomicassets/v1/assets', params);
}

/**
 * Get single asset by ID
 */
export async function getAsset(credentials: AtomicCredentials, assetId: string): Promise<any> {
	return atomicAssetsRequest(credentials, `/atomicassets/v1/assets/${assetId}`);
}

/**
 * Get asset logs/history
 */
export async function getAssetLogs(
	credentials: AtomicCredentials,
	assetId: string,
	params?: { limit?: number; page?: number }
): Promise<any> {
	return atomicAssetsRequest(credentials, `/atomicassets/v1/assets/${assetId}/logs`, params);
}

// ==================== COLLECTIONS ====================

/**
 * Get collections with filters
 */
export async function getCollections(
	credentials: AtomicCredentials,
	params?: {
		author?: string;
		match?: string;
		authorized_account?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicAssetsRequest(credentials, '/atomicassets/v1/collections', params);
}

/**
 * Get single collection
 */
export async function getCollection(
	credentials: AtomicCredentials,
	collectionName: string
): Promise<any> {
	return atomicAssetsRequest(credentials, `/atomicassets/v1/collections/${collectionName}`);
}

/**
 * Get collection stats
 */
export async function getCollectionStats(
	credentials: AtomicCredentials,
	collectionName: string
): Promise<any> {
	return atomicAssetsRequest(credentials, `/atomicassets/v1/collections/${collectionName}/stats`);
}

// ==================== SCHEMAS ====================

/**
 * Get schemas
 */
export async function getSchemas(
	credentials: AtomicCredentials,
	params?: {
		collection_name?: string;
		authorized_account?: string;
		match?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicAssetsRequest(credentials, '/atomicassets/v1/schemas', params);
}

/**
 * Get single schema
 */
export async function getSchema(
	credentials: AtomicCredentials,
	collectionName: string,
	schemaName: string
): Promise<any> {
	return atomicAssetsRequest(
		credentials,
		`/atomicassets/v1/schemas/${collectionName}/${schemaName}`
	);
}

// ==================== TEMPLATES ====================

/**
 * Get templates
 */
export async function getTemplates(
	credentials: AtomicCredentials,
	params?: {
		collection_name?: string;
		schema_name?: string;
		authorized_account?: string;
		issued_supply?: number;
		has_assets?: boolean;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicAssetsRequest(credentials, '/atomicassets/v1/templates', params);
}

/**
 * Get single template
 */
export async function getTemplate(
	credentials: AtomicCredentials,
	collectionName: string,
	templateId: string
): Promise<any> {
	return atomicAssetsRequest(
		credentials,
		`/atomicassets/v1/templates/${collectionName}/${templateId}`
	);
}

/**
 * Get template stats
 */
export async function getTemplateStats(
	credentials: AtomicCredentials,
	collectionName: string,
	templateId: string
): Promise<any> {
	return atomicAssetsRequest(
		credentials,
		`/atomicassets/v1/templates/${collectionName}/${templateId}/stats`
	);
}

// ==================== TRANSFERS ====================

/**
 * Get transfers
 */
export async function getTransfers(
	credentials: AtomicCredentials,
	params?: {
		account?: string;
		sender?: string;
		recipient?: string;
		asset_id?: string;
		collection_name?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicAssetsRequest(credentials, '/atomicassets/v1/transfers', params);
}

// ==================== SALES ====================

/**
 * Get sales
 */
export async function getSales(
	credentials: AtomicCredentials,
	params?: {
		state?: string;
		seller?: string;
		buyer?: string;
		asset_id?: string;
		collection_name?: string;
		schema_name?: string;
		template_id?: number;
		min_price?: number;
		max_price?: number;
		symbol?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/sales', params);
}

/**
 * Get single sale
 */
export async function getSale(credentials: AtomicCredentials, saleId: string): Promise<any> {
	return atomicMarketRequest(credentials, `/atomicmarket/v1/sales/${saleId}`);
}

/**
 * Get sale logs
 */
export async function getSaleLogs(
	credentials: AtomicCredentials,
	saleId: string,
	params?: { limit?: number; page?: number }
): Promise<any> {
	return atomicMarketRequest(credentials, `/atomicmarket/v1/sales/${saleId}/logs`, params);
}

// ==================== AUCTIONS ====================

/**
 * Get auctions
 */
export async function getAuctions(
	credentials: AtomicCredentials,
	params?: {
		state?: string;
		seller?: string;
		buyer?: string;
		participant?: string;
		asset_id?: string;
		collection_name?: string;
		schema_name?: string;
		template_id?: number;
		min_price?: number;
		max_price?: number;
		symbol?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/auctions', params);
}

/**
 * Get single auction
 */
export async function getAuction(credentials: AtomicCredentials, auctionId: string): Promise<any> {
	return atomicMarketRequest(credentials, `/atomicmarket/v1/auctions/${auctionId}`);
}

// ==================== BUYOFFERS ====================

/**
 * Get buyoffers
 */
export async function getBuyoffers(
	credentials: AtomicCredentials,
	params?: {
		state?: string;
		buyer?: string;
		seller?: string;
		asset_id?: string;
		collection_name?: string;
		order?: string;
		sort?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/buyoffers', params);
}

/**
 * Get single buyoffer
 */
export async function getBuyoffer(credentials: AtomicCredentials, buyofferId: string): Promise<any> {
	return atomicMarketRequest(credentials, `/atomicmarket/v1/buyoffers/${buyofferId}`);
}

// ==================== PRICES ====================

/**
 * Get asset prices
 */
export async function getAssetPrices(
	credentials: AtomicCredentials,
	params?: {
		collection_name?: string;
		schema_name?: string;
		template_id?: number;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/prices/assets', params);
}

/**
 * Get template prices
 */
export async function getTemplatePrices(
	credentials: AtomicCredentials,
	params?: {
		collection_name?: string;
		schema_name?: string;
		template_id?: number;
		symbol?: string;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/prices/templates', params);
}

/**
 * Get suggested price for an asset
 */
export async function getSuggestedPrice(
	credentials: AtomicCredentials,
	collectionName: string,
	templateId: string
): Promise<any> {
	const prices = await getTemplatePrices(credentials, {
		collection_name: collectionName,
		template_id: parseInt(templateId),
	});
	return prices;
}

// ==================== STATS ====================

/**
 * Get market stats
 */
export async function getMarketStats(
	credentials: AtomicCredentials,
	params?: {
		collection_name?: string;
		symbol?: string;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/stats', params);
}

/**
 * Get collection market stats
 */
export async function getCollectionMarketStats(
	credentials: AtomicCredentials,
	params?: {
		symbol?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/stats/collections', params);
}

// ==================== CONFIG ====================

/**
 * Get AtomicAssets config
 */
export async function getAtomicAssetsConfig(credentials: AtomicCredentials): Promise<any> {
	return atomicAssetsRequest(credentials, '/atomicassets/v1/config');
}

/**
 * Get AtomicMarket config
 */
export async function getAtomicMarketConfig(credentials: AtomicCredentials): Promise<any> {
	return atomicMarketRequest(credentials, '/atomicmarket/v1/config');
}

// ==================== ACCOUNTS ====================

/**
 * Get account NFT holdings
 */
export async function getAccountAssets(
	credentials: AtomicCredentials,
	account: string,
	params?: {
		collection_name?: string;
		limit?: number;
		page?: number;
	}
): Promise<any> {
	return atomicAssetsRequest(credentials, `/atomicassets/v1/accounts/${account}`, params);
}

/**
 * Get account collection stats
 */
export async function getAccountCollectionStats(
	credentials: AtomicCredentials,
	account: string,
	collectionName: string
): Promise<any> {
	return atomicAssetsRequest(
		credentials,
		`/atomicassets/v1/accounts/${account}/${collectionName}`
	);
}
