// WAX Asset/NFT Utilities
// Author: Velocity BPA - https://velobpa.com

/**
 * WAXP has 8 decimal places
 */
export const WAXP_PRECISION = 8;
export const WAXP_SYMBOL = 'WAX';

/**
 * Parse WAX token amount from string (e.g., "10.00000000 WAX")
 */
export function parseWaxAmount(amountStr: string): number {
	if (!amountStr) return 0;
	const parts = amountStr.split(' ');
	return parseFloat(parts[0]) || 0;
}

/**
 * Format number to WAX token string
 */
export function formatWaxAmount(amount: number, symbol: string = WAXP_SYMBOL): string {
	return `${amount.toFixed(WAXP_PRECISION)} ${symbol}`;
}

/**
 * Convert WAX to smallest unit (satoshi-like)
 */
export function toSmallestUnit(amount: number): number {
	return Math.round(amount * Math.pow(10, WAXP_PRECISION));
}

/**
 * Convert from smallest unit to WAX
 */
export function fromSmallestUnit(amount: number): number {
	return amount / Math.pow(10, WAXP_PRECISION);
}

/**
 * Validate AtomicAssets asset ID
 * Asset IDs are large integers (uint64)
 */
export function isValidAssetId(assetId: string | number): boolean {
	if (!assetId) return false;
	const id = String(assetId);
	// Asset ID should be a positive integer
	return /^\d+$/.test(id) && BigInt(id) > 0;
}

/**
 * Validate template ID
 */
export function isValidTemplateId(templateId: string | number): boolean {
	if (!templateId) return false;
	if (templateId === '-1') return true; // -1 is valid for no template
	const id = String(templateId);
	return /^-?\d+$/.test(id);
}

/**
 * Validate collection name
 * Collections follow similar rules to account names
 */
export function isValidCollectionName(name: string): boolean {
	if (!name || typeof name !== 'string') return false;
	if (name.length > 12 || name.length === 0) return false;
	const validPattern = /^[a-z1-5.]{1,12}$/;
	if (!validPattern.test(name)) return false;
	if (name.startsWith('.') || name.endsWith('.')) return false;
	if (name.includes('..')) return false;
	return true;
}

/**
 * Validate schema name
 */
export function isValidSchemaName(name: string): boolean {
	if (!name || typeof name !== 'string') return false;
	if (name.length > 12 || name.length === 0) return false;
	const validPattern = /^[a-z1-5.]{1,12}$/;
	return validPattern.test(name);
}

/**
 * Parse AtomicAssets asset data
 */
export interface ParsedAsset {
	assetId: string;
	collection: string;
	schema: string;
	templateId: string;
	owner: string;
	name: string;
	data: Record<string, any>;
	mintedAt: Date | null;
	burnedAt: Date | null;
	isBurned: boolean;
	isTransferable: boolean;
	isBurnable: boolean;
	backedTokens: string[];
}

export function parseAsset(assetData: any): ParsedAsset {
	return {
		assetId: assetData.asset_id || '',
		collection: assetData.collection?.collection_name || assetData.collection_name || '',
		schema: assetData.schema?.schema_name || assetData.schema_name || '',
		templateId: assetData.template?.template_id || assetData.template_id || '-1',
		owner: assetData.owner || '',
		name: assetData.name || assetData.data?.name || 'Unnamed Asset',
		data: {
			...(assetData.immutable_data || {}),
			...(assetData.mutable_data || {}),
			...(assetData.data || {}),
		},
		mintedAt: assetData.minted_at_time ? new Date(parseInt(assetData.minted_at_time)) : null,
		burnedAt: assetData.burned_at_time ? new Date(parseInt(assetData.burned_at_time)) : null,
		isBurned: !!assetData.burned_at_time,
		isTransferable: assetData.is_transferable !== false,
		isBurnable: assetData.is_burnable !== false,
		backedTokens: assetData.backed_tokens || [],
	};
}

/**
 * Parse collection data
 */
export interface ParsedCollection {
	name: string;
	author: string;
	allowNotify: boolean;
	authorizedAccounts: string[];
	notifyAccounts: string[];
	marketFee: number;
	data: Record<string, any>;
	createdAt: Date | null;
}

export function parseCollection(collectionData: any): ParsedCollection {
	return {
		name: collectionData.collection_name || '',
		author: collectionData.author || '',
		allowNotify: collectionData.allow_notify || false,
		authorizedAccounts: collectionData.authorized_accounts || [],
		notifyAccounts: collectionData.notify_accounts || [],
		marketFee: parseFloat(collectionData.market_fee || '0'),
		data: collectionData.data || {},
		createdAt: collectionData.created_at_time ? new Date(parseInt(collectionData.created_at_time)) : null,
	};
}

/**
 * Parse template data
 */
export interface ParsedTemplate {
	templateId: string;
	collection: string;
	schema: string;
	isTransferable: boolean;
	isBurnable: boolean;
	maxSupply: number;
	issuedSupply: number;
	immutableData: Record<string, any>;
	createdAt: Date | null;
}

export function parseTemplate(templateData: any): ParsedTemplate {
	return {
		templateId: templateData.template_id || '',
		collection: templateData.collection?.collection_name || templateData.collection_name || '',
		schema: templateData.schema?.schema_name || templateData.schema_name || '',
		isTransferable: templateData.is_transferable !== false,
		isBurnable: templateData.is_burnable !== false,
		maxSupply: parseInt(templateData.max_supply || '0'),
		issuedSupply: parseInt(templateData.issued_supply || '0'),
		immutableData: templateData.immutable_data || {},
		createdAt: templateData.created_at_time ? new Date(parseInt(templateData.created_at_time)) : null,
	};
}

/**
 * Parse sale data
 */
export interface ParsedSale {
	saleId: string;
	seller: string;
	buyer: string | null;
	assets: ParsedAsset[];
	price: {
		amount: string;
		tokenSymbol: string;
		tokenContract: string;
	};
	state: number;
	stateStr: string;
	createdAt: Date | null;
	updatedAt: Date | null;
}

export function parseSale(saleData: any): ParsedSale {
	const stateMap: Record<number, string> = {
		0: 'waiting',
		1: 'listed',
		2: 'canceled',
		3: 'sold',
		4: 'invalid',
	};
	
	return {
		saleId: saleData.sale_id || '',
		seller: saleData.seller || '',
		buyer: saleData.buyer || null,
		assets: (saleData.assets || []).map(parseAsset),
		price: {
			amount: saleData.price?.amount || '0',
			tokenSymbol: saleData.price?.token_symbol || 'WAX',
			tokenContract: saleData.price?.token_contract || 'eosio.token',
		},
		state: saleData.state || 0,
		stateStr: stateMap[saleData.state] || 'unknown',
		createdAt: saleData.created_at_time ? new Date(parseInt(saleData.created_at_time)) : null,
		updatedAt: saleData.updated_at_time ? new Date(parseInt(saleData.updated_at_time)) : null,
	};
}

/**
 * Format price for display
 */
export function formatPrice(amount: string, symbol: string = 'WAX', decimals: number = 8): string {
	const value = parseFloat(amount) / Math.pow(10, decimals);
	return `${value.toFixed(decimals)} ${symbol}`;
}

/**
 * Get IPFS URL from hash
 */
export function getIpfsUrl(hash: string, gateway: string = 'https://ipfs.io/ipfs/'): string {
	if (!hash) return '';
	if (hash.startsWith('http')) return hash;
	if (hash.startsWith('ipfs://')) {
		return gateway + hash.replace('ipfs://', '');
	}
	return gateway + hash;
}
