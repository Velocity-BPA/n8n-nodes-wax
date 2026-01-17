// WAX Serialization Utilities
// Author: Velocity BPA - https://velobpa.com

import { Api, Serialize } from 'eosjs';

/**
 * Serialize action data to binary
 */
export async function serializeActionData(
	api: Api,
	account: string,
	name: string,
	data: any
): Promise<string> {
	const contract = await api.getContract(account);
	const action = (Serialize as any).serializeAction(
		contract,
		account,
		name,
		data,
		api.textEncoder,
		api.textDecoder
	);
	return action.data as string;
}

/**
 * Deserialize binary action data
 */
export async function deserializeActionData(
	api: Api,
	account: string,
	name: string,
	data: string
): Promise<any> {
	const contract = await api.getContract(account);
	return (Serialize as any).deserializeAction(
		contract,
		account,
		name,
		data,
		api.textEncoder,
		api.textDecoder
	);
}

/**
 * Build transaction object
 */
export interface TransactionAction {
	account: string;
	name: string;
	authorization: Array<{
		actor: string;
		permission: string;
	}>;
	data: any;
}

export interface TransactionConfig {
	actions: TransactionAction[];
	expireSeconds?: number;
}

export async function buildTransaction(
	api: Api,
	config: TransactionConfig
): Promise<any> {
	const info = await api.rpc.get_info();
	const refBlockNumber = info.head_block_num - 3;
	const refBlock = await api.rpc.get_block(refBlockNumber);
	
	const expireSeconds = config.expireSeconds || 120;
	const expiration = new Date(Date.now() + expireSeconds * 1000).toISOString().slice(0, -1);
	
	return {
		expiration,
		ref_block_num: refBlock.block_num & 0xffff,
		ref_block_prefix: refBlock.ref_block_prefix,
		max_net_usage_words: 0,
		max_cpu_usage_ms: 0,
		delay_sec: 0,
		context_free_actions: [],
		actions: config.actions,
		transaction_extensions: [],
	};
}

/**
 * Create transfer action for WAXP
 */
export function createWaxTransferAction(
	from: string,
	to: string,
	quantity: string,
	memo: string = ''
): TransactionAction {
	return {
		account: 'eosio.token',
		name: 'transfer',
		authorization: [{
			actor: from,
			permission: 'active',
		}],
		data: {
			from,
			to,
			quantity,
			memo,
		},
	};
}

/**
 * Create NFT transfer action
 */
export function createNftTransferAction(
	from: string,
	to: string,
	assetIds: string[],
	memo: string = ''
): TransactionAction {
	return {
		account: 'atomicassets',
		name: 'transfer',
		authorization: [{
			actor: from,
			permission: 'active',
		}],
		data: {
			from,
			to,
			asset_ids: assetIds,
			memo,
		},
	};
}

/**
 * Create buy RAM action
 */
export function createBuyRamAction(
	payer: string,
	receiver: string,
	quantity: string
): TransactionAction {
	return {
		account: 'eosio',
		name: 'buyram',
		authorization: [{
			actor: payer,
			permission: 'active',
		}],
		data: {
			payer,
			receiver,
			quant: quantity,
		},
	};
}

/**
 * Create sell RAM action
 */
export function createSellRamAction(
	account: string,
	bytes: number
): TransactionAction {
	return {
		account: 'eosio',
		name: 'sellram',
		authorization: [{
			actor: account,
			permission: 'active',
		}],
		data: {
			account,
			bytes,
		},
	};
}

/**
 * Create stake action (delegatebw)
 */
export function createStakeAction(
	from: string,
	receiver: string,
	cpuQuantity: string,
	netQuantity: string,
	transfer: boolean = false
): TransactionAction {
	return {
		account: 'eosio',
		name: 'delegatebw',
		authorization: [{
			actor: from,
			permission: 'active',
		}],
		data: {
			from,
			receiver,
			stake_net_quantity: netQuantity,
			stake_cpu_quantity: cpuQuantity,
			transfer,
		},
	};
}

/**
 * Create unstake action (undelegatebw)
 */
export function createUnstakeAction(
	from: string,
	receiver: string,
	cpuQuantity: string,
	netQuantity: string
): TransactionAction {
	return {
		account: 'eosio',
		name: 'undelegatebw',
		authorization: [{
			actor: from,
			permission: 'active',
		}],
		data: {
			from,
			receiver,
			unstake_net_quantity: netQuantity,
			unstake_cpu_quantity: cpuQuantity,
		},
	};
}

/**
 * Create mint asset action
 */
export function createMintAction(
	authorizedMinter: string,
	collection: string,
	schema: string,
	templateId: number,
	newAssetOwner: string,
	immutableData: any[],
	mutableData: any[],
	tokensToBack: string[]
): TransactionAction {
	return {
		account: 'atomicassets',
		name: 'mintasset',
		authorization: [{
			actor: authorizedMinter,
			permission: 'active',
		}],
		data: {
			authorized_minter: authorizedMinter,
			collection_name: collection,
			schema_name: schema,
			template_id: templateId,
			new_asset_owner: newAssetOwner,
			immutable_data: immutableData,
			mutable_data: mutableData,
			tokens_to_back: tokensToBack,
		},
	};
}

/**
 * Create announce sale action
 */
export function createAnnounceSaleAction(
	seller: string,
	assetIds: string[],
	listingPrice: string,
	settlementSymbol: string,
	makerMarketplace: string = ''
): TransactionAction {
	return {
		account: 'atomicmarket',
		name: 'announcesale',
		authorization: [{
			actor: seller,
			permission: 'active',
		}],
		data: {
			seller,
			asset_ids: assetIds,
			listing_price: listingPrice,
			settlement_symbol: settlementSymbol,
			maker_marketplace: makerMarketplace,
		},
	};
}

/**
 * Parse transaction result
 */
export interface TransactionResult {
	transactionId: string;
	blockNum: number;
	blockTime: string;
	processed: any;
	success: boolean;
}

export function parseTransactionResult(result: any): TransactionResult {
	return {
		transactionId: result.transaction_id || result.id || '',
		blockNum: result.processed?.block_num || 0,
		blockTime: result.processed?.block_time || '',
		processed: result.processed || {},
		success: !!(result.transaction_id || result.id),
	};
}
