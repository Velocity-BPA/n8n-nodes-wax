import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getAssets } from '../../transport/atomicApi';
import { createApi, executeTransaction, getTableRows, getAccount } from '../../transport/eosClient';
import { getActions } from '../../transport/hyperionClient';

export const gameOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['game'] } },
		options: [
			{ name: 'Get Game Info', value: 'getGameInfo', description: 'Get game contract information', action: 'Get game info' },
			{ name: 'Get Available Games', value: 'getAvailableGames', description: 'Get list of WAX games', action: 'Get available games' },
			{ name: 'Get Game Stats', value: 'getGameStats', description: 'Get game statistics', action: 'Get game stats' },
			{ name: 'Get Player Stats', value: 'getPlayerStats', description: 'Get player statistics', action: 'Get player stats' },
			{ name: 'Get Game Assets', value: 'getGameAssets', description: 'Get game NFT assets', action: 'Get game assets' },
			{ name: 'Execute Game Action', value: 'executeGameAction', description: 'Execute a game action', action: 'Execute game action' },
			{ name: 'Get Leaderboard', value: 'getLeaderboard', description: 'Get game leaderboard', action: 'Get leaderboard' },
			{ name: 'Get Rewards', value: 'getRewards', description: 'Get pending game rewards', action: 'Get rewards' },
			{ name: 'Claim Game Rewards', value: 'claimGameRewards', description: 'Claim game rewards', action: 'Claim game rewards' },
		],
		default: 'getGameInfo',
	},
];

export const gameFields: INodeProperties[] = [
	{
		displayName: 'Game Contract',
		name: 'gameContract',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'alien.worlds or farmersworld',
		description: 'The game contract account',
		displayOptions: { show: { resource: ['game'], operation: ['getGameInfo', 'getGameStats', 'getPlayerStats', 'executeGameAction', 'getLeaderboard', 'getRewards', 'claimGameRewards'] } },
	},
	{
		displayName: 'Game Collection',
		name: 'gameCollection',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'alien.worlds',
		description: 'The game collection name',
		displayOptions: { show: { resource: ['game'], operation: ['getGameAssets'] } },
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Player account (leave empty for configured account)',
		displayOptions: { show: { resource: ['game'], operation: ['getPlayerStats', 'getGameAssets', 'getRewards'] } },
	},
	{
		displayName: 'Action Name',
		name: 'actionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mine',
		description: 'The game action to execute',
		displayOptions: { show: { resource: ['game'], operation: ['executeGameAction'] } },
	},
	{
		displayName: 'Action Data (JSON)',
		name: 'actionData',
		type: 'json',
		default: '{}',
		placeholder: '{"land_id": "1099511627776"}',
		description: 'Action parameters as JSON',
		displayOptions: { show: { resource: ['game'], operation: ['executeGameAction'] } },
	},
	{
		displayName: 'Leaderboard Table',
		name: 'leaderboardTable',
		type: 'string',
		default: 'leaderboard',
		placeholder: 'leaderboard',
		description: 'The leaderboard table name',
		displayOptions: { show: { resource: ['game'], operation: ['getLeaderboard'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['game'], operation: ['getGameAssets', 'getLeaderboard'] } },
	},
];

const POPULAR_GAMES = [
	{ contract: 'alien.worlds', collection: 'alien.worlds', name: 'Alien Worlds', type: 'mining' },
	{ contract: 'm.federation', collection: 'alien.worlds', name: 'Alien Worlds Federation', type: 'governance' },
	{ contract: 'farmersworld', collection: 'farmersworld', name: 'Farmers World', type: 'farming' },
	{ contract: 'rplanet', collection: 'rplanet', name: 'R-Planet', type: 'staking' },
	{ contract: 'prospectorsw', collection: 'prospectors', name: 'Prospectors', type: 'strategy' },
	{ contract: 'bcbrawlers', collection: 'bcbrawlers', name: 'BC Brawlers', type: 'combat' },
	{ contract: 'nftpandawaxp', collection: 'nftpanda', name: 'NFT Panda', type: 'adventure' },
];

export async function executeGameAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getGameInfo': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			const accountInfo = await getAccount.call(this, gameContract);
			const config = await getTableRows.call(this, {
				code: gameContract,
				scope: gameContract,
				table: 'config',
				limit: 1,
			});
			result = {
				contract: gameContract,
				account_info: {
					created: accountInfo.created,
					ram_quota: accountInfo.ram_quota,
					ram_usage: accountInfo.ram_usage,
				},
				config: config.rows[0] || {},
			};
			break;
		}

		case 'getAvailableGames': {
			result = {
				games: POPULAR_GAMES,
				count: POPULAR_GAMES.length,
				note: 'This is a curated list of popular WAX games',
			};
			break;
		}

		case 'getGameStats': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			const stats = await getTableRows.call(this, {
				code: gameContract,
				scope: gameContract,
				table: 'stat',
				limit: 10,
			});
			const config = await getTableRows.call(this, {
				code: gameContract,
				scope: gameContract,
				table: 'config',
				limit: 1,
			});
			result = {
				contract: gameContract,
				stats: stats.rows,
				config: config.rows[0] || {},
			};
			break;
		}

		case 'getPlayerStats': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			const players = await getTableRows.call(this, {
				code: gameContract,
				scope: gameContract,
				table: 'players',
				lower_bound: account,
				upper_bound: account,
				limit: 1,
			});
			const balances = await getTableRows.call(this, {
				code: gameContract,
				scope: account,
				table: 'balances',
				limit: 100,
			});
			result = {
				account,
				contract: gameContract,
				player_data: players.rows[0] || null,
				balances: balances.rows,
			};
			break;
		}

		case 'getGameAssets': {
			const gameCollection = this.getNodeParameter('gameCollection', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			const assets = await getAssets.call(this, {
				owner: account,
				collection_name: gameCollection,
				limit,
			});
			result = {
				account,
				collection: gameCollection,
				assets: assets.data,
				count: assets.data.length,
			};
			break;
		}

		case 'executeGameAction': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			const actionName = this.getNodeParameter('actionName', index) as string;
			const actionData = this.getNodeParameter('actionData', index) as object;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const player = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: gameContract,
				name: actionName,
				authorization: [{ actor: player, permission: 'active' }],
				data: { ...actionData, miner: player, player },
			}]);
			break;
		}

		case 'getLeaderboard': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			const leaderboardTable = this.getNodeParameter('leaderboardTable', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const leaderboard = await getTableRows.call(this, {
				code: gameContract,
				scope: gameContract,
				table: leaderboardTable,
				limit,
			});
			result = {
				contract: gameContract,
				table: leaderboardTable,
				leaderboard: leaderboard.rows,
				count: leaderboard.rows.length,
			};
			break;
		}

		case 'getRewards': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			const rewards = await getTableRows.call(this, {
				code: gameContract,
				scope: account,
				table: 'rewards',
				limit: 100,
			});
			const claims = await getTableRows.call(this, {
				code: gameContract,
				scope: account,
				table: 'claims',
				limit: 100,
			});
			result = {
				account,
				contract: gameContract,
				pending_rewards: rewards.rows,
				claim_history: claims.rows,
			};
			break;
		}

		case 'claimGameRewards': {
			const gameContract = this.getNodeParameter('gameContract', index) as string;
			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const player = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: gameContract,
				name: 'claim',
				authorization: [{ actor: player, permission: 'active' }],
				data: { owner: player, player },
			}]);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...gameOperations, ...gameFields];
export const execute = executeGameAction;
