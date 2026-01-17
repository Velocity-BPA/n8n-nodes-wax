import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createApi, executeTransaction, getTableRows, getAccount } from '../../transport/eosClient';
import { parseAccountResources, calculateRamPricePerKb, estimateRamCost, estimatePowerupCost, calculateUsagePercentage } from '../../utils/resourceUtils';
import { isValidAccountName } from '../../utils/accountUtils';

export const resourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['resource'] } },
		options: [
			{ name: 'Get Resource Info', value: 'getResourceInfo', description: 'Get account resource usage', action: 'Get resource info' },
			{ name: 'Get Resource Prices', value: 'getResourcePrices', description: 'Get current resource prices', action: 'Get resource prices' },
			{ name: 'Buy RAM (Bytes)', value: 'buyRamBytes', description: 'Buy RAM in bytes', action: 'Buy RAM bytes' },
			{ name: 'Buy RAM (WAXP)', value: 'buyRamWaxp', description: 'Buy RAM with WAXP amount', action: 'Buy RAM WAXP' },
			{ name: 'Sell RAM', value: 'sellRam', description: 'Sell RAM for WAXP', action: 'Sell RAM' },
			{ name: 'Stake CPU', value: 'stakeCpu', description: 'Stake WAXP for CPU', action: 'Stake CPU' },
			{ name: 'Stake NET', value: 'stakeNet', description: 'Stake WAXP for NET', action: 'Stake NET' },
			{ name: 'Unstake CPU', value: 'unstakeCpu', description: 'Unstake from CPU', action: 'Unstake CPU' },
			{ name: 'Unstake NET', value: 'unstakeNet', description: 'Unstake from NET', action: 'Unstake NET' },
			{ name: 'Get Resource Usage', value: 'getResourceUsage', description: 'Get detailed resource usage', action: 'Get resource usage' },
			{ name: 'Estimate Resource Cost', value: 'estimateResourceCost', description: 'Estimate cost for resources', action: 'Estimate resource cost' },
			{ name: 'Powerup', value: 'powerup', description: 'Rent CPU/NET via Powerup', action: 'Powerup' },
		],
		default: 'getResourceInfo',
	},
];

export const resourceFields: INodeProperties[] = [
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to check/modify (leave empty for configured account)',
		displayOptions: { show: { resource: ['resource'], operation: ['getResourceInfo', 'getResourceUsage', 'buyRamBytes', 'buyRamWaxp', 'sellRam', 'stakeCpu', 'stakeNet', 'unstakeCpu', 'unstakeNet', 'powerup'] } },
	},
	{
		displayName: 'RAM Bytes',
		name: 'ramBytes',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 1024,
		description: 'Amount of RAM in bytes',
		displayOptions: { show: { resource: ['resource'], operation: ['buyRamBytes', 'sellRam', 'estimateResourceCost'] } },
	},
	{
		displayName: 'WAXP Amount',
		name: 'waxpAmount',
		type: 'string',
		default: '1.00000000 WAX',
		placeholder: '1.00000000 WAX',
		description: 'Amount of WAXP',
		displayOptions: { show: { resource: ['resource'], operation: ['buyRamWaxp', 'stakeCpu', 'stakeNet', 'unstakeCpu', 'unstakeNet'] } },
	},
	{
		displayName: 'Receiver',
		name: 'receiver',
		type: 'string',
		default: '',
		placeholder: 'recipient123',
		description: 'Account to receive resources (leave empty for self)',
		displayOptions: { show: { resource: ['resource'], operation: ['buyRamBytes', 'buyRamWaxp', 'stakeCpu', 'stakeNet'] } },
	},
	{
		displayName: 'CPU Fraction',
		name: 'cpuFraction',
		type: 'number',
		typeOptions: { minValue: 0, maxValue: 100 },
		default: 50,
		description: 'Percentage of powerup for CPU (0-100)',
		displayOptions: { show: { resource: ['resource'], operation: ['powerup'] } },
	},
	{
		displayName: 'NET Fraction',
		name: 'netFraction',
		type: 'number',
		typeOptions: { minValue: 0, maxValue: 100 },
		default: 50,
		description: 'Percentage of powerup for NET (0-100)',
		displayOptions: { show: { resource: ['resource'], operation: ['powerup'] } },
	},
	{
		displayName: 'Max Payment',
		name: 'maxPayment',
		type: 'string',
		default: '1.00000000 WAX',
		placeholder: '1.00000000 WAX',
		description: 'Maximum WAXP to pay for powerup',
		displayOptions: { show: { resource: ['resource'], operation: ['powerup'] } },
	},
	{
		displayName: 'Resource Type',
		name: 'resourceType',
		type: 'options',
		options: [
			{ name: 'RAM', value: 'ram' },
			{ name: 'CPU', value: 'cpu' },
			{ name: 'NET', value: 'net' },
			{ name: 'All', value: 'all' },
		],
		default: 'all',
		description: 'Type of resource to estimate',
		displayOptions: { show: { resource: ['resource'], operation: ['estimateResourceCost'] } },
	},
];

