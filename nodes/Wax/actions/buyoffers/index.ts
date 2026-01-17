import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createApi, getWaxCredentials } from '../../transport/eosClient';
import { getBuyoffers, getBuyoffer } from '../../transport/atomicApi';
import { isValidAccountName } from '../../utils/accountUtils';
import { formatWaxAmount } from '../../utils/assetUtils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
			},
		},
		options: [
			{ name: 'Get Buyoffer Info', value: 'getBuyofferInfo', description: 'Get details about a buyoffer', action: 'Get buyoffer info' },
			{ name: 'Create Buyoffer', value: 'createBuyoffer', description: 'Create a new buyoffer for an asset', action: 'Create buyoffer' },
			{ name: 'Cancel Buyoffer', value: 'cancelBuyoffer', description: 'Cancel a buyoffer', action: 'Cancel buyoffer' },
			{ name: 'Accept Buyoffer', value: 'acceptBuyoffer', description: 'Accept a buyoffer for your asset', action: 'Accept buyoffer' },
			{ name: 'Decline Buyoffer', value: 'declineBuyoffer', description: 'Decline a buyoffer', action: 'Decline buyoffer' },
			{ name: 'Get Buyoffers by Buyer', value: 'getBuyoffersByBuyer', description: 'Get buyoffers made by a buyer', action: 'Get buyoffers by buyer' },
			{ name: 'Get Buyoffers for Asset', value: 'getBuyoffersForAsset', description: 'Get buyoffers for an asset', action: 'Get buyoffers for asset' },
			{ name: 'Get Buyoffers by Collection', value: 'getBuyoffersByCollection', description: 'Get buyoffers in a collection', action: 'Get buyoffers by collection' },
		],
		default: 'getBuyofferInfo',
	},
	{
		displayName: 'Buyoffer ID',
		name: 'buyofferId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['getBuyofferInfo', 'cancelBuyoffer', 'acceptBuyoffer', 'declineBuyoffer'],
			},
		},
		default: '',
		description: 'The unique ID of the buyoffer',
	},
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['createBuyoffer'],
			},
		},
		default: '',
		description: 'Comma-separated list of asset IDs to make an offer on',
	},
	{
		displayName: 'Offer Price (WAX)',
		name: 'offerPrice',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['createBuyoffer'],
			},
		},
		default: '',
		description: 'Offer price in WAXP',
	},
	{
		displayName: 'Memo',
		name: 'memo',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['createBuyoffer'],
			},
		},
		default: '',
		description: 'Optional memo for the buyoffer',
	},
	{
		displayName: 'Buyer Account',
		name: 'buyerAccount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['getBuyoffersByBuyer'],
			},
		},
		default: '',
		description: 'The buyer account to filter by',
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['getBuyoffersForAsset'],
			},
		},
		default: '',
		description: 'The asset ID to get buyoffers for',
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['getBuyoffersByCollection'],
			},
		},
		default: '',
		description: 'The collection name',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['getBuyoffersByBuyer', 'getBuyoffersForAsset', 'getBuyoffersByCollection'],
			},
		},
		default: 100,
		description: 'Maximum number of results',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['buyoffers'],
				operation: ['getBuyoffersByBuyer', 'getBuyoffersForAsset', 'getBuyoffersByCollection'],
			},
		},
		default: 1,
		description: 'Page number',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await getWaxCredentials(this);

	switch (operation) {
		case 'getBuyofferInfo': {
			const buyofferId = this.getNodeParameter('buyofferId', index) as string;
			const buyoffer = await getBuyoffer(credentials, buyofferId);
			return [{ json: buyoffer }];
		}

		case 'createBuyoffer': {
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const offerPrice = this.getNodeParameter('offerPrice', index) as string;
			const memo = this.getNodeParameter('memo', index, '') as string;
			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			const api = await createApi(credentials);
			const quantity = `${formatWaxAmount(parseFloat(offerPrice))} WAX`;

			const result = await api.transact({
				actions: [
					{
						account: 'eosio.token',
						name: 'transfer',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							from: credentials.accountName,
							to: 'atomicmarket',
							quantity,
							memo: 'deposit',
						},
					},
					{
						account: 'atomicmarket',
						name: 'createbuyo',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							buyer: credentials.accountName,
							recipient: credentials.accountName,
							price: quantity,
							asset_ids: assetIds,
							memo,
							maker_marketplace: '',
						},
					},
				],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, buyer: credentials.accountName, assetIds, price: quantity } }];
		}

		case 'cancelBuyoffer': {
			const buyofferId = this.getNodeParameter('buyofferId', index) as string;

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicmarket',
					name: 'cancelbuyo',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						buyoffer_id: buyofferId,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, cancelledBuyofferId: buyofferId } }];
		}

		case 'acceptBuyoffer': {
			const buyofferId = this.getNodeParameter('buyofferId', index) as string;

			const buyoffer = await getBuyoffer(credentials, buyofferId);
			const assetIds = buyoffer.assets?.map((a: { asset_id: string }) => a.asset_id) || [];

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [
					{
						account: 'atomicassets',
						name: 'createoffer',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							sender: credentials.accountName,
							recipient: 'atomicmarket',
							sender_asset_ids: assetIds,
							recipient_asset_ids: [],
							memo: 'buyoffer',
						},
					},
					{
						account: 'atomicmarket',
						name: 'acceptbuyo',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							buyoffer_id: buyofferId,
							expected_asset_ids: assetIds,
							expected_price: buyoffer.price?.amount,
							taker_marketplace: '',
						},
					},
				],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, acceptedBuyofferId: buyofferId, price: buyoffer.price?.amount } }];
		}

		case 'declineBuyoffer': {
			const buyofferId = this.getNodeParameter('buyofferId', index) as string;

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicmarket',
					name: 'declinebuyo',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						buyoffer_id: buyofferId,
						decline_memo: 'Declined',
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, declinedBuyofferId: buyofferId } }];
		}

		case 'getBuyoffersByBuyer': {
			const buyerAccount = this.getNodeParameter('buyerAccount', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const buyoffers = await getBuyoffers(credentials, { buyer: buyerAccount, limit, page });
			return [{ json: { buyer: buyerAccount, buyoffers, count: buyoffers.length } }];
		}

		case 'getBuyoffersForAsset': {
			const assetId = this.getNodeParameter('assetId', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const buyoffers = await getBuyoffers(credentials, { asset_id: assetId, state: '0', limit, page });
			return [{ json: { assetId, buyoffers, count: buyoffers.length } }];
		}

		case 'getBuyoffersByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const buyoffers = await getBuyoffers(credentials, { collection_name: collectionName, limit, page });
			return [{ json: { collection: collectionName, buyoffers, count: buyoffers.length } }];
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
