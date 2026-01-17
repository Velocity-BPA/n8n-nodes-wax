import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createApi, executeTransaction, getTableRows, getAccount } from '../../transport/eosClient';
import { isValidAssetId } from '../../utils/assetUtils';

export const stakingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['staking'] } },
		options: [
			{ name: 'Get Staking Info', value: 'getStakingInfo', description: 'Get staking pool information', action: 'Get staking info' },
			{ name: 'Stake NFT', value: 'stakeNft', description: 'Stake an NFT', action: 'Stake NFT' },
			{ name: 'Unstake NFT', value: 'unstakeNft', description: 'Unstake an NFT', action: 'Unstake NFT' },
			{ name: 'Get Staked NFTs', value: 'getStakedNfts', description: 'Get staked NFTs for account', action: 'Get staked NFTs' },
			{ name: 'Get Staking Rewards', value: 'getStakingRewards', description: 'Get pending rewards', action: 'Get staking rewards' },
			{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim staking rewards', action: 'Claim rewards' },
			{ name: 'Get Staking Pools', value: 'getStakingPools', description: 'Get available staking pools', action: 'Get staking pools' },
			{ name: 'Get Pool Info', value: 'getPoolInfo', description: 'Get specific pool details', action: 'Get pool info' },
			{ name: 'Stake CPU/NET', value: 'stakeCpuNet', description: 'Stake WAXP for CPU/NET', action: 'Stake CPU NET' },
			{ name: 'Unstake CPU/NET', value: 'unstakeCpuNet', description: 'Unstake WAXP from CPU/NET', action: 'Unstake CPU NET' },
		],
		default: 'getStakingInfo',
	},
];

export const stakingFields: INodeProperties[] = [
	{
		displayName: 'Staking Contract',
		name: 'stakingContract',
		type: 'string',
		required: true,
		default: '',
		placeholder: 's.rplanet',
		description: 'The staking contract account',
		displayOptions: { show: { resource: ['staking'], operation: ['getStakingInfo', 'stakeNft', 'unstakeNft', 'getStakedNfts', 'getStakingRewards', 'claimRewards', 'getStakingPools', 'getPoolInfo'] } },
	},
	{
		displayName: 'Pool ID',
		name: 'poolId',
		type: 'string',
		default: '',
		placeholder: '1',
		description: 'The staking pool ID',
		displayOptions: { show: { resource: ['staking'], operation: ['getPoolInfo', 'stakeNft'] } },
	},
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1099511627776,1099511627777',
		description: 'Comma-separated asset IDs to stake/unstake',
		displayOptions: { show: { resource: ['staking'], operation: ['stakeNft', 'unstakeNft'] } },
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to check (leave empty for configured account)',
		displayOptions: { show: { resource: ['staking'], operation: ['getStakedNfts', 'getStakingRewards'] } },
	},
	{
		displayName: 'Stake CPU',
		name: 'stakeCpu',
		type: 'string',
		default: '1.00000000 WAX',
		placeholder: '1.00000000 WAX',
		description: 'Amount to stake for CPU',
		displayOptions: { show: { resource: ['staking'], operation: ['stakeCpuNet'] } },
	},
	{
		displayName: 'Stake NET',
		name: 'stakeNet',
		type: 'string',
		default: '1.00000000 WAX',
		placeholder: '1.00000000 WAX',
		description: 'Amount to stake for NET',
		displayOptions: { show: { resource: ['staking'], operation: ['stakeCpuNet'] } },
	},
	{
		displayName: 'Unstake CPU',
		name: 'unstakeCpu',
		type: 'string',
		default: '1.00000000 WAX',
		placeholder: '1.00000000 WAX',
		description: 'Amount to unstake from CPU',
		displayOptions: { show: { resource: ['staking'], operation: ['unstakeCpuNet'] } },
	},
	{
		displayName: 'Unstake NET',
		name: 'unstakeNet',
		type: 'string',
		default: '1.00000000 WAX',
		placeholder: '1.00000000 WAX',
		description: 'Amount to unstake from NET',
		displayOptions: { show: { resource: ['staking'], operation: ['unstakeCpuNet'] } },
	},
	{
		displayName: 'Receiver',
		name: 'receiver',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to receive staked resources (leave empty for self)',
		displayOptions: { show: { resource: ['staking'], operation: ['stakeCpuNet', 'unstakeCpuNet'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['staking'], operation: ['getStakedNfts', 'getStakingPools'] } },
	},
];

