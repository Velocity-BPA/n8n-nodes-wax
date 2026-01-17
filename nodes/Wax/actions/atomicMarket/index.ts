import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createApi, getWaxCredentials } from '../../transport/eosClient';
import { getSales, getSale, getSaleLogs, getMarketStats, getSuggestedPrice } from '../../transport/atomicApi';
import { isValidAccountName } from '../../utils/accountUtils';
import { isValidAssetId, parseSale, formatWaxAmount } from '../../utils/assetUtils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
			},
		},
		options: [
			{ name: 'Get Sale Info', value: 'getSaleInfo', description: 'Get details about a sale listing', action: 'Get sale info' },
			{ name: 'Create Sale', value: 'createSale', description: 'List an NFT for sale', action: 'Create sale' },
			{ name: 'Cancel Sale', value: 'cancelSale', description: 'Cancel a sale listing', action: 'Cancel sale' },
			{ name: 'Purchase Asset', value: 'purchaseAsset', description: 'Buy an NFT from a sale', action: 'Purchase asset' },
			{ name: 'Get Active Sales', value: 'getActiveSales', description: 'Get all active sales', action: 'Get active sales' },
			{ name: 'Get Sales by Seller', value: 'getSalesBySeller', description: 'Get all sales by a seller', action: 'Get sales by seller' },
			{ name: 'Get Sales by Collection', value: 'getSalesByCollection', description: 'Get all sales in a collection', action: 'Get sales by collection' },
			{ name: 'Get Recent Sales', value: 'getRecentSales', description: 'Get recently completed sales', action: 'Get recent sales' },
			{ name: 'Get Market Stats', value: 'getMarketStats', description: 'Get marketplace statistics', action: 'Get market stats' },
			{ name: 'Get Suggested Price', value: 'getSuggestedPrice', description: 'Get suggested price for a template', action: 'Get suggested price' },
			{ name: 'Search Sales', value: 'searchSales', description: 'Search for sales with filters', action: 'Search sales' },
		],
		default: 'getSaleInfo',
	},
	{
		displayName: 'Sale ID',
		name: 'saleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getSaleInfo', 'cancelSale', 'purchaseAsset'],
			},
		},
		default: '',
		description: 'The unique ID of the sale',
	},
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['createSale'],
			},
		},
		default: '',
		description: 'Comma-separated list of asset IDs to list for sale',
	},
	{
		displayName: 'Price (WAX)',
		name: 'price',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['createSale'],
			},
		},
		default: '',
		description: 'Sale price in WAXP (e.g., "10.00000000")',
	},
	{
		displayName: 'Seller Account',
		name: 'sellerAccount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getSalesBySeller'],
			},
		},
		default: '',
		description: 'The seller account to filter by',
	},
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getSalesByCollection', 'getMarketStats'],
			},
		},
		default: '',
		description: 'The collection name',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getSuggestedPrice'],
			},
		},
		default: '',
		description: 'The template ID to get suggested price for',
	},
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['searchSales'],
			},
		},
		default: '',
		description: 'Search query for asset name or data',
	},
	{
		displayName: 'Min Price',
		name: 'minPrice',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['searchSales', 'getActiveSales'],
			},
		},
		default: '',
		description: 'Minimum price filter in WAX',
	},
	{
		displayName: 'Max Price',
		name: 'maxPrice',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['searchSales', 'getActiveSales'],
			},
		},
		default: '',
		description: 'Maximum price filter in WAX',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getActiveSales', 'getSalesBySeller', 'getSalesByCollection', 'getRecentSales', 'searchSales'],
			},
		},
		default: 100,
		description: 'Maximum number of results to return',
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getActiveSales', 'getSalesBySeller', 'getSalesByCollection', 'getRecentSales', 'searchSales'],
			},
		},
		default: 1,
		description: 'Page number for pagination',
	},
	{
		displayName: 'Sort',
		name: 'sort',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['atomicMarket'],
				operation: ['getActiveSales', 'getSalesBySeller', 'getSalesByCollection', 'searchSales'],
			},
		},
		options: [
			{ name: 'Created (Newest)', value: 'created_desc' },
			{ name: 'Created (Oldest)', value: 'created_asc' },
			{ name: 'Price (Low to High)', value: 'price_asc' },
			{ name: 'Price (High to Low)', value: 'price_desc' },
			{ name: 'Template Mint (Low)', value: 'template_mint_asc' },
			{ name: 'Template Mint (High)', value: 'template_mint_desc' },
		],
		default: 'created_desc',
		description: 'Sort order for results',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await getWaxCredentials(this);

	switch (operation) {
		case 'getSaleInfo': {
			const saleId = this.getNodeParameter('saleId', index) as string;
			const sale = await getSale(credentials, saleId);
			return [{ json: parseSale(sale) as any }];
		}

		case 'createSale': {
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const price = this.getNodeParameter('price', index) as string;
			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			const api = await createApi(credentials);
			const priceAmount = Math.round(parseFloat(price) * 100000000);

			const result = await api.transact({
				actions: [
					{
						account: 'atomicmarket',
						name: 'announcesale',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							seller: credentials.accountName,
							asset_ids: assetIds,
							listing_price: `${formatWaxAmount(parseFloat(price))} WAX`,
							settlement_symbol: '8,WAX',
							maker_marketplace: '',
						},
					},
					{
						account: 'atomicassets',
						name: 'createoffer',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							sender: credentials.accountName,
							recipient: 'atomicmarket',
							sender_asset_ids: assetIds,
							recipient_asset_ids: [],
							memo: 'sale',
						},
					},
				],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, seller: credentials.accountName, assetIds, price: `${price} WAX` } }];
		}

		case 'cancelSale': {
			const saleId = this.getNodeParameter('saleId', index) as string;

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicmarket',
					name: 'cancelsale',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						sale_id: saleId,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, cancelledSaleId: saleId } }];
		}

		case 'purchaseAsset': {
			const saleId = this.getNodeParameter('saleId', index) as string;

			const sale = await getSale(credentials, saleId);
			const api = await createApi(credentials);

			const result = await api.transact({
				actions: [
					{
						account: 'eosio.token',
						name: 'transfer',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							from: credentials.accountName,
							to: 'atomicmarket',
							quantity: sale.price.amount,
							memo: 'deposit',
						},
					},
					{
						account: 'atomicmarket',
						name: 'purchasesale',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							buyer: credentials.accountName,
							sale_id: saleId,
							intended_delphi_median: 0,
							taker_marketplace: '',
						},
					},
				],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, buyer: credentials.accountName, saleId, price: sale.price.amount } }];
		}

		case 'getActiveSales': {
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;
			const minPrice = this.getNodeParameter('minPrice', index, '') as string;
			const maxPrice = this.getNodeParameter('maxPrice', index, '') as string;
			const sort = this.getNodeParameter('sort', index, 'created_desc') as string;

			const [sortField, sortOrder] = sort.split('_');
			const params: Record<string, unknown> = { state: '1', limit, page, sort: sortField, order: sortOrder };
			if (minPrice) params.min_price = parseFloat(minPrice) * 100000000;
			if (maxPrice) params.max_price = parseFloat(maxPrice) * 100000000;

			const sales = await getSales(credentials, params);
			return [{ json: { sales: sales.map(parseSale), count: sales.length } }];
		}

		case 'getSalesBySeller': {
			const sellerAccount = this.getNodeParameter('sellerAccount', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;
			const sort = this.getNodeParameter('sort', index, 'created_desc') as string;

			const [sortField, sortOrder] = sort.split('_');
			const sales = await getSales(credentials, { seller: sellerAccount, limit, page, sort: sortField, order: sortOrder });
			return [{ json: { seller: sellerAccount, sales: sales.map(parseSale), count: sales.length } }];
		}

		case 'getSalesByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;
			const sort = this.getNodeParameter('sort', index, 'created_desc') as string;

			const [sortField, sortOrder] = sort.split('_');
			const sales = await getSales(credentials, { collection_name: collectionName, state: '1', limit, page, sort: sortField, order: sortOrder });
			return [{ json: { collection: collectionName, sales: sales.map(parseSale), count: sales.length } }];
		}

		case 'getRecentSales': {
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const sales = await getSales(credentials, { state: '3', limit, page, sort: 'updated', order: 'desc' });
			return [{ json: { sales: sales.map(parseSale), count: sales.length } }];
		}

		case 'getMarketStats': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const stats = await getMarketStats(credentials, { collection_name: collectionName });
			return [{ json: { collection: collectionName, ...stats } }];
		}

		case 'getSuggestedPrice': {
			const templateId = this.getNodeParameter('templateId', index) as string;
			const collectionName = this.getNodeParameter('collectionName', index, '') as string;
			const suggestedPrice = await getSuggestedPrice(credentials, collectionName, templateId);
			return [{ json: { templateId, ...suggestedPrice } }];
		}

		case 'searchSales': {
			const searchQuery = this.getNodeParameter('searchQuery', index, '') as string;
			const minPrice = this.getNodeParameter('minPrice', index, '') as string;
			const maxPrice = this.getNodeParameter('maxPrice', index, '') as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;
			const sort = this.getNodeParameter('sort', index, 'created_desc') as string;

			const [sortField, sortOrder] = sort.split('_');
			const params: Record<string, unknown> = { state: '1', limit, page, sort: sortField, order: sortOrder };
			if (searchQuery) params.match = searchQuery;
			if (minPrice) params.min_price = parseFloat(minPrice) * 100000000;
			if (maxPrice) params.max_price = parseFloat(maxPrice) * 100000000;

			const sales = await getSales(credentials, params);
			return [{ json: { query: searchQuery, sales: sales.map(parseSale), count: sales.length } }];
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