export async function executeResourceAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;
	const credentials = await this.getCredentials('waxNetwork');
	const configuredAccount = credentials.accountName as string;

	switch (operation) {
		case 'getResourceInfo': {
			let account = this.getNodeParameter('account', index) as string;
			if (!account) account = configuredAccount;
			if (!isValidAccountName(account)) throw new Error(`Invalid account name: ${account}`);
			
			const accountData = await getAccount.call(this, account);
			const resources = parseAccountResources(accountData);
			
			result = {
				account,
				...resources,
			};
			break;
		}

		case 'getResourcePrices': {
			const ramMarket = await getTableRows.call(this, {
				code: 'eosio',
				scope: 'eosio',
				table: 'rammarket',
				limit: 1,
			});
			
			let ramPricePerKb = 0;
			if (ramMarket.rows && ramMarket.rows.length > 0) {
				const row = ramMarket.rows[0];
				ramPricePerKb = calculateRamPricePerKb(row);
			}

			const powerupState = await getTableRows.call(this, {
				code: 'eosio',
				scope: 'eosio',
				table: 'powup.state',
				limit: 1,
			});

			result = {
				ram: {
					price_per_kb_wax: ramPricePerKb.toFixed(8),
					price_per_mb_wax: (ramPricePerKb * 1024).toFixed(8),
				},
				powerup: powerupState.rows[0] || {},
			};
			break;
		}

		case 'buyRamBytes': {
			let account = this.getNodeParameter('account', index) as string;
			let receiver = this.getNodeParameter('receiver', index) as string;
			const ramBytes = this.getNodeParameter('ramBytes', index) as number;
			
			if (!account) account = configuredAccount;
			if (!receiver) receiver = account;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'buyrambytes',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					payer: account,
					receiver,
					bytes: ramBytes,
				},
			}]);
			break;
		}

		case 'buyRamWaxp': {
			let account = this.getNodeParameter('account', index) as string;
			let receiver = this.getNodeParameter('receiver', index) as string;
			const waxpAmount = this.getNodeParameter('waxpAmount', index) as string;
			
			if (!account) account = configuredAccount;
			if (!receiver) receiver = account;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'buyram',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					payer: account,
					receiver,
					quant: waxpAmount,
				},
			}]);
			break;
		}

		case 'sellRam': {
			let account = this.getNodeParameter('account', index) as string;
			const ramBytes = this.getNodeParameter('ramBytes', index) as number;
			if (!account) account = configuredAccount;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'sellram',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					account,
					bytes: ramBytes,
				},
			}]);
			break;
		}

		case 'stakeCpu': {
			let account = this.getNodeParameter('account', index) as string;
			let receiver = this.getNodeParameter('receiver', index) as string;
			const waxpAmount = this.getNodeParameter('waxpAmount', index) as string;
			
			if (!account) account = configuredAccount;
			if (!receiver) receiver = account;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'delegatebw',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					from: account,
					receiver,
					stake_net_quantity: '0.00000000 WAX',
					stake_cpu_quantity: waxpAmount,
					transfer: false,
				},
			}]);
			break;
		}

		case 'stakeNet': {
			let account = this.getNodeParameter('account', index) as string;
			let receiver = this.getNodeParameter('receiver', index) as string;
			const waxpAmount = this.getNodeParameter('waxpAmount', index) as string;
			
			if (!account) account = configuredAccount;
			if (!receiver) receiver = account;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'delegatebw',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					from: account,
					receiver,
					stake_net_quantity: waxpAmount,
					stake_cpu_quantity: '0.00000000 WAX',
					transfer: false,
				},
			}]);
			break;
		}

		case 'unstakeCpu': {
			let account = this.getNodeParameter('account', index) as string;
			const waxpAmount = this.getNodeParameter('waxpAmount', index) as string;
			if (!account) account = configuredAccount;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'undelegatebw',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					from: account,
					receiver: account,
					unstake_net_quantity: '0.00000000 WAX',
					unstake_cpu_quantity: waxpAmount,
				},
			}]);
			break;
		}

		case 'unstakeNet': {
			let account = this.getNodeParameter('account', index) as string;
			const waxpAmount = this.getNodeParameter('waxpAmount', index) as string;
			if (!account) account = configuredAccount;

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'undelegatebw',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					from: account,
					receiver: account,
					unstake_net_quantity: waxpAmount,
					unstake_cpu_quantity: '0.00000000 WAX',
				},
			}]);
			break;
		}

		case 'getResourceUsage': {
			let account = this.getNodeParameter('account', index) as string;
			if (!account) account = configuredAccount;
			
			const accountData = await getAccount.call(this, account);
			const resources = parseAccountResources(accountData);
			
			result = {
				account,
				cpu: {
					used: accountData.cpu_limit?.used || 0,
					available: accountData.cpu_limit?.available || 0,
					max: accountData.cpu_limit?.max || 0,
					percentage: (resources.cpu as any).usagePercent || calculateUsagePercentage(resources.cpu),
					staked: accountData.cpu_weight,
				},
				net: {
					used: accountData.net_limit?.used || 0,
					available: accountData.net_limit?.available || 0,
					max: accountData.net_limit?.max || 0,
					percentage: (resources.net as any).usagePercent || calculateUsagePercentage(resources.net),
					staked: accountData.net_weight,
				},
				ram: {
					used: accountData.ram_usage || 0,
					quota: accountData.ram_quota || 0,
					percentage: (resources.ram as any).usagePercent || calculateUsagePercentage(resources.ram),
				},
			};
			break;
		}

		case 'estimateResourceCost': {
			const resourceType = this.getNodeParameter('resourceType', index) as string;
			const ramBytes = this.getNodeParameter('ramBytes', index) as number;
			
			const ramMarket = await getTableRows.call(this, {
				code: 'eosio',
				scope: 'eosio',
				table: 'rammarket',
				limit: 1,
			});
			
			let ramPricePerKb = 0;
			if (ramMarket.rows && ramMarket.rows.length > 0) {
				ramPricePerKb = calculateRamPricePerKb(ramMarket.rows[0]);
			}

			const estimates: any = {};
			
			if (resourceType === 'ram' || resourceType === 'all') {
				estimates.ram = {
					bytes: ramBytes,
					estimated_cost_wax: (ramBytes / 1024 * ramPricePerKb).toFixed(8),
				};
			}

			if (resourceType === 'cpu' || resourceType === 'all') {
				estimates.cpu = {
					note: 'CPU costs depend on staking or powerup rates',
					recommended_stake: '10.00000000 WAX',
				};
			}

			if (resourceType === 'net' || resourceType === 'all') {
				estimates.net = {
					note: 'NET costs depend on staking or powerup rates',
					recommended_stake: '1.00000000 WAX',
				};
			}

			result = estimates;
			break;
		}

		case 'powerup': {
			let account = this.getNodeParameter('account', index) as string;
			const cpuFraction = this.getNodeParameter('cpuFraction', index) as number;
			const netFraction = this.getNodeParameter('netFraction', index) as number;
			const maxPayment = this.getNodeParameter('maxPayment', index) as string;
			
			if (!account) account = configuredAccount;

			const powerupState = await getTableRows.call(this, {
				code: 'eosio',
				scope: 'eosio',
				table: 'powup.state',
				limit: 1,
			});

			const api = await createApi.call(this);
			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'powerup',
				authorization: [{ actor: account, permission: 'active' }],
				data: {
					payer: account,
					receiver: account,
					days: 1,
					net_frac: Math.floor((netFraction / 100) * 1000000000000000),
					cpu_frac: Math.floor((cpuFraction / 100) * 1000000000000000),
					max_payment: maxPayment,
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
export const description = [...resourceOperations, ...resourceFields];
export const execute = executeResourceAction;
