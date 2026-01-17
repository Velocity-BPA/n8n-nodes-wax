// WAX Cloud Wallet Client
// Author: Velocity BPA - https://velobpa.com

import { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions } from 'n8n-workflow';

const fetch = require('node-fetch');

export interface WcwCredentials {
	environment: string;
	wcwEndpoint: string;
	accountName: string;
	authToken: string;
	sessionToken: string;
}

/**
 * Get WCW credentials from n8n context
 */
export async function getWcwCredentials(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions
): Promise<WcwCredentials> {
	const credentials = await context.getCredentials('waxCloudWallet');
	return {
		environment: credentials.environment as string,
		wcwEndpoint: credentials.wcwEndpoint as string,
		accountName: credentials.accountName as string,
		authToken: credentials.authToken as string,
		sessionToken: credentials.sessionToken as string,
	};
}

/**
 * Get WCW API endpoint
 */
export function getWcwEndpoint(credentials: WcwCredentials): string {
	if (credentials.wcwEndpoint) {
		return credentials.wcwEndpoint;
	}
	return credentials.environment === 'production'
		? 'https://api-idm.wax.io'
		: 'https://api-idm-dev.wax.io';
}

/**
 * Make authenticated request to WCW API
 */
export async function wcwRequest(
	credentials: WcwCredentials,
	endpoint: string,
	method: string = 'GET',
	body?: any
): Promise<any> {
	const baseUrl = getWcwEndpoint(credentials);
	const url = `${baseUrl}${endpoint}`;
	
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	
	if (credentials.authToken) {
		headers['Authorization'] = `Bearer ${credentials.authToken}`;
	}
	
	if (credentials.sessionToken) {
		headers['X-Session-Token'] = credentials.sessionToken;
	}
	
	const response = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`WCW API error: ${response.status} - ${errorText}`);
	}
	
	return response.json();
}

/**
 * Verify WCW account
 */
export async function verifyAccount(credentials: WcwCredentials): Promise<any> {
	return wcwRequest(credentials, '/v1/account/verify');
}

/**
 * Get WCW account info
 */
export async function getWcwAccountInfo(credentials: WcwCredentials): Promise<any> {
	return wcwRequest(credentials, `/v1/account/${credentials.accountName}`);
}

/**
 * Sign transaction with WCW
 * Note: WCW signing typically requires browser-based flow
 * This is a simplified server-side representation
 */
export async function signWithWcw(
	credentials: WcwCredentials,
	transaction: any
): Promise<any> {
	return wcwRequest(credentials, '/v1/sign', 'POST', {
		account: credentials.accountName,
		transaction,
	});
}

/**
 * Get WCW session status
 */
export async function getSessionStatus(credentials: WcwCredentials): Promise<any> {
	return wcwRequest(credentials, '/v1/session/status');
}

/**
 * Refresh WCW session
 */
export async function refreshSession(credentials: WcwCredentials): Promise<any> {
	return wcwRequest(credentials, '/v1/session/refresh', 'POST');
}

/**
 * Check if account is a WCW account
 */
export function isWcwAccount(accountName: string): boolean {
	return accountName.endsWith('.wam');
}

/**
 * WCW-specific RPC endpoints
 * WAX Cloud Wallet uses specific RPC nodes
 */
export const WCW_RPC_ENDPOINTS = {
	production: 'https://wax.greymass.com',
	testnet: 'https://testnet.waxsweden.org',
};

/**
 * Get WCW RPC endpoint
 */
export function getWcwRpcEndpoint(environment: string): string {
	return WCW_RPC_ENDPOINTS[environment as keyof typeof WCW_RPC_ENDPOINTS] || WCW_RPC_ENDPOINTS.production;
}

/**
 * Format WCW transaction for signing
 */
export function formatWcwTransaction(
	actions: any[],
	options?: {
		broadcast?: boolean;
		freeBandwidth?: boolean;
	}
): any {
	return {
		actions,
		broadcast: options?.broadcast ?? true,
		freeBandwidth: options?.freeBandwidth ?? true,
	};
}

/**
 * Parse WCW signing result
 */
export interface WcwSigningResult {
	success: boolean;
	transactionId?: string;
	signatures?: string[];
	error?: string;
}

export function parseWcwSigningResult(result: any): WcwSigningResult {
	if (result.error) {
		return {
			success: false,
			error: result.error.message || result.error,
		};
	}
	
	return {
		success: true,
		transactionId: result.transaction_id || result.transactionId,
		signatures: result.signatures || [],
	};
}
