import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createRpc, createApi, getWaxCredentials, executeTransaction } from '../../transport/eosClient';
import { getTransfers } from '../../transport/atomicApi';
import { getTransferHistory } from '../../transport/hyperionClient';
import { isValidAccountName } from '../../utils/accountUtils';
import { parseWaxAmount, formatWaxAmount, WAXP_PRECISION } from '../../utils/assetUtils';
import { createWaxTransferAction } from '../../utils/serializationUtils';
import { TOKEN_CONTRACTS } from '../../constants/contracts';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transfer'],
			},
		},
		options: [
			{ name: 'Transfer WAXP', value: 'transferWaxp', description: 'Send WAXP to another account', action: 'Transfer WAXP' },
			{ name: 'Transfer Token', value: 'transferToken', description: 'Send a token to another account', action: 'Transfer token' },
			{ name: 'Batch Transfer', value: 'batchTransfer', description: 'Send tokens to multiple accounts', action: 'Batch transfer' },
			{ name: 'Get Transfer History', value: 'getTransferHistory', description: 'Get transfer history for an account', action: 'Get transfer history' },
			{ name: 'Estimate Transfer Cost', value: 'estimateCost', description: 'Estimate CPU/NET cost for transfer', action: 'Estimate transfer cost' },
			{ name: 'Validate Recipient', value: 'validateRecipient', description: 'Validate a recipient account', action: 'Validate recipient' },
		],
		default: 'transferWaxp',
	},
	{
		displayName: 'To Account',
		name: 'toAccount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferWaxp', 'transferToken', 'validateRecipient'],
			},
		},
		default: '',
		description: 'The recipient account name',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferWaxp', 'transferToken'],
			},
		},
		default: '',
		description: 'Amount to transfer (e.g., "10.00000000" for WAXP)',
	},
	{
		displayName: 'Token Symbol',
		name: 'tokenSymbol',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferToken'],
			},
		},
		options: [
			{ name: 'WAX', value: 'WAX' },
			{ name: 'TLM (Alien Worlds)', value: 'TLM' },
			{ name: 'NEFTY', value: 'NEFTY' },
			{ name: 'AETHER', value: 'AETHER' },
			{ name: 'WUF', value: 'WUF' },
			{ name: 'Custom', value: 'custom' },
		],
		default: 'WAX',
		description: 'Token symbol to transfer',
	},
	{
		displayName: 'Custom Token Contract',
		name: 'customTokenContract',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferToken'],
				tokenSymbol: ['custom'],
			},
		},
		default: '',
		description: 'Contract account for the custom token',
	},
	{
		displayName: 'Custom Token Symbol',
		name: 'customTokenSymbol',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferToken'],
				tokenSymbol: ['custom'],
			},
		},
		default: '',
		description: 'Symbol for the custom token (e.g., "TOKEN")',
	},
	{
		displayName: 'Custom Token Precision',
		name: 'customTokenPrecision',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferToken'],
				tokenSymbol: ['custom'],
			},
		},
		default: 8,
		description: 'Number of decimal places for the custom token',
	},
	{
		displayName: 'Memo',
		name: 'memo',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['transferWaxp', 'transferToken'],
			},
		},
		default: '',
		description: 'Optional memo for the transfer',
	},
	{
		displayName: 'Batch Transfers',
		name: 'batchTransfers',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['batchTransfer'],
			},
		},
		default: {},
		options: [
			{
				name: 'transfers',
				displayName: 'Transfers',
				values: [
					{
						displayName: 'To Account',
						name: 'to',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Amount',
						name: 'amount',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Memo',
						name: 'memo',
						type: 'string',
						default: '',
					},
				],
			},
		],
		description: 'List of transfers to execute',
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['getTransferHistory', 'estimateCost'],
			},
		},
		default: '',
		description: 'The account to get transfer history for',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['getTransferHistory'],
			},
		},
		default: 100,
		description: 'Maximum number of transfers to return',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await getWaxCredentials(this);
	const rpc = createRpc(credentials);

	switch (operation) {
		case 'transferWaxp': {
			const toAccount = this.getNodeParameter('toAccount', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const memo = this.getNodeParameter('memo', index, '') as string;

			if (!isValidAccountName(toAccount)) {
				throw new NodeOperationError(this.getNode(), `Invalid recipient account name: ${toAccount}`);
			}

			const api = await createApi(credentials);
			const formattedAmount = formatWaxAmount(parseFloat(amount));
			const quantity = `${formattedAmount} WAX`;

			const result = await api.transact({
				actions: [{
					account: 'eosio.token',
					name: 'transfer',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						from: credentials.accountName,
						to: toAccount,
						quantity,
						memo,
					},
				}],
			}, {
				blocksBehind: 3,
				expireSeconds: 300,
			});

			return [{ json: { success: true, transactionId: (result as any).transaction_id, from: credentials.accountName, to: toAccount, quantity, memo } }];
		}

		case 'transferToken': {
			const toAccount = this.getNodeParameter('toAccount', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tokenSymbol = this.getNodeParameter('tokenSymbol', index) as string;
			const memo = this.getNodeParameter('memo', index, '') as string;

			if (!isValidAccountName(toAccount)) {
				throw new NodeOperationError(this.getNode(), `Invalid recipient account name: ${toAccount}`);
			}

			let contract: string;
			let symbol: string;
			let precision: number;

			if (tokenSymbol === 'custom') {
				contract = this.getNodeParameter('customTokenContract', index) as string;
				symbol = this.getNodeParameter('customTokenSymbol', index) as string;
				precision = this.getNodeParameter('customTokenPrecision', index) as number;
			} else {
				const tokenContract = TOKEN_CONTRACTS[tokenSymbol.toLowerCase() as keyof typeof TOKEN_CONTRACTS];
				if (!tokenContract) {
					throw new NodeOperationError(this.getNode(), `Unknown token: ${tokenSymbol}`);
				}
				contract = tokenContract;
				symbol = tokenSymbol.toUpperCase();
				precision = 8; // Default precision
			}

			const api = await createApi(credentials);
			const formattedAmount = parseFloat(amount).toFixed(precision);
			const quantity = `${formattedAmount} ${symbol}`;

			const result = await api.transact({
				actions: [{
					account: contract,
					name: 'transfer',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						from: credentials.accountName,
						to: toAccount,
						quantity,
						memo,
					},
				}],
			}, {
				blocksBehind: 3,
				expireSeconds: 300,
			});

			return [{ json: { success: true, transactionId: (result as any).transaction_id, from: credentials.accountName, to: toAccount, quantity, memo, contract } }];
		}

		case 'batchTransfer': {
			const batchTransfers = this.getNodeParameter('batchTransfers', index) as { transfers: Array<{ to: string; amount: string; memo: string }> };
			const transfers = batchTransfers.transfers || [];

			if (transfers.length === 0) {
				throw new NodeOperationError(this.getNode(), 'No transfers specified');
			}

			const actions = transfers.map(transfer => {
				if (!isValidAccountName(transfer.to)) {
					throw new NodeOperationError(this.getNode(), `Invalid recipient account name: ${transfer.to}`);
				}
				const formattedAmount = formatWaxAmount(parseFloat(transfer.amount));
				return {
					account: 'eosio.token',
					name: 'transfer',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						from: credentials.accountName,
						to: transfer.to,
						quantity: `${formattedAmount} WAX`,
						memo: transfer.memo || '',
					},
				};
			});

			const api = await createApi(credentials);
			const result = await api.transact({ actions }, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, transferCount: transfers.length, transfers } }];
		}

		case 'getTransferHistory': {
			const account = this.getNodeParameter('account', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;

			const transfers = await getTransferHistory(credentials, account, { limit });
			return [{ json: { account, transfers, count: transfers.length } }];
		}

		case 'estimateCost': {
			const account = this.getNodeParameter('account', index) as string;
			const accountInfo = await rpc.get_account(account);

			return [{
				json: {
					account,
					estimatedCpu: '200 µs',
					estimatedNet: '128 bytes',
					availableCpu: accountInfo.cpu_limit.available,
					availableNet: accountInfo.net_limit.available,
					canTransfer: accountInfo.cpu_limit.available > 200 && accountInfo.net_limit.available > 128,
				},
			}];
		}

		case 'validateRecipient': {
			const toAccount = this.getNodeParameter('toAccount', index) as string;

			if (!isValidAccountName(toAccount)) {
				return [{ json: { valid: false, account: toAccount, error: 'Invalid account name format' } }];
			}

			try {
				const accountInfo = await rpc.get_account(toAccount);
				return [{
					json: {
						valid: true,
						account: toAccount,
						created: accountInfo.created,
						ramQuota: accountInfo.ram_quota,
						cpuWeight: accountInfo.cpu_weight,
						netWeight: accountInfo.net_weight,
					},
				}];
			} catch {
				return [{ json: { valid: false, account: toAccount, error: 'Account does not exist' } }];
			}
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
