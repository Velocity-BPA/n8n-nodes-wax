import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createApi, executeTransaction, getTableRows, getCurrencyBalance } from '../../transport/eosClient';
import { isValidAccountName } from '../../utils/accountUtils';

export const tokenOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['token'] } },
		options: [
			{ name: 'Get Token Info', value: 'getTokenInfo', description: 'Get token contract information', action: 'Get token info' },
			{ name: 'Get Token Balance', value: 'getTokenBalance', description: 'Get token balance for account', action: 'Get token balance' },
			{ name: 'Get Token Stats', value: 'getTokenStats', description: 'Get token supply statistics', action: 'Get token stats' },
			{ name: 'Transfer Token', value: 'transferToken', description: 'Transfer tokens', action: 'Transfer token' },
			{ name: 'Get Token Holders', value: 'getTokenHolders', description: 'Get top token holders', action: 'Get token holders' },
			{ name: 'Get Token Supply', value: 'getTokenSupply', description: 'Get token supply', action: 'Get token supply' },
			{ name: 'Create Token', value: 'createToken', description: 'Create a new token', action: 'Create token' },
			{ name: 'Issue Token', value: 'issueToken', description: 'Issue tokens', action: 'Issue token' },
			{ name: 'Retire Token', value: 'retireToken', description: 'Retire/burn tokens', action: 'Retire token' },
		],
		default: 'getTokenBalance',
	},
];

