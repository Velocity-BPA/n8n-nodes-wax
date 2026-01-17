import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getCollections, getCollection, getCollectionStats, getSchemas, getTemplates, getAssets } from '../../transport/atomicApi';
import { createApi, getTableRows, executeTransaction } from '../../transport/eosClient';
import { isValidCollectionName } from '../../utils/assetUtils';

export const collectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['collection'] } },
		options: [
			{ name: 'Get Collection Info', value: 'getCollectionInfo', description: 'Get detailed collection information', action: 'Get collection info' },
			{ name: 'Get Collection Stats', value: 'getCollectionStats', description: 'Get collection statistics', action: 'Get collection stats' },
			{ name: 'Get Collection Schemas', value: 'getCollectionSchemas', description: 'Get all schemas in a collection', action: 'Get collection schemas' },
			{ name: 'Get Collection Templates', value: 'getCollectionTemplates', description: 'Get all templates in a collection', action: 'Get collection templates' },
			{ name: 'Get Collection Assets', value: 'getCollectionAssets', description: 'Get all assets in a collection', action: 'Get collection assets' },
			{ name: 'Create Collection', value: 'createCollection', description: 'Create a new collection', action: 'Create collection' },
			{ name: 'Get Collection Authors', value: 'getCollectionAuthors', description: 'Get authorized accounts for collection', action: 'Get collection authors' },
			{ name: 'Add Collection Author', value: 'addCollectionAuthor', description: 'Add authorized account to collection', action: 'Add collection author' },
			{ name: 'Search Collections', value: 'searchCollections', description: 'Search collections by criteria', action: 'Search collections' },
			{ name: 'Get Trending Collections', value: 'getTrendingCollections', description: 'Get trending collections by volume', action: 'Get trending collections' },
		],
		default: 'getCollectionInfo',
	},
];

export const collectionFields: INodeProperties[] = [
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'alien.worlds',
		description: 'The collection name (1-12 characters, a-z, 1-5, .)',
		displayOptions: { show: { resource: ['collection'], operation: ['getCollectionInfo', 'getCollectionStats', 'getCollectionSchemas', 'getCollectionTemplates', 'getCollectionAssets', 'getCollectionAuthors', 'addCollectionAuthor'] } },
	},
	{
		displayName: 'Author Account',
		name: 'authorAccount',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'myaccount123',
		description: 'The WAX account name to add as author',
		displayOptions: { show: { resource: ['collection'], operation: ['addCollectionAuthor'] } },
	},
	{
		displayName: 'New Collection Name',
		name: 'newCollectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'Name for the new collection (1-12 characters)',
		displayOptions: { show: { resource: ['collection'], operation: ['createCollection'] } },
	},
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'My NFT Collection',
		description: 'Human-readable name for the collection',
		displayOptions: { show: { resource: ['collection'], operation: ['createCollection'] } },
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'Collection description',
		displayOptions: { show: { resource: ['collection'], operation: ['createCollection'] } },
	},
	{
		displayName: 'Website URL',
		name: 'websiteUrl',
		type: 'string',
		default: '',
		placeholder: 'https://myproject.com',
		description: 'Collection website URL',
		displayOptions: { show: { resource: ['collection'], operation: ['createCollection'] } },
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/image.png or ipfs://...',
		description: 'Collection image URL (HTTPS or IPFS)',
		displayOptions: { show: { resource: ['collection'], operation: ['createCollection'] } },
	},
	{
		displayName: 'Market Fee',
		name: 'marketFee',
		type: 'number',
		typeOptions: { minValue: 0, maxValue: 0.15 },
		default: 0.05,
		description: 'Market fee percentage (0-0.15, e.g., 0.05 = 5%)',
		displayOptions: { show: { resource: ['collection'], operation: ['createCollection'] } },
	},
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		default: '',
		placeholder: 'alien',
		description: 'Search term to filter collections',
		displayOptions: { show: { resource: ['collection'], operation: ['searchCollections'] } },
	},
	{
		displayName: 'Time Period',
		name: 'timePeriod',
		type: 'options',
		options: [
			{ name: '24 Hours', value: '24h' },
			{ name: '7 Days', value: '7d' },
			{ name: '30 Days', value: '30d' },
			{ name: 'All Time', value: 'all' },
		],
		default: '7d',
		description: 'Time period for trending collections',
		displayOptions: { show: { resource: ['collection'], operation: ['getTrendingCollections'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum number of results to return',
		displayOptions: { show: { resource: ['collection'], operation: ['getCollectionSchemas', 'getCollectionTemplates', 'getCollectionAssets', 'searchCollections', 'getTrendingCollections'] } },
	},
];

export async function executeCollectionAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getCollectionInfo': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			if (!isValidCollectionName(collectionName)) {
				throw new Error(`Invalid collection name: ${collectionName}`);
			}
			result = await getCollection.call(this, collectionName);
			break;
		}

		case 'getCollectionStats': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			result = await getCollectionStats.call(this, collectionName);
			break;
		}

		case 'getCollectionSchemas': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getSchemas.call(this, { collection_name: collectionName, limit });
			break;
		}

		case 'getCollectionTemplates': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getTemplates.call(this, { collection_name: collectionName, limit });
			break;
		}

		case 'getCollectionAssets': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getAssets.call(this, { collection_name: collectionName, limit });
			break;
		}

		case 'createCollection': {
			const newCollectionName = this.getNodeParameter('newCollectionName', index) as string;
			const displayName = this.getNodeParameter('displayName', index) as string;
			const description = this.getNodeParameter('description', index) as string;
			const websiteUrl = this.getNodeParameter('websiteUrl', index) as string;
			const imageUrl = this.getNodeParameter('imageUrl', index) as string;
			const marketFee = this.getNodeParameter('marketFee', index) as number;

			if (!isValidCollectionName(newCollectionName)) {
				throw new Error(`Invalid collection name: ${newCollectionName}`);
			}

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'createcol',
				authorization: [{ actor: author, permission: 'active' }],
				data: {
					author,
					collection_name: newCollectionName,
					allow_notify: true,
					authorized_accounts: [author],
					notify_accounts: [],
					market_fee: marketFee,
					data: [
						{ key: 'name', value: ['string', displayName] },
						{ key: 'description', value: ['string', description] },
						{ key: 'url', value: ['string', websiteUrl] },
						{ key: 'img', value: ['string', imageUrl] },
					],
				},
			}]);
			break;
		}

		case 'getCollectionAuthors': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const collection = await getCollection.call(this, collectionName);
			result = {
				collection_name: collectionName,
				author: collection.data.author,
				authorized_accounts: collection.data.authorized_accounts,
				notify_accounts: collection.data.notify_accounts,
			};
			break;
		}

		case 'addCollectionAuthor': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const authorAccount = this.getNodeParameter('authorAccount', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const actor = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'addcolauth',
				authorization: [{ actor, permission: 'active' }],
				data: {
					collection_name: collectionName,
					account_to_add: authorAccount,
				},
			}]);
			break;
		}

		case 'searchCollections': {
			const searchQuery = this.getNodeParameter('searchQuery', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getCollections.call(this, { match: searchQuery, limit });
			break;
		}

		case 'getTrendingCollections': {
			const timePeriod = this.getNodeParameter('timePeriod', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const params: any = { limit, order: 'desc', sort: 'volume' };
			if (timePeriod !== 'all') {
				const now = Date.now();
				const periods: { [key: string]: number } = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
				params.after = new Date(now - periods[timePeriod]).toISOString();
			}
			result = await getCollections.call(this, params);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...collectionOperations, ...collectionFields];
export const execute = executeCollectionAction;
