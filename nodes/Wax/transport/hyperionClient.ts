// Hyperion History API Client
// Author: Velocity BPA - https://velobpa.com

import { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions } from 'n8n-workflow';
import { WaxCredentials, getHyperionEndpoint } from './eosClient';
import { buildQueryString } from '../constants/endpoints';

const fetch = require('node-fetch');

/**
 * Make request to Hyperion API
 */
export async function hyperionRequest(
	credentials: WaxCredentials,
	endpoint: string,
	params?: Record<string, string | number | boolean | undefined>
): Promise<any> {
	const baseUrl = getHyperionEndpoint(credentials);
	const queryString = params ? buildQueryString(params) : '';
	const url = `${baseUrl}${endpoint}${queryString}`;
	
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Hyperion API error: ${response.status} - ${errorText}`);
	}
	
	return response.json();
}

// ==================== HEALTH ====================

/**
 * Get Hyperion health status
 */
export async function getHealth(credentials: WaxCredentials): Promise<any> {
	return hyperionRequest(credentials, '/v2/health');
}

// ==================== HISTORY ====================

/**
 * Get actions from history
 */
export async function getActions(
	credentials: WaxCredentials,
	params?: {
		account?: string;
		filter?: string;
		skip?: number;
		limit?: number;
		sort?: string;
		after?: string;
		before?: string;
		track?: string;
		transfer_to?: string;
		transfer_from?: string;
		transfer_symbol?: string;
		act_name?: string;
		act_account?: string;
	}
): Promise<any> {
	return hyperionRequest(credentials, '/v2/history/get_actions', params);
}

/**
 * Get transaction by ID
 */
export async function getTransaction(
	credentials: WaxCredentials,
	transactionId: string
): Promise<any> {
	return hyperionRequest(credentials, '/v2/history/get_transaction', {
		id: transactionId,
	});
}

/**
 * Get deltas (state changes)
 */
export async function getDeltas(
	credentials: WaxCredentials,
	params?: {
		code?: string;
		scope?: string;
		table?: string;
		payer?: string;
		limit?: number;
		skip?: number;
		after?: string;
		before?: string;
	}
): Promise<any> {
	return hyperionRequest(credentials, '/v2/history/get_deltas', params);
}

/**
 * Get account creator info
 */
export async function getCreator(credentials: WaxCredentials, account: string): Promise<any> {
	return hyperionRequest(credentials, '/v2/history/get_creator', { account });
}

// ==================== STATE ====================

/**
 * Get accounts by public key
 */
export async function getKeyAccounts(credentials: WaxCredentials, publicKey: string): Promise<any> {
	return hyperionRequest(credentials, '/v2/state/get_key_accounts', {
		public_key: publicKey,
	});
}

/**
 * Get token balances for account
 */
export async function getTokens(credentials: WaxCredentials, account: string): Promise<any> {
	return hyperionRequest(credentials, '/v2/state/get_tokens', { account });
}

/**
 * Get account state deltas
 */
export async function getAccountDeltas(
	credentials: WaxCredentials,
	params: {
		account: string;
		code?: string;
		table?: string;
		limit?: number;
		skip?: number;
	}
): Promise<any> {
	return hyperionRequest(credentials, '/v2/state/get_account_deltas', params);
}

/**
 * Get voters info
 */
export async function getVoters(
	credentials: WaxCredentials,
	params?: {
		producer?: string;
		proxy?: string;
		limit?: number;
		skip?: number;
	}
): Promise<any> {
	return hyperionRequest(credentials, '/v2/state/get_voters', params);
}

/**
 * Get proposal info
 */
export async function getProposals(
	credentials: WaxCredentials,
	params?: {
		proposer?: string;
		proposal?: string;
		account?: string;
		requested?: string;
		provided?: string;
		executed?: boolean;
		limit?: number;
		skip?: number;
	}
): Promise<any> {
	return hyperionRequest(credentials, '/v2/state/get_proposals', params);
}

/**
 * Get links (permission links)
 */
export async function getLinks(
	credentials: WaxCredentials,
	params?: {
		account?: string;
		code?: string;
		action?: string;
		permission?: string;
	}
): Promise<any> {
	return hyperionRequest(credentials, '/v2/state/get_links', params);
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get account's recent transactions
 */
export async function getAccountTransactions(
	credentials: WaxCredentials,
	account: string,
	limit: number = 50
): Promise<any> {
	return getActions(credentials, {
		account,
		limit,
		sort: 'desc',
	});
}

/**
 * Get account's transfer history
 */
export async function getTransferHistory(
	credentials: WaxCredentials,
	account: string,
	params?: {
		direction?: 'incoming' | 'outgoing' | 'both';
		symbol?: string;
		limit?: number;
	}
): Promise<any> {
	const baseParams: any = {
		filter: 'eosio.token:transfer',
		limit: params?.limit || 50,
		sort: 'desc',
	};
	
	if (params?.direction === 'incoming') {
		baseParams.transfer_to = account;
	} else if (params?.direction === 'outgoing') {
		baseParams.transfer_from = account;
	} else {
		baseParams.account = account;
	}
	
	if (params?.symbol) {
		baseParams.transfer_symbol = params.symbol;
	}
	
	return getActions(credentials, baseParams);
}

/**
 * Get NFT transfer history for account
 */
export async function getNftTransferHistory(
	credentials: WaxCredentials,
	account: string,
	limit: number = 50
): Promise<any> {
	return getActions(credentials, {
		account,
		filter: 'atomicassets:transfer',
		limit,
		sort: 'desc',
	});
}

/**
 * Search actions by contract and action name
 */
export async function searchActions(
	credentials: WaxCredentials,
	params: {
		contract: string;
		action: string;
		account?: string;
		limit?: number;
		after?: string;
		before?: string;
	}
): Promise<any> {
	return getActions(credentials, {
		filter: `${params.contract}:${params.action}`,
		account: params.account,
		limit: params.limit || 100,
		after: params.after,
		before: params.before,
		sort: 'desc',
	});
}

/**
 * Get actions in time range
 */
export async function getActionsInTimeRange(
	credentials: WaxCredentials,
	params: {
		account?: string;
		filter?: string;
		startTime: string;
		endTime: string;
		limit?: number;
	}
): Promise<any> {
	return getActions(credentials, {
		account: params.account,
		filter: params.filter,
		after: params.startTime,
		before: params.endTime,
		limit: params.limit || 100,
		sort: 'asc',
	});
}

/**
 * Stream actions (paginated)
 */
export async function* streamActions(
	credentials: WaxCredentials,
	params: {
		account?: string;
		filter?: string;
		batchSize?: number;
		maxResults?: number;
	}
): AsyncGenerator<any, void, undefined> {
	const batchSize = params.batchSize || 100;
	const maxResults = params.maxResults || 1000;
	let skip = 0;
	let totalFetched = 0;
	
	while (totalFetched < maxResults) {
		const result = await getActions(credentials, {
			account: params.account,
			filter: params.filter,
			limit: Math.min(batchSize, maxResults - totalFetched),
			skip,
			sort: 'desc',
		});
		
		const actions = result.actions || [];
		if (actions.length === 0) break;
		
		for (const action of actions) {
			yield action;
			totalFetched++;
		}
		
		skip += actions.length;
		
		if (actions.length < batchSize) break;
	}
}