export const tokenFields: INodeProperties[] = [
	{
		displayName: 'Token Contract',
		name: 'tokenContract',
		type: 'string',
		required: true,
		default: 'eosio.token',
		placeholder: 'eosio.token',
		description: 'The token contract account',
		displayOptions: { show: { resource: ['token'], operation: ['getTokenInfo', 'getTokenBalance', 'getTokenStats', 'transferToken', 'getTokenHolders', 'getTokenSupply', 'issueToken', 'retireToken'] } },
	},
	{
		displayName: 'Token Symbol',
		name: 'tokenSymbol',
		type: 'string',
		required: true,
		default: 'WAX',
		placeholder: 'WAX',
		description: 'The token symbol',
		displayOptions: { show: { resource: ['token'], operation: ['getTokenBalance', 'getTokenStats', 'getTokenHolders', 'getTokenSupply', 'createToken', 'issueToken', 'retireToken'] } },
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to check (leave empty for configured account)',
		displayOptions: { show: { resource: ['token'], operation: ['getTokenBalance'] } },
	},
	{
		displayName: 'To Account',
		name: 'toAccount',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'recipient123',
		description: 'Recipient account',
		displayOptions: { show: { resource: ['token'], operation: ['transferToken', 'issueToken'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.00000000 WAX',
		description: 'Amount with precision and symbol (e.g., 1.00000000 WAX)',
		displayOptions: { show: { resource: ['token'], operation: ['transferToken', 'issueToken', 'retireToken'] } },
	},
	{
		displayName: 'Memo',
		name: 'memo',
		type: 'string',
		default: '',
		placeholder: 'Payment for services',
		description: 'Transfer memo',
		displayOptions: { show: { resource: ['token'], operation: ['transferToken', 'issueToken', 'retireToken'] } },
	},
	{
		displayName: 'Max Supply',
		name: 'maxSupply',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1000000000.0000 TOKEN',
		description: 'Maximum token supply with precision',
		displayOptions: { show: { resource: ['token'], operation: ['createToken'] } },
	},
	{
		displayName: 'Issuer Account',
		name: 'issuerAccount',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'myaccount123',
		description: 'Account that can issue tokens',
		displayOptions: { show: { resource: ['token'], operation: ['createToken'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['token'], operation: ['getTokenHolders'] } },
	},
];

const COMMON_TOKENS = [
	{ contract: 'eosio.token', symbol: 'WAX', precision: 8 },
	{ contract: 'alien.worlds', symbol: 'TLM', precision: 4 },
	{ contract: 'neftyblocksd', symbol: 'NEFTY', precision: 4 },
	{ contract: 'aaborwaxnet1', symbol: 'AETHER', precision: 4 },
	{ contract: 'wuffinftowax', symbol: 'WUF', precision: 8 },
];

export async function executeTokenAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getTokenInfo': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const stats = await getTableRows.call(this, {
				code: tokenContract,
				scope: tokenContract,
				table: 'stat',
				limit: 100,
			});
			result = {
				contract: tokenContract,
				tokens: stats.rows,
				count: stats.rows.length,
			};
			break;
		}

		case 'getTokenBalance': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const tokenSymbol = this.getNodeParameter('tokenSymbol', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			if (!isValidAccountName(account)) throw new Error(`Invalid account name: ${account}`);
			
			const balance = await getCurrencyBalance.call(this, tokenContract, account, tokenSymbol);
			result = {
				account,
				contract: tokenContract,
				symbol: tokenSymbol,
				balance: balance[0] || `0 ${tokenSymbol}`,
			};
			break;
		}

		case 'getTokenStats': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const tokenSymbol = this.getNodeParameter('tokenSymbol', index) as string;
			const stats = await getTableRows.call(this, {
				code: tokenContract,
				scope: tokenSymbol,
				table: 'stat',
				limit: 1,
			});
			if (!stats.rows || stats.rows.length === 0) {
				throw new Error(`Token ${tokenSymbol} not found on contract ${tokenContract}`);
			}
			result = {
				contract: tokenContract,
				...stats.rows[0],
			};
			break;
		}

		case 'transferToken': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const toAccount = this.getNodeParameter('toAccount', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const memo = this.getNodeParameter('memo', index) as string;

			if (!isValidAccountName(toAccount)) throw new Error(`Invalid recipient account: ${toAccount}`);

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const from = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: tokenContract,
				name: 'transfer',
				authorization: [{ actor: from, permission: 'active' }],
				data: {
					from,
					to: toAccount,
					quantity: amount,
					memo,
				},
			}]);
			break;
		}

		case 'getTokenHolders': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const tokenSymbol = this.getNodeParameter('tokenSymbol', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			
			const accounts = await getTableRows.call(this, {
				code: tokenContract,
				scope: tokenSymbol,
				table: 'accounts',
				limit,
			});
			result = {
				contract: tokenContract,
				symbol: tokenSymbol,
				holders: accounts.rows,
				count: accounts.rows.length,
				note: 'This shows accounts table, not ranked by balance',
			};
			break;
		}

		case 'getTokenSupply': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const tokenSymbol = this.getNodeParameter('tokenSymbol', index) as string;
			const stats = await getTableRows.call(this, {
				code: tokenContract,
				scope: tokenSymbol,
				table: 'stat',
				limit: 1,
			});
			if (!stats.rows || stats.rows.length === 0) {
				throw new Error(`Token ${tokenSymbol} not found`);
			}
			const stat = stats.rows[0];
			result = {
				contract: tokenContract,
				symbol: tokenSymbol,
				supply: stat.supply,
				max_supply: stat.max_supply,
				issuer: stat.issuer,
			};
			break;
		}

		case 'createToken': {
			const maxSupply = this.getNodeParameter('maxSupply', index) as string;
			const issuerAccount = this.getNodeParameter('issuerAccount', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const actor = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: actor,
				name: 'create',
				authorization: [{ actor, permission: 'active' }],
				data: {
					issuer: issuerAccount,
					maximum_supply: maxSupply,
				},
			}]);
			break;
		}

		case 'issueToken': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const toAccount = this.getNodeParameter('toAccount', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const memo = this.getNodeParameter('memo', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const issuer = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: tokenContract,
				name: 'issue',
				authorization: [{ actor: issuer, permission: 'active' }],
				data: {
					to: toAccount,
					quantity: amount,
					memo,
				},
			}]);
			break;
		}

		case 'retireToken': {
			const tokenContract = this.getNodeParameter('tokenContract', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const memo = this.getNodeParameter('memo', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const actor = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: tokenContract,
				name: 'retire',
				authorization: [{ actor, permission: 'active' }],
				data: {
					quantity: amount,
					memo,
				},
			}]);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...tokenOperations, ...tokenFields];
export const execute = executeTokenAction;
