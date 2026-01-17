import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { atomicAssetsRequest } from '../../transport/atomicApi';
import { createApi, executeTransaction, getTableRows } from '../../transport/eosClient';

export const dropsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['drops'] } },
		options: [
			{ name: 'Get Drop Info', value: 'getDropInfo', description: 'Get drop details', action: 'Get drop info' },
			{ name: 'Get Active Drops', value: 'getActiveDrops', description: 'Get currently active drops', action: 'Get active drops' },
			{ name: 'Claim Drop', value: 'claimDrop', description: 'Claim assets from a drop', action: 'Claim drop' },
			{ name: 'Get Drop Claims', value: 'getDropClaims', description: 'Get claims for a drop', action: 'Get drop claims' },
			{ name: 'Get Drops by Collection', value: 'getDropsByCollection', description: 'Get drops for a collection', action: 'Get drops by collection' },
			{ name: 'Get Drop Statistics', value: 'getDropStatistics', description: 'Get drop statistics', action: 'Get drop statistics' },
			{ name: 'Check Drop Eligibility', value: 'checkDropEligibility', description: 'Check if account can claim drop', action: 'Check drop eligibility' },
		],
		default: 'getDropInfo',
	},
];

export const dropsFields: INodeProperties[] = [
	{
		displayName: 'Drop ID',
		name: 'dropId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The drop ID',
		displayOptions: { show: { resource: ['drops'], operation: ['getDropInfo', 'claimDrop', 'getDropClaims', 'getDropStatistics', 'checkDropEligibility'] } },
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'The collection name',
		displayOptions: { show: { resource: ['drops'], operation: ['getDropsByCollection'] } },
	},
	{
		displayName: 'Claim Amount',
		name: 'claimAmount',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 1,
		description: 'Number of assets to claim',
		displayOptions: { show: { resource: ['drops'], operation: ['claimDrop'] } },
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to check eligibility for (leave empty for configured account)',
		displayOptions: { show: { resource: ['drops'], operation: ['checkDropEligibility'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['drops'], operation: ['getActiveDrops', 'getDropsByCollection', 'getDropClaims'] } },
	},
];

export async function executeDropsAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getDropInfo': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			const drops = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: 'atomicdropsx',
				table: 'drops',
				lower_bound: dropId,
				upper_bound: dropId,
				limit: 1,
			});
			if (!drops.rows || drops.rows.length === 0) {
				throw new Error(`Drop ${dropId} not found`);
			}
			result = drops.rows[0];
			break;
		}

		case 'getActiveDrops': {
			const limit = this.getNodeParameter('limit', index) as number;
			const now = Math.floor(Date.now() / 1000);
			const drops = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: 'atomicdropsx',
				table: 'drops',
				limit: limit * 2,
			});
			result = {
				drops: drops.rows.filter((drop: any) => {
					const startTime = parseInt(drop.start_time);
					const endTime = parseInt(drop.end_time);
					return (startTime === 0 || startTime <= now) && (endTime === 0 || endTime > now) && parseInt(drop.current_claimed) < parseInt(drop.max_claimable);
				}).slice(0, limit),
			};
			break;
		}

		case 'claimDrop': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			const claimAmount = this.getNodeParameter('claimAmount', index) as number;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const claimer = credentials.accountName as string;

			const drops = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: 'atomicdropsx',
				table: 'drops',
				lower_bound: dropId,
				upper_bound: dropId,
				limit: 1,
			});

			if (!drops.rows || drops.rows.length === 0) {
				throw new Error(`Drop ${dropId} not found`);
			}

			const drop = drops.rows[0];
			const listingPrice = drop.listing_price;
			const actions: any[] = [];

			if (listingPrice && listingPrice !== '0 NULL' && listingPrice !== '0.00000000 WAX') {
				actions.push({
					account: 'eosio.token',
					name: 'transfer',
					authorization: [{ actor: claimer, permission: 'active' }],
					data: {
						from: claimer,
						to: 'atomicdropsx',
						quantity: listingPrice,
						memo: `deposit`,
					},
				});
			}

			actions.push({
				account: 'atomicdropsx',
				name: 'claimdrop',
				authorization: [{ actor: claimer, permission: 'active' }],
				data: {
					drop_id: parseInt(dropId),
					claimer,
					intended_delphi_median: 0,
					amount: claimAmount,
					referrer: '',
				},
			});

			result = await executeTransaction.call(this, api, actions);
			break;
		}

		case 'getDropClaims': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const claims = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: dropId,
				table: 'claims',
				limit,
			});
			result = { drop_id: dropId, claims: claims.rows };
			break;
		}

		case 'getDropsByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const drops = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: 'atomicdropsx',
				table: 'drops',
				limit: 1000,
			});
			result = {
				collection: collectionName,
				drops: drops.rows.filter((drop: any) => drop.collection_name === collectionName).slice(0, limit),
			};
			break;
		}

		case 'getDropStatistics': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			const drops = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: 'atomicdropsx',
				table: 'drops',
				lower_bound: dropId,
				upper_bound: dropId,
				limit: 1,
			});
			if (!drops.rows || drops.rows.length === 0) {
				throw new Error(`Drop ${dropId} not found`);
			}
			const drop = drops.rows[0];
			result = {
				drop_id: dropId,
				collection_name: drop.collection_name,
				current_claimed: drop.current_claimed,
				max_claimable: drop.max_claimable,
				remaining: parseInt(drop.max_claimable) - parseInt(drop.current_claimed),
				percent_claimed: ((parseInt(drop.current_claimed) / parseInt(drop.max_claimable)) * 100).toFixed(2) + '%',
				listing_price: drop.listing_price,
				start_time: drop.start_time,
				end_time: drop.end_time,
			};
			break;
		}

		case 'checkDropEligibility': {
			const dropId = this.getNodeParameter('dropId', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}

			const drops = await getTableRows.call(this, {
				code: 'atomicdropsx',
				scope: 'atomicdropsx',
				table: 'drops',
				lower_bound: dropId,
				upper_bound: dropId,
				limit: 1,
			});

			if (!drops.rows || drops.rows.length === 0) {
				throw new Error(`Drop ${dropId} not found`);
			}

			const drop = drops.rows[0];
			const now = Math.floor(Date.now() / 1000);
			const startTime = parseInt(drop.start_time);
			const endTime = parseInt(drop.end_time);
			const currentClaimed = parseInt(drop.current_claimed);
			const maxClaimable = parseInt(drop.max_claimable);

			const eligibility = {
				account,
				drop_id: dropId,
				is_active: (startTime === 0 || startTime <= now) && (endTime === 0 || endTime > now),
				has_supply: currentClaimed < maxClaimable,
				remaining_supply: maxClaimable - currentClaimed,
				listing_price: drop.listing_price,
				eligible: false,
				reason: '',
			};

			if (!eligibility.is_active) {
				eligibility.reason = 'Drop is not currently active';
			} else if (!eligibility.has_supply) {
				eligibility.reason = 'Drop is sold out';
			} else {
				eligibility.eligible = true;
				eligibility.reason = 'Eligible to claim';
			}

			result = eligibility;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...dropsOperations, ...dropsFields];
export const execute = executeDropsAction;
