// Account Resource Actions
// Author: Velocity BPA - https://velobpa.com

import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
	getWaxCredentials,
	getAccount,
	getCurrencyBalance,
	getTableRows,
	executeTransaction,
} from '../../transport/eosClient';
import { getAtomicCredentials, getAccountAssets } from '../../transport/atomicApi';
import {
	isValidAccountName,
	parseResourceUsage,
	parseStakedResources,
	formatBytes,
} from '../../utils/accountUtils';
import { formatWaxAmount } from '../../utils/assetUtils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{ name: 'Buy RAM', value: 'buyRam' },
			{ name: 'Get Account Info', value: 'getAccountInfo' },
			{ name: 'Get Account NFTs', value: 'getAccountNfts' },
			{ name: 'Get Account Permissions', value: 'getPermissions' },
			{ name: 'Get Account Resources', value: 'getResources' },
			{ name: 'Get Staked Resources', value: 'getStaked' },
			{ name: 'Get Token Balances', value: 'getTokenBalances' },
			{ name: 'Get WAXP Balance', value: 'getWaxBalance' },
			{ name: 'Sell RAM', value: 'sellRam' },
			{ name: 'Stake CPU/NET', value: 'stake' },
			{ name: 'Unstake CPU/NET', value: 'unstake' },
			{ name: 'Validate Account Name', value: 'validateAccount' },
		],
		default: 'getAccountInfo',
	},

	// Account Name field (common)
	{
		displayName: 'Account Name',
		name: 'accountName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getAccountInfo',
					'getWaxBalance',
					'getTokenBalances',
					'getResources',
					'getPermissions',
					'getStaked',
					'getAccountNfts',
					'validateAccount',
				],
			},
		},
		default: '',
		placeholder: 'myaccount123',
		description: 'WAX account name (12 characters max, a-z, 1-5, .)',
	},

	// Buy RAM fields
	{
		displayName: 'Receiver',
		name: 'receiver',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['buyRam'],
			},
		},
		default: '',
		description: 'Account to receive the RAM',
	},
	{
		displayName: 'Amount (WAX)',
		name: 'ramAmount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['buyRam'],
			},
		},
		default: 1,
		description: 'Amount of WAX to spend on RAM',
	},

	// Sell RAM fields
	{
		displayName: 'Bytes to Sell',
		name: 'ramBytes',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['sellRam'],
			},
		},
		default: 1024,
		description: 'Number of RAM bytes to sell',
	},

	// Stake fields
	{
		displayName: 'Receiver',
		name: 'stakeReceiver',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['stake', 'unstake'],
			},
		},
		default: '',
		description: 'Account to stake resources for',
	},
	{
		displayName: 'CPU Amount (WAX)',
		name: 'cpuAmount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['stake', 'unstake'],
			},
		},
		default: 0,
		description: 'Amount of WAX to stake/unstake for CPU',
	},
	{
		displayName: 'NET Amount (WAX)',
		name: 'netAmount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['stake', 'unstake'],
			},
		},
		default: 0,
		description: 'Amount of WAX to stake/unstake for NET',
	},

	// NFT query options
	{
		displayName: 'Collection',
		name: 'nftCollection',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAccountNfts'],
			},
		},
		default: '',
		description: 'Filter by collection name (optional)',
	},
	{
		displayName: 'Limit',
		name: 'nftLimit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAccountNfts'],
			},
		},
		default: 100,
		description: 'Maximum number of NFTs to return',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
	operation: string
): Promise<any> {
	const credentials = await getWaxCredentials(this);

	switch (operation) {
		case 'getAccountInfo': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			const accountData = await getAccount(credentials, accountName);
			const resources = parseResourceUsage(accountData);
			const staked = parseStakedResources(accountData);
			
			return {
				accountName: accountData.account_name,
				created: accountData.created,
				coreLiquidBalance: accountData.core_liquid_balance || '0.00000000 WAX',
				resources: {
					cpu: {
						...resources.cpu,
						usedFormatted: `${resources.cpu.used} µs`,
						maxFormatted: `${resources.cpu.max} µs`,
					},
					net: {
						...resources.net,
						usedFormatted: formatBytes(resources.net.used),
						maxFormatted: formatBytes(resources.net.max),
					},
					ram: {
						...resources.ram,
						usedFormatted: formatBytes(resources.ram.used),
						maxFormatted: formatBytes(resources.ram.max),
					},
				},
				staked,
				permissions: accountData.permissions,
				voterInfo: accountData.voter_info,
				refundRequest: accountData.refund_request,
				raw: accountData,
			};
		}

		case 'getWaxBalance': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			const balances = await getCurrencyBalance(credentials, accountName);
			const waxBalance = balances.length > 0 ? balances[0] : '0.00000000 WAX';
			
			return {
				accountName,
				balance: waxBalance,
				amount: parseFloat(waxBalance.split(' ')[0]),
				symbol: 'WAX',
			};
		}

		case 'getTokenBalances': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			// Get WAX balance
			const waxBalances = await getCurrencyBalance(credentials, accountName);
			
			// Common token contracts to check
			const tokenContracts = [
				{ contract: 'alien.worlds', symbol: 'TLM' },
				{ contract: 'token.nefty', symbol: 'NEFTY' },
				{ contract: 'e.rplanet', symbol: 'AETHER' },
			];
			
			const allBalances = [
				{
					contract: 'eosio.token',
					symbol: 'WAX',
					balance: waxBalances[0] || '0.00000000 WAX',
				},
			];
			
			for (const token of tokenContracts) {
				try {
					const balance = await getCurrencyBalance(
						credentials,
						accountName,
						token.contract,
						token.symbol
					);
					if (balance.length > 0) {
						allBalances.push({
							contract: token.contract,
							symbol: token.symbol,
							balance: balance[0],
						});
					}
				} catch {
					// Token doesn't exist for this account
				}
			}
			
			return {
				accountName,
				balances: allBalances,
			};
		}

		case 'getResources': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			const accountData = await getAccount(credentials, accountName);
			const resources = parseResourceUsage(accountData);
			
			return {
				accountName,
				cpu: {
					used: resources.cpu.used,
					available: resources.cpu.available,
					max: resources.cpu.max,
					percentUsed: ((resources.cpu.used / resources.cpu.max) * 100).toFixed(2) + '%',
				},
				net: {
					used: resources.net.used,
					available: resources.net.available,
					max: resources.net.max,
					percentUsed: ((resources.net.used / resources.net.max) * 100).toFixed(2) + '%',
				},
				ram: {
					used: resources.ram.used,
					available: resources.ram.available,
					max: resources.ram.max,
					percentUsed: ((resources.ram.used / resources.ram.max) * 100).toFixed(2) + '%',
				},
			};
		}

		case 'getPermissions': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			const accountData = await getAccount(credentials, accountName);
			
			return {
				accountName,
				permissions: accountData.permissions.map((perm: any) => ({
					name: perm.perm_name,
					parent: perm.parent,
					threshold: perm.required_auth.threshold,
					keys: perm.required_auth.keys,
					accounts: perm.required_auth.accounts,
					waits: perm.required_auth.waits,
				})),
			};
		}

		case 'getStaked': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			const accountData = await getAccount(credentials, accountName);
			const staked = parseStakedResources(accountData);
			
			// Check for delegated bandwidth
			const delband = await getTableRows(credentials, {
				code: 'eosio',
				scope: accountName,
				table: 'delband',
				limit: 100,
			});
			
			// Check for refunds
			const refunds = await getTableRows(credentials, {
				code: 'eosio',
				scope: accountName,
				table: 'refunds',
				limit: 10,
			});
			
			return {
				accountName,
				selfStaked: {
					cpuWeight: staked.cpuWeight,
					netWeight: staked.netWeight,
					totalStaked: staked.totalStaked,
				},
				delegatedTo: delband.rows,
				pendingRefunds: refunds.rows,
			};
		}

		case 'getAccountNfts': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			const collection = this.getNodeParameter('nftCollection', index) as string;
			const limit = this.getNodeParameter('nftLimit', index) as number;
			
			if (!isValidAccountName(accountName)) {
				throw new Error(`Invalid account name: ${accountName}`);
			}
			
			const atomicCreds = await getAtomicCredentials(this);
			const result = await getAccountAssets(atomicCreds, accountName, {
				collection_name: collection || undefined,
				limit,
			});
			
			return {
				accountName,
				collections: result.data?.collections || [],
				templates: result.data?.templates || [],
				assets: result.data?.assets || [],
			};
		}

		case 'validateAccount': {
			const accountName = this.getNodeParameter('accountName', index) as string;
			const isValid = isValidAccountName(accountName);
			let exists = false;
			let accountData = null;
			
			if (isValid) {
				try {
					accountData = await getAccount(credentials, accountName);
					exists = true;
				} catch {
					exists = false;
				}
			}
			
			return {
				accountName,
				isValidFormat: isValid,
				exists,
				accountData: exists ? {
					created: accountData?.created,
					balance: accountData?.core_liquid_balance,
				} : null,
			};
		}

		case 'buyRam': {
			const receiver = this.getNodeParameter('receiver', index) as string;
			const amount = this.getNodeParameter('ramAmount', index) as number;
			
			if (!isValidAccountName(receiver)) {
				throw new Error(`Invalid receiver account: ${receiver}`);
			}
			
			const result = await executeTransaction(credentials, [
				{
					account: 'eosio',
					name: 'buyram',
					authorization: [{
						actor: credentials.accountName!,
						permission: credentials.permission || 'active',
					}],
					data: {
						payer: credentials.accountName,
						receiver,
						quant: formatWaxAmount(amount),
					},
				},
			]);
			
			return {
				success: true,
				transactionId: (result as any).transaction_id,
				receiver,
				amount: formatWaxAmount(amount),
			};
		}

		case 'sellRam': {
			const bytes = this.getNodeParameter('ramBytes', index) as number;
			
			const result = await executeTransaction(credentials, [
				{
					account: 'eosio',
					name: 'sellram',
					authorization: [{
						actor: credentials.accountName!,
						permission: credentials.permission || 'active',
					}],
					data: {
						account: credentials.accountName,
						bytes,
					},
				},
			]);
			
			return {
				success: true,
				transactionId: (result as any).transaction_id,
				bytesSold: bytes,
			};
		}

		case 'stake': {
			const receiver = this.getNodeParameter('stakeReceiver', index) as string;
			const cpuAmount = this.getNodeParameter('cpuAmount', index) as number;
			const netAmount = this.getNodeParameter('netAmount', index) as number;
			
			if (!isValidAccountName(receiver)) {
				throw new Error(`Invalid receiver account: ${receiver}`);
			}
			
			const result = await executeTransaction(credentials, [
				{
					account: 'eosio',
					name: 'delegatebw',
					authorization: [{
						actor: credentials.accountName!,
						permission: credentials.permission || 'active',
					}],
					data: {
						from: credentials.accountName,
						receiver,
						stake_net_quantity: formatWaxAmount(netAmount),
						stake_cpu_quantity: formatWaxAmount(cpuAmount),
						transfer: false,
					},
				},
			]);
			
			return {
				success: true,
				transactionId: (result as any).transaction_id,
				receiver,
				cpuStaked: formatWaxAmount(cpuAmount),
				netStaked: formatWaxAmount(netAmount),
			};
		}

		case 'unstake': {
			const receiver = this.getNodeParameter('stakeReceiver', index) as string;
			const cpuAmount = this.getNodeParameter('cpuAmount', index) as number;
			const netAmount = this.getNodeParameter('netAmount', index) as number;
			
			if (!isValidAccountName(receiver)) {
				throw new Error(`Invalid receiver account: ${receiver}`);
			}
			
			const result = await executeTransaction(credentials, [
				{
					account: 'eosio',
					name: 'undelegatebw',
					authorization: [{
						actor: credentials.accountName!,
						permission: credentials.permission || 'active',
					}],
					data: {
						from: credentials.accountName,
						receiver,
						unstake_net_quantity: formatWaxAmount(netAmount),
						unstake_cpu_quantity: formatWaxAmount(cpuAmount),
					},
				},
			]);
			
			return {
				success: true,
				transactionId: (result as any).transaction_id,
				receiver,
				cpuUnstaked: formatWaxAmount(cpuAmount),
				netUnstaked: formatWaxAmount(netAmount),
				note: 'Unstaked tokens will be available after 3 days refund period',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
