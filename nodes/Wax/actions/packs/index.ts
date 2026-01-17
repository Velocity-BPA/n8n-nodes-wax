import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getAssets } from '../../transport/atomicApi';
import { createApi, executeTransaction, getTableRows } from '../../transport/eosClient';
import { isValidAssetId } from '../../utils/assetUtils';

export const packsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['packs'] } },
		options: [
			{ name: 'Get Pack Info', value: 'getPackInfo', description: 'Get pack configuration', action: 'Get pack info' },
			{ name: 'Open Pack', value: 'openPack', description: 'Open a pack to reveal contents', action: 'Open pack' },
			{ name: 'Get Pack Contents', value: 'getPackContents', description: 'Get possible pack contents', action: 'Get pack contents' },
			{ name: 'Get Unopened Packs', value: 'getUnopenedPacks', description: 'Get unopened packs for account', action: 'Get unopened packs' },
			{ name: 'Get Pack Odds', value: 'getPackOdds', description: 'Get odds for pack outcomes', action: 'Get pack odds' },
			{ name: 'Get Packs by Collection', value: 'getPacksByCollection', description: 'Get all pack types in collection', action: 'Get packs by collection' },
		],
		default: 'getPackInfo',
	},
];

export const packsFields: INodeProperties[] = [
	{
		displayName: 'Pack ID',
		name: 'packId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The pack configuration ID',
		displayOptions: { show: { resource: ['packs'], operation: ['getPackInfo', 'getPackContents', 'getPackOdds'] } },
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1099511627776',
		description: 'The pack asset ID to open',
		displayOptions: { show: { resource: ['packs'], operation: ['openPack'] } },
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'The collection name',
		displayOptions: { show: { resource: ['packs'], operation: ['getUnopenedPacks', 'getPacksByCollection'] } },
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to check (leave empty for configured account)',
		displayOptions: { show: { resource: ['packs'], operation: ['getUnopenedPacks'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['packs'], operation: ['getUnopenedPacks', 'getPacksByCollection'] } },
	},
];

export async function executePacksAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getPackInfo': {
			const packId = this.getNodeParameter('packId', index) as string;
			const packs = await getTableRows.call(this, {
				code: 'atomicpacksx',
				scope: 'atomicpacksx',
				table: 'packs',
				lower_bound: packId,
				upper_bound: packId,
				limit: 1,
			});
			if (!packs.rows || packs.rows.length === 0) {
				throw new Error(`Pack ${packId} not found`);
			}
			result = packs.rows[0];
			break;
		}

		case 'openPack': {
			const assetId = this.getNodeParameter('assetId', index) as string;
			if (!isValidAssetId(assetId)) throw new Error(`Invalid asset ID: ${assetId}`);

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const opener = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [
				{
					account: 'atomicassets',
					name: 'transfer',
					authorization: [{ actor: opener, permission: 'active' }],
					data: {
						from: opener,
						to: 'atomicpacksx',
						asset_ids: [assetId],
						memo: 'unbox',
					},
				},
			]);
			break;
		}

		case 'getPackContents': {
			const packId = this.getNodeParameter('packId', index) as string;
			const outcomes = await getTableRows.call(this, {
				code: 'atomicpacksx',
				scope: packId,
				table: 'outcomes',
				limit: 100,
			});
			result = {
				pack_id: packId,
				outcomes: outcomes.rows,
				total_outcomes: outcomes.rows.length,
			};
			break;
		}

		case 'getUnopenedPacks': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}

			const packs = await getTableRows.call(this, {
				code: 'atomicpacksx',
				scope: 'atomicpacksx',
				table: 'packs',
				limit: 1000,
			});

			const packTemplateIds = packs.rows
				.filter((p: any) => p.collection_name === collectionName)
				.map((p: any) => p.pack_template_id.toString());

			if (packTemplateIds.length === 0) {
				result = { account, collection: collectionName, unopened_packs: [], count: 0 };
				break;
			}

			const assets = await getAssets.call(this, {
				owner: account,
				collection_name: collectionName,
				template_id: packTemplateIds.join(','),
				limit,
			});

			result = {
				account,
				collection: collectionName,
				unopened_packs: assets.data,
				count: assets.data.length,
			};
			break;
		}

		case 'getPackOdds': {
			const packId = this.getNodeParameter('packId', index) as string;
			
			const pack = await getTableRows.call(this, {
				code: 'atomicpacksx',
				scope: 'atomicpacksx',
				table: 'packs',
				lower_bound: packId,
				upper_bound: packId,
				limit: 1,
			});

			if (!pack.rows || pack.rows.length === 0) {
				throw new Error(`Pack ${packId} not found`);
			}

			const outcomes = await getTableRows.call(this, {
				code: 'atomicpacksx',
				scope: packId,
				table: 'outcomes',
				limit: 100,
			});

			const totalOdds = outcomes.rows.reduce((sum: number, o: any) => sum + parseInt(o.odds), 0);
			
			result = {
				pack_id: packId,
				collection_name: pack.rows[0].collection_name,
				display_data: pack.rows[0].display_data,
				outcomes: outcomes.rows.map((o: any) => ({
					...o,
					percentage: ((parseInt(o.odds) / totalOdds) * 100).toFixed(2) + '%',
				})),
				total_odds: totalOdds,
			};
			break;
		}

		case 'getPacksByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			
			const packs = await getTableRows.call(this, {
				code: 'atomicpacksx',
				scope: 'atomicpacksx',
				table: 'packs',
				limit: 1000,
			});

			const collectionPacks = packs.rows
				.filter((p: any) => p.collection_name === collectionName)
				.slice(0, limit);

			result = {
				collection: collectionName,
				packs: collectionPacks,
				count: collectionPacks.length,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...packsOperations, ...packsFields];
export const execute = executePacksAction;
