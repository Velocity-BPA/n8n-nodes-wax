import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createApi, getWaxCredentials } from '../../transport/eosClient';
import { getAssets, getAsset, getAssetLogs, getAccountAssets } from '../../transport/atomicApi';
import { isValidAccountName } from '../../utils/accountUtils';
import { isValidAssetId, parseAsset } from '../../utils/assetUtils';
import { createNftTransferAction } from '../../utils/serializationUtils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
			},
		},
		options: [
			{ name: 'Get Asset Info', value: 'getAssetInfo', description: 'Get detailed info about an NFT asset', action: 'Get asset info' },
			{ name: 'Get Asset Data', value: 'getAssetData', description: 'Get the mutable and immutable data of an asset', action: 'Get asset data' },
			{ name: 'Get Assets by Owner', value: 'getAssetsByOwner', description: 'Get all assets owned by an account', action: 'Get assets by owner' },
			{ name: 'Get Assets by Collection', value: 'getAssetsByCollection', description: 'Get all assets in a collection', action: 'Get assets by collection' },
			{ name: 'Get Assets by Schema', value: 'getAssetsBySchema', description: 'Get all assets in a schema', action: 'Get assets by schema' },
			{ name: 'Get Assets by Template', value: 'getAssetsByTemplate', description: 'Get all assets from a template', action: 'Get assets by template' },
			{ name: 'Transfer Asset', value: 'transferAsset', description: 'Transfer an NFT to another account', action: 'Transfer asset' },
			{ name: 'Batch Transfer Assets', value: 'batchTransfer', description: 'Transfer multiple NFTs at once', action: 'Batch transfer assets' },
			{ name: 'Burn Asset', value: 'burnAsset', description: 'Burn (destroy) an NFT', action: 'Burn asset' },
			{ name: 'Back Asset', value: 'backAsset', description: 'Add tokens to back an NFT', action: 'Back asset' },
			{ name: 'Get Asset History', value: 'getAssetHistory', description: 'Get the transfer and action history of an asset', action: 'Get asset history' },
		],
		default: 'getAssetInfo',
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetInfo', 'getAssetData', 'transferAsset', 'burnAsset', 'backAsset', 'getAssetHistory'],
			},
		},
		default: '',
		description: 'The unique ID of the NFT asset',
	},
	{
		displayName: 'Owner Account',
		name: 'ownerAccount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetsByOwner'],
			},
		},
		default: '',
		description: 'The account that owns the assets',
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetsByCollection', 'getAssetsBySchema'],
			},
		},
		default: '',
		description: 'The collection name (e.g., "alien.worlds")',
	},
	{
		displayName: 'Schema Name',
		name: 'schemaName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetsBySchema'],
			},
		},
		default: '',
		description: 'The schema name',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetsByTemplate'],
			},
		},
		default: '',
		description: 'The template ID',
	},
	{
		displayName: 'To Account',
		name: 'toAccount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['transferAsset', 'batchTransfer'],
			},
		},
		default: '',
		description: 'The recipient account',
	},
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['batchTransfer'],
			},
		},
		default: '',
		description: 'Comma-separated list of asset IDs to transfer',
	},
	{
		displayName: 'Memo',
		name: 'memo',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['transferAsset', 'batchTransfer'],
			},
		},
		default: '',
		description: 'Optional memo for the transfer',
	},
	{
		displayName: 'Back Amount',
		name: 'backAmount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['backAsset'],
			},
		},
		default: '',
		description: 'Amount of WAX to back the asset with (e.g., "1.00000000")',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetsByOwner', 'getAssetsByCollection', 'getAssetsBySchema', 'getAssetsByTemplate'],
			},
		},
		default: 100,
		description: 'Maximum number of assets to return',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['atomicAssets'],
				operation: ['getAssetsByOwner', 'getAssetsByCollection', 'getAssetsBySchema', 'getAssetsByTemplate'],
			},
		},
		default: 1,
		description: 'Page number for pagination',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await getWaxCredentials(this);

	switch (operation) {
		case 'getAssetInfo': {
			const assetId = this.getNodeParameter('assetId', index) as string;

			if (!isValidAssetId(assetId)) {
				throw new NodeOperationError(this.getNode(), `Invalid asset ID: ${assetId}`);
			}

			const asset = await getAsset(credentials, assetId);
			return [{ json: parseAsset(asset) as any }];
		}

		case 'getAssetData': {
			const assetId = this.getNodeParameter('assetId', index) as string;
			const asset = await getAsset(credentials, assetId);

			return [{
				json: {
					assetId,
					immutableData: asset.immutable_data || {},
					mutableData: asset.mutable_data || {},
					templateData: asset.template?.immutable_data || {},
					collection: asset.collection?.collection_name,
					schema: asset.schema?.schema_name,
					templateId: asset.template?.template_id,
				},
			}];
		}

		case 'getAssetsByOwner': {
			const ownerAccount = this.getNodeParameter('ownerAccount', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			if (!isValidAccountName(ownerAccount)) {
				throw new NodeOperationError(this.getNode(), `Invalid account name: ${ownerAccount}`);
			}

			const assets = await getAccountAssets(credentials, ownerAccount, { limit, page });
			return [{ json: { owner: ownerAccount, assets: assets.map(parseAsset), count: assets.length } }];
		}

		case 'getAssetsByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const assets = await getAssets(credentials, { collection_name: collectionName, limit, page });
			return [{ json: { collection: collectionName, assets: assets.map(parseAsset), count: assets.length } }];
		}

		case 'getAssetsBySchema': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const assets = await getAssets(credentials, { collection_name: collectionName, schema_name: schemaName, limit, page });
			return [{ json: { collection: collectionName, schema: schemaName, assets: assets.map(parseAsset), count: assets.length } }];
		}

		case 'getAssetsByTemplate': {
			const templateId = this.getNodeParameter('templateId', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const assets = await getAssets(credentials, { template_id: templateId as any, limit, page });
			return [{ json: { templateId, assets: assets.map(parseAsset), count: assets.length } }];
		}

		case 'transferAsset': {
			const assetId = this.getNodeParameter('assetId', index) as string;
			const toAccount = this.getNodeParameter('toAccount', index) as string;
			const memo = this.getNodeParameter('memo', index, '') as string;

			if (!isValidAccountName(toAccount)) {
				throw new NodeOperationError(this.getNode(), `Invalid recipient account: ${toAccount}`);
			}

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicassets',
					name: 'transfer',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						from: credentials.accountName,
						to: toAccount,
						asset_ids: [assetId],
						memo,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, from: credentials.accountName, to: toAccount, assetId, memo } }];
		}

		case 'batchTransfer': {
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const toAccount = this.getNodeParameter('toAccount', index) as string;
			const memo = this.getNodeParameter('memo', index, '') as string;

			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			if (!isValidAccountName(toAccount)) {
				throw new NodeOperationError(this.getNode(), `Invalid recipient account: ${toAccount}`);
			}

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicassets',
					name: 'transfer',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						from: credentials.accountName,
						to: toAccount,
						asset_ids: assetIds,
						memo,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, from: credentials.accountName, to: toAccount, assetIds, count: assetIds.length, memo } }];
		}

		case 'burnAsset': {
			const assetId = this.getNodeParameter('assetId', index) as string;

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicassets',
					name: 'burnasset',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						asset_owner: credentials.accountName,
						asset_id: assetId,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, burnedAssetId: assetId } }];
		}

		case 'backAsset': {
			const assetId = this.getNodeParameter('assetId', index) as string;
			const backAmount = this.getNodeParameter('backAmount', index) as string;

			const api = await createApi(credentials);
			const quantity = `${parseFloat(backAmount).toFixed(8)} WAX`;

			const result = await api.transact({
				actions: [{
					account: 'eosio.token',
					name: 'transfer',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						from: credentials.accountName,
						to: 'atomicassets',
						quantity,
						memo: `deposit:${assetId}`,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, assetId, backedAmount: quantity } }];
		}

		case 'getAssetHistory': {
			const assetId = this.getNodeParameter('assetId', index) as string;
			const logs = await getAssetLogs(credentials, assetId);
			return [{ json: { assetId, history: logs } }];
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
