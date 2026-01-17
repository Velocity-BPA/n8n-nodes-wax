// Transaction Resource Actions
// Author: Velocity BPA - https://velobpa.com

import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
	getWaxCredentials,
	executeTransaction,
	signTransaction,
	pushTransaction,
	getTransaction,
	getChainInfo,
	getBlock,
} from '../../transport/eosClient';
import { getActions, getAccountTransactions } from '../../transport/hyperionClient';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{ name: 'Build Transaction', value: 'buildTransaction' },
			{ name: 'Get Actions', value: 'getActions' },
			{ name: 'Get Recent Transactions', value: 'getRecentTransactions' },
			{ name: 'Get Transaction', value: 'getTransaction' },
			{ name: 'Get Transaction Status', value: 'getTransactionStatus' },
			{ name: 'Push Transaction', value: 'pushTransaction' },
			{ name: 'Send Transaction', value: 'sendTransaction' },
			{ name: 'Sign Transaction', value: 'signTransaction' },
		],
		default: 'getTransaction',
	},

	// Transaction ID
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getTransaction', 'getTransactionStatus'],
			},
		},
		default: '',
		placeholder: 'abc123...',
		description: 'The transaction ID to look up',
	},

	// Account for recent transactions
	{
		displayName: 'Account Name',
		name: 'accountName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getRecentTransactions', 'getActions'],
			},
		},
		default: '',
		description: 'Account name to get transactions for',
	},

	// Limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getRecentTransactions', 'getActions'],
			},
		},
		default: 50,
		description: 'Maximum number of transactions to return',
	},

	// Action filter
	{
		displayName: 'Action Filter',
		name: 'actionFilter',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getActions'],
			},
		},
		default: '',
		placeholder: 'eosio.token:transfer',
		description: 'Filter actions by contract:action (e.g., eosio.token:transfer)',
	},

	// Send/Build Transaction
	{
		displayName: 'Actions (JSON)',
		name: 'actionsJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendTransaction', 'buildTransaction', 'signTransaction'],
			},
		},
		default: '[]',
		description: 'Array of actions to include in the transaction',
	},

	// Push signed transaction
	{
		displayName: 'Signed Transaction (JSON)',
		name: 'signedTransaction',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['pushTransaction'],
			},
		},
		default: '{}',
		description: 'The signed transaction object to push',
	},

	// Broadcast option
	{
		displayName: 'Broadcast',
		name: 'broadcast',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendTransaction'],
			},
		},
		default: true,
		description: 'Whether to broadcast the transaction to the network',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
	operation: string
): Promise<any> {
	const credentials = await getWaxCredentials(this);

	switch (operation) {
		case 'getTransaction': {
			const transactionId = this.getNodeParameter('transactionId', index) as string;
			
			const result = await getTransaction(credentials, transactionId);
			
			return {
				transactionId,
				found: !!result.trx_id,
				blockNum: result.block_num,
				blockTime: result.block_time,
				actions: result.actions || [],
				traces: result.traces || [],
			};
		}

		case 'getTransactionStatus': {
			const transactionId = this.getNodeParameter('transactionId', index) as string;
			
			try {
				const result = await getTransaction(credentials, transactionId);
				const chainInfo = await getChainInfo(credentials);
				
				const txBlockNum = result.block_num;
				const irreversibleBlockNum = chainInfo.last_irreversible_block_num;
				
				return {
					transactionId,
					status: txBlockNum <= irreversibleBlockNum ? 'irreversible' : 'pending',
					blockNum: txBlockNum,
					irreversibleBlockNum,
					blocksUntilIrreversible: Math.max(0, txBlockNum - irreversibleBlockNum),
					executed: true,
				};
			} catch (error) {
				return {
					transactionId,
					status: 'not_found',
					executed: false,
					error: (error as Error).message,
				};
			}
		}

		case 'getRecentTransactions': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			
			const result = await getAccountTransactions(credentials, accountName, limit);
			
			return {
				accountName,
				total: result.total?.value || result.actions?.length || 0,
				transactions: (result.actions || []).map((action: any) => ({
					transactionId: action.trx_id,
					blockNum: action.block_num,
					blockTime: action.timestamp || action['@timestamp'],
					contract: action.act?.account,
					action: action.act?.name,
					data: action.act?.data,
				})),
			};
		}

		case 'getActions': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const actionFilter = this.getNodeParameter('actionFilter', index) as string;
			
			const result = await getActions(credentials, {
				account: accountName,
				filter: actionFilter || undefined,
				limit,
				sort: 'desc',
			});
			
			return {
				accountName,
				filter: actionFilter,
				total: result.total?.value || result.actions?.length || 0,
				actions: (result.actions || []).map((action: any) => ({
					globalSequence: action.global_sequence,
					transactionId: action.trx_id,
					blockNum: action.block_num,
					timestamp: action.timestamp || action['@timestamp'],
					contract: action.act?.account,
					action: action.act?.name,
					authorization: action.act?.authorization,
					data: action.act?.data,
				})),
			};
		}

		case 'sendTransaction': {
			const actionsJson = this.getNodeParameter('actionsJson', index) as string;
			const broadcast = this.getNodeParameter('broadcast', index) as boolean;
			
			const actions = typeof actionsJson === 'string' ? JSON.parse(actionsJson) : actionsJson;
			
			const result = await executeTransaction(credentials, actions, {
				broadcast,
				sign: true,
			});
			
			return {
				success: true,
				transactionId: (result as any).transaction_id,
				processed: result.processed,
				broadcast,
			};
		}

		case 'buildTransaction': {
			const actionsJson = this.getNodeParameter('actionsJson', index) as string;
			
			const actions = typeof actionsJson === 'string' ? JSON.parse(actionsJson) : actionsJson;
			
			// Get chain info for building transaction
			const chainInfo = await getChainInfo(credentials);
			const refBlockNum = chainInfo.head_block_num - 3;
			const refBlock = await getBlock(credentials, refBlockNum);
			
			const expiration = new Date(Date.now() + 120 * 1000).toISOString().slice(0, -1);
			
			const transaction = {
				expiration,
				ref_block_num: refBlock.block_num & 0xffff,
				ref_block_prefix: refBlock.ref_block_prefix,
				max_net_usage_words: 0,
				max_cpu_usage_ms: 0,
				delay_sec: 0,
				context_free_actions: [],
				actions,
				transaction_extensions: [],
			};
			
			return {
				transaction,
				chainId: chainInfo.chain_id,
				refBlockNum: refBlock.block_num,
			};
		}

		case 'signTransaction': {
			const actionsJson = this.getNodeParameter('actionsJson', index) as string;
			
			const actions = typeof actionsJson === 'string' ? JSON.parse(actionsJson) : actionsJson;
			
			const result = await executeTransaction(credentials, actions, {
				broadcast: false,
				sign: true,
			});
			
			return {
				signed: true,
				serializedTransaction: result.serializedTransaction,
				signatures: result.signatures,
			};
		}

		case 'pushTransaction': {
			const signedTxJson = this.getNodeParameter('signedTransaction', index) as string;
			
			const signedTx = typeof signedTxJson === 'string' ? JSON.parse(signedTxJson) : signedTxJson;
			
			const result = await pushTransaction(credentials, signedTx);
			
			return {
				success: true,
				transactionId: (result as any).transaction_id,
				processed: result.processed,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
