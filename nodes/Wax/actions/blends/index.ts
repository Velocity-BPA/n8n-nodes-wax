import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getAssets } from '../../transport/atomicApi';
import { createApi, executeTransaction, getTableRows } from '../../transport/eosClient';

export const blendsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['blends'] } },
		options: [
			{ name: 'Get Blend Info', value: 'getBlendInfo', description: 'Get blend configuration', action: 'Get blend info' },
			{ name: 'Get Active Blends', value: 'getActiveBlends', description: 'Get all active blends', action: 'Get active blends' },
			{ name: 'Execute Blend', value: 'executeBlend', description: 'Execute a blend recipe', action: 'Execute blend' },
			{ name: 'Get Blend Ingredients', value: 'getBlendIngredients', description: 'Get required ingredients', action: 'Get blend ingredients' },
			{ name: 'Get Blend Results', value: 'getBlendResults', description: 'Get possible blend outputs', action: 'Get blend results' },
			{ name: 'Get Blends by Collection', value: 'getBlendsByCollection', description: 'Get blends for collection', action: 'Get blends by collection' },
			{ name: 'Get User Blends', value: 'getUserBlends', description: 'Get blend history for account', action: 'Get user blends' },
			{ name: 'Check Blend Eligibility', value: 'checkBlendEligibility', description: 'Check if account can execute blend', action: 'Check blend eligibility' },
		],
		default: 'getBlendInfo',
	},
];

export const blendsFields: INodeProperties[] = [
	{
		displayName: 'Blend ID',
		name: 'blendId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The blend ID',
		displayOptions: { show: { resource: ['blends'], operation: ['getBlendInfo', 'executeBlend', 'getBlendIngredients', 'getBlendResults', 'checkBlendEligibility'] } },
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'The collection name',
		displayOptions: { show: { resource: ['blends'], operation: ['getBlendsByCollection'] } },
	},
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1099511627776,1099511627777',
		description: 'Comma-separated asset IDs to use in blend',
		displayOptions: { show: { resource: ['blends'], operation: ['executeBlend'] } },
	},
	{
		displayName: 'Account',
		name: 'account',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Account to check (leave empty for configured account)',
		displayOptions: { show: { resource: ['blends'], operation: ['getUserBlends', 'checkBlendEligibility'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['blends'], operation: ['getActiveBlends', 'getBlendsByCollection', 'getUserBlends'] } },
	},
];