export async function executeStakingAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getStakingInfo': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			const config = await getTableRows.call(this, {
				code: stakingContract,
				scope: stakingContract,
				table: 'config',
				limit: 1,
			});
			const pools = await getTableRows.call(this, {
				code: stakingContract,
				scope: stakingContract,
				table: 'pools',
				limit: 100,
			});
			result = {
				contract: stakingContract,
				config: config.rows[0] || {},
				pools_count: pools.rows.length,
				pools: pools.rows,
			};
			break;
		}

		case 'stakeNft': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			const poolId = this.getNodeParameter('poolId', index) as string;
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			for (const id of assetIds) {
				if (!isValidAssetId(id)) throw new Error(`Invalid asset ID: ${id}`);
			}

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const staker = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'transfer',
				authorization: [{ actor: staker, permission: 'active' }],
				data: {
					from: staker,
					to: stakingContract,
					asset_ids: assetIds,
					memo: poolId ? `stake:${poolId}` : 'stake',
				},
			}]);
			break;
		}

		case 'unstakeNft': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const staker = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: stakingContract,
				name: 'unstake',
				authorization: [{ actor: staker, permission: 'active' }],
				data: {
					owner: staker,
					asset_ids: assetIds,
				},
			}]);
			break;
		}

		case 'getStakedNfts': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			const staked = await getTableRows.call(this, {
				code: stakingContract,
				scope: account,
				table: 'stakes',
				limit,
			});
			result = {
				account,
				contract: stakingContract,
				staked_assets: staked.rows,
				count: staked.rows.length,
			};
			break;
		}

		case 'getStakingRewards': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			const rewards = await getTableRows.call(this, {
				code: stakingContract,
				scope: account,
				table: 'rewards',
				limit: 100,
			});
			result = {
				account,
				contract: stakingContract,
				pending_rewards: rewards.rows,
			};
			break;
		}

		case 'claimRewards': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const claimer = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: stakingContract,
				name: 'claim',
				authorization: [{ actor: claimer, permission: 'active' }],
				data: { owner: claimer },
			}]);
			break;
		}

		case 'getStakingPools': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const pools = await getTableRows.call(this, {
				code: stakingContract,
				scope: stakingContract,
				table: 'pools',
				limit,
			});
			result = {
				contract: stakingContract,
				pools: pools.rows,
				count: pools.rows.length,
			};
			break;
		}

		case 'getPoolInfo': {
			const stakingContract = this.getNodeParameter('stakingContract', index) as string;
			const poolId = this.getNodeParameter('poolId', index) as string;
			const pools = await getTableRows.call(this, {
				code: stakingContract,
				scope: stakingContract,
				table: 'pools',
				lower_bound: poolId,
				upper_bound: poolId,
				limit: 1,
			});
			if (!pools.rows || pools.rows.length === 0) {
				throw new Error(`Pool ${poolId} not found`);
			}
			result = pools.rows[0];
			break;
		}

		case 'stakeCpuNet': {
			const stakeCpu = this.getNodeParameter('stakeCpu', index) as string;
			const stakeNet = this.getNodeParameter('stakeNet', index) as string;
			let receiver = this.getNodeParameter('receiver', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const from = credentials.accountName as string;
			if (!receiver) receiver = from;

			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'delegatebw',
				authorization: [{ actor: from, permission: 'active' }],
				data: {
					from,
					receiver,
					stake_net_quantity: stakeNet,
					stake_cpu_quantity: stakeCpu,
					transfer: false,
				},
			}]);
			break;
		}

		case 'unstakeCpuNet': {
			const unstakeCpu = this.getNodeParameter('unstakeCpu', index) as string;
			const unstakeNet = this.getNodeParameter('unstakeNet', index) as string;
			let receiver = this.getNodeParameter('receiver', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const from = credentials.accountName as string;
			if (!receiver) receiver = from;

			result = await executeTransaction.call(this, api, [{
				account: 'eosio',
				name: 'undelegatebw',
				authorization: [{ actor: from, permission: 'active' }],
				data: {
					from,
					receiver,
					unstake_net_quantity: unstakeNet,
					unstake_cpu_quantity: unstakeCpu,
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
export const description = [...stakingOperations, ...stakingFields];
export const execute = executeStakingAction;
