// WAX/EOSIO Client Transport
// Author: Velocity BPA - https://velobpa.com

import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions } from 'n8n-workflow';
import { NETWORKS, getNetworkConfig } from '../constants/networks';

// Fetch polyfill for Node.js
const fetch = require('node-fetch');

export interface WaxCredentials {
	network: string;
	chainApiEndpoint?: string;
	hyperionEndpoint?: string;
	privateKey?: string;
	accountName?: string;
	permission?: string;
}

/**
 * Get WAX credentials from n8n context
 */
export async function getWaxCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions
): Promise<WaxCredentials> {
	const credentials = await context.getCredentials('waxNetwork');
	return {
		network: credentials.network as string,
		chainApiEndpoint: credentials.chainApiEndpoint as string,
		hyperionEndpoint: credentials.hyperionEndpoint as string,
		privateKey: credentials.privateKey as string,
		accountName: credentials.accountName as string,
		permission: (credentials.permission as string) || 'active',
	};
}

/**
 * Get the RPC endpoint based on network configuration
 */
export function getRpcEndpoint(credentials: WaxCredentials): string {
	if (credentials.network === 'custom' && credentials.chainApiEndpoint) {
		return credentials.chainApiEndpoint;
	}
	const config = getNetworkConfig(credentials.network);
	return config.chainApi;
}

/**
 * Get the Hyperion endpoint based on network configuration
 */
export function getHyperionEndpoint(credentials: WaxCredentials): string {
	if (credentials.network === 'custom' && credentials.hyperionEndpoint) {
		return credentials.hyperionEndpoint;
	}
	const config = getNetworkConfig(credentials.network);
	return config.hyperion;
}

/**
 * Create JsonRpc instance for read operations
 */
export function createRpc(credentials: WaxCredentials): JsonRpc {
	const endpoint = getRpcEndpoint(credentials);
	return new JsonRpc(endpoint, { fetch });
}

/**
 * Create API instance for signing and broadcasting transactions
 */
export function createApi(credentials: WaxCredentials): Api {
	const rpc = createRpc(credentials);
	const signatureProvider = credentials.privateKey
		? new JsSignatureProvider([credentials.privateKey])
		: new JsSignatureProvider([]);
	
	return new Api({
		rpc,
		signatureProvider,
		textDecoder: new TextDecoder(),
		textEncoder: new TextEncoder(),
	});
}

/**
 * Execute a read-only chain query
 */
export async function chainQuery(
	credentials: WaxCredentials,
	endpoint: string,
	body?: any
): Promise<any> {
	const baseUrl = getRpcEndpoint(credentials);
	const url = `${baseUrl}${endpoint}`;
	
	const response = await fetch(url, {
		method: body ? 'POST' : 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Chain API error: ${response.status} - ${errorText}`);
	}
	
	return response.json();
}

/**
 * Get chain info
 */
export async function getChainInfo(credentials: WaxCredentials): Promise<any> {
	const rpc = createRpc(credentials);
	return rpc.get_info();
}

/**
 * Get account info
 */
export async function getAccount(credentials: WaxCredentials, accountName: string): Promise<any> {
	const rpc = createRpc(credentials);
	return rpc.get_account(accountName);
}

/**
 * Get table rows from a smart contract
 */
export async function getTableRows(
	credentials: WaxCredentials,
	options: {
		code: string;
		scope: string;
		table: string;
		lower_bound?: string;
		upper_bound?: string;
		limit?: number;
		reverse?: boolean;
		index_position?: string;
		key_type?: string;
	}
): Promise<any> {
	const rpc = createRpc(credentials);
	return rpc.get_table_rows({
		json: true,
		code: options.code,
		scope: options.scope,
		table: options.table,
		lower_bound: options.lower_bound,
		upper_bound: options.upper_bound,
		limit: options.limit || 100,
		reverse: options.reverse || false,
		index_position: options.index_position,
		key_type: options.key_type,
	});
}

/**
 * Get currency balance
 */
export async function getCurrencyBalance(
	credentials: WaxCredentials,
	account: string,
	contract: string = 'eosio.token',
	symbol: string = 'WAX'
): Promise<string[]> {
	const rpc = createRpc(credentials);
	return rpc.get_currency_balance(contract, account, symbol);
}

/**
 * Execute a transaction
 */
export async function executeTransaction(
	credentials: WaxCredentials,
	actions: any[],
	options?: {
		broadcast?: boolean;
		sign?: boolean;
		expireSeconds?: number;
	}
): Promise<any> {
	const api = createApi(credentials);
	
	return api.transact(
		{ actions },
		{
			broadcast: options?.broadcast !== false,
			sign: options?.sign !== false,
			blocksBehind: 3,
			expireSeconds: options?.expireSeconds || 120,
		}
	);
}

/**
 * Sign transaction without broadcasting
 */
export async function signTransaction(
	credentials: WaxCredentials,
	transaction: any
): Promise<any> {
	const api = createApi(credentials);
	return api.transact(transaction, {
		broadcast: false,
		sign: true,
		blocksBehind: 3,
		expireSeconds: 120,
	});
}

/**
 * Push a signed transaction
 */
export async function pushTransaction(
	credentials: WaxCredentials,
	signedTransaction: any
): Promise<any> {
	const rpc = createRpc(credentials);
	return rpc.push_transaction(signedTransaction);
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
	credentials: WaxCredentials,
	transactionId: string
): Promise<any> {
	// Use Hyperion for transaction lookup
	const hyperionUrl = getHyperionEndpoint(credentials);
	const url = `${hyperionUrl}/v2/history/get_transaction?id=${transactionId}`;
	
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to get transaction: ${response.status}`);
	}
	
	return response.json();
}

/**
 * Get ABI for a contract
 */
export async function getAbi(credentials: WaxCredentials, accountName: string): Promise<any> {
	const rpc = createRpc(credentials);
	return rpc.get_abi(accountName);
}

/**
 * Get block by number or ID
 */
export async function getBlock(
	credentials: WaxCredentials,
	blockNumOrId: string | number
): Promise<any> {
	const rpc = createRpc(credentials);
	return rpc.get_block(blockNumOrId);
}

/**
 * Serialize actions to binary
 */
export async function serializeActions(credentials: WaxCredentials, actions: any[]): Promise<any[]> {
	const api = createApi(credentials);
	return api.serializeActions(actions);
}

/**
 * Deserialize action data
 */
export async function deserializeActionData(
	credentials: WaxCredentials,
	contract: string,
	action: string,
	data: string
): Promise<any> {
	const api = createApi(credentials);
	const contractAbi = await api.getContract(contract);
	const type = contractAbi.actions.get(action);
	
	if (!type) {
		throw new Error(`Unknown action: ${action}`);
	}
	
	const buffer = Buffer.from(data, 'hex');
	return api.deserialize(buffer as any, type as any);
}