export async function executeBlendsAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getBlendInfo': {
			const blendId = this.getNodeParameter('blendId', index) as string;
			const blends = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: 'blenderizerx',
				table: 'blends',
				lower_bound: blendId,
				upper_bound: blendId,
				limit: 1,
			});
			if (!blends.rows || blends.rows.length === 0) {
				throw new Error(`Blend ${blendId} not found`);
			}
			result = blends.rows[0];
			break;
		}

		case 'getActiveBlends': {
			const limit = this.getNodeParameter('limit', index) as number;
			const now = Math.floor(Date.now() / 1000);
			const blends = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: 'blenderizerx',
				table: 'blends',
				limit: limit * 2,
			});
			result = {
				blends: blends.rows.filter((b: any) => {
					const startTime = parseInt(b.start_time || '0');
					const endTime = parseInt(b.end_time || '0');
					return (startTime === 0 || startTime <= now) && (endTime === 0 || endTime > now);
				}).slice(0, limit),
			};
			break;
		}

		case 'executeBlend': {
			const blendId = this.getNodeParameter('blendId', index) as string;
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const blender = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [
				{
					account: 'atomicassets',
					name: 'transfer',
					authorization: [{ actor: blender, permission: 'active' }],
					data: {
						from: blender,
						to: 'blenderizerx',
						asset_ids: assetIds,
						memo: `blend:${blendId}`,
					},
				},
			]);
			break;
		}

		case 'getBlendIngredients': {
			const blendId = this.getNodeParameter('blendId', index) as string;
			const blends = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: 'blenderizerx',
				table: 'blends',
				lower_bound: blendId,
				upper_bound: blendId,
				limit: 1,
			});
			if (!blends.rows || blends.rows.length === 0) {
				throw new Error(`Blend ${blendId} not found`);
			}
			const blend = blends.rows[0];
			result = {
				blend_id: blendId,
				collection_name: blend.collection_name,
				ingredients: blend.ingredients || [],
				ingredient_count: (blend.ingredients || []).length,
			};
			break;
		}

		case 'getBlendResults': {
			const blendId = this.getNodeParameter('blendId', index) as string;
			const blends = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: 'blenderizerx',
				table: 'blends',
				lower_bound: blendId,
				upper_bound: blendId,
				limit: 1,
			});
			if (!blends.rows || blends.rows.length === 0) {
				throw new Error(`Blend ${blendId} not found`);
			}
			const blend = blends.rows[0];
			const totalOdds = (blend.results || []).reduce((sum: number, r: any) => sum + parseInt(r.odds || '0'), 0);
			result = {
				blend_id: blendId,
				collection_name: blend.collection_name,
				results: (blend.results || []).map((r: any) => ({
					...r,
					percentage: totalOdds > 0 ? ((parseInt(r.odds || '0') / totalOdds) * 100).toFixed(2) + '%' : 'N/A',
				})),
				total_outcomes: (blend.results || []).length,
			};
			break;
		}

		case 'getBlendsByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const blends = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: 'blenderizerx',
				table: 'blends',
				limit: 1000,
			});
			const collectionBlends = blends.rows
				.filter((b: any) => b.collection_name === collectionName)
				.slice(0, limit);
			result = {
				collection: collectionName,
				blends: collectionBlends,
				count: collectionBlends.length,
			};
			break;
		}

		case 'getUserBlends': {
			let account = this.getNodeParameter('account', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}
			const counters = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: account,
				table: 'counters',
				limit,
			});
			result = {
				account,
				blend_history: counters.rows,
				total_blends: counters.rows.reduce((sum: number, c: any) => sum + parseInt(c.counter || '0'), 0),
			};
			break;
		}

		case 'checkBlendEligibility': {
			const blendId = this.getNodeParameter('blendId', index) as string;
			let account = this.getNodeParameter('account', index) as string;
			if (!account) {
				const credentials = await this.getCredentials('waxNetwork');
				account = credentials.accountName as string;
			}

			const blends = await getTableRows.call(this, {
				code: 'blenderizerx',
				scope: 'blenderizerx',
				table: 'blends',
				lower_bound: blendId,
				upper_bound: blendId,
				limit: 1,
			});

			if (!blends.rows || blends.rows.length === 0) {
				throw new Error(`Blend ${blendId} not found`);
			}

			const blend = blends.rows[0];
			const now = Math.floor(Date.now() / 1000);
			const startTime = parseInt(blend.start_time || '0');
			const endTime = parseInt(blend.end_time || '0');
			const isActive = (startTime === 0 || startTime <= now) && (endTime === 0 || endTime > now);

			const assets = await getAssets.call(this, {
				owner: account,
				collection_name: blend.collection_name,
				limit: 1000,
			});

			const ingredientsMet: { template_id: string; required: number; owned: number; met: boolean }[] = [];
			for (const ing of (blend.ingredients || [])) {
				const templateId = ing.template_id?.toString() || '0';
				const required = parseInt(ing.amount || '1');
				const owned = assets.data.filter((a: any) => a.template?.template_id?.toString() === templateId).length;
				ingredientsMet.push({
					template_id: templateId,
					required,
					owned,
					met: owned >= required,
				});
			}

			const allIngredientsMet = ingredientsMet.every(i => i.met);

			result = {
				account,
				blend_id: blendId,
				collection_name: blend.collection_name,
				is_active: isActive,
				ingredients_check: ingredientsMet,
				all_ingredients_met: allIngredientsMet,
				eligible: isActive && allIngredientsMet,
				reason: !isActive ? 'Blend is not active' : !allIngredientsMet ? 'Missing required ingredients' : 'Eligible to blend',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...blendsOperations, ...blendsFields];
export const execute = executeBlendsAction;
