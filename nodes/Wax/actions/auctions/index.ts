import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createApi, getWaxCredentials } from '../../transport/eosClient';
import { getAuctions, getAuction } from '../../transport/atomicApi';
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
				resource: ['auctions'],
			},
		},
		options: [
			{ name: 'Get Auction Info', value: 'getAuctionInfo', description: 'Get details about an auction', action: 'Get auction info' },
			{ name: 'Create Auction', value: 'createAuction', description: 'Create a new NFT auction', action: 'Create auction' },
			{ name: 'Bid on Auction', value: 'bidOnAuction', description: 'Place a bid on an auction', action: 'Bid on auction' },
			{ name: 'Get Active Auctions', value: 'getActiveAuctions', description: 'Get all active auctions', action: 'Get active auctions' },
			{ name: 'Get Auction Bids', value: 'getAuctionBids', description: 'Get bids for an auction', action: 'Get auction bids' },
			{ name: 'Get Auctions by Seller', value: 'getAuctionsBySeller', description: 'Get auctions by a seller', action: 'Get auctions by seller' },
			{ name: 'Get Auctions by Collection', value: 'getAuctionsByCollection', description: 'Get auctions in a collection', action: 'Get auctions by collection' },
			{ name: 'Claim Auction', value: 'claimAuction', description: 'Claim won auction assets', action: 'Claim auction' },
			{ name: 'Cancel Auction', value: 'cancelAuction', description: 'Cancel an auction', action: 'Cancel auction' },
		],
		default: 'getAuctionInfo',
	},
	{
		displayName: 'Auction ID',
		name: 'auctionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['auctions'],
				operation: ['getAuctionInfo', 'bidOnAuction', 'getAuctionBids', 'claimAuction', 'cancelAuction'],
			},
		},
		default: '',
		description: 'The unique ID of the auction',
	},
	{
		displayName: 'Asset IDs',
		name: 'assetIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['auctions'],
				operation: ['createAuction'],
			},
		},
		default: '',
		description: 'Comma-separated list of asset IDs to auction',
	},
	{
		displayName: 'Starting Bid (WAX)',
		name: 'startingBid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['auctions'],
				operation: ['createAuction'],
			},
		},
		default: '',
		description: 'Starting bid price in WAXP',
	},
	{
		displayName: 'Duration (Seconds)',
		name: 'duration',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['auctions'],
				operation: ['createAuction'],
			},
		},
		default: 86400,
		description: 'Auction duration in seconds (default: 24 hours)',
	},
	{
		displayName: 'Bid Amount (WAX)',
		name: 'bidAmount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['auctions'],
				operation: ['bidOnAuction'],
			},
		},
		default: '',
		description: 'Bid amount in WAXP',
	},
	{
		displayName: 'Seller Account',
		name: 'sellerAccount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['auctions'],
				operation: ['getAuctionsBySeller'],
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
				resource: ['auctions'],
				operation: ['getAuctionsByCollection'],
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
				resource: ['auctions'],
				operation: ['getActiveAuctions', 'getAuctionsBySeller', 'getAuctionsByCollection'],
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
				resource: ['auctions'],
				operation: ['getActiveAuctions', 'getAuctionsBySeller', 'getAuctionsByCollection'],
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
		case 'getAuctionInfo': {
			const auctionId = this.getNodeParameter('auctionId', index) as string;
			const auction = await getAuction(credentials, auctionId);
			return [{ json: auction }];
		}

		case 'createAuction': {
			const assetIdsStr = this.getNodeParameter('assetIds', index) as string;
			const startingBid = this.getNodeParameter('startingBid', index) as string;
			const duration = this.getNodeParameter('duration', index) as number;
			const assetIds = assetIdsStr.split(',').map(id => id.trim());

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [
					{
						account: 'atomicmarket',
						name: 'announceauct',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							seller: credentials.accountName,
							asset_ids: assetIds,
							starting_bid: `${formatWaxAmount(parseFloat(startingBid))} WAX`,
							duration,
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
							memo: 'auction',
						},
					},
				],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, seller: credentials.accountName, assetIds, startingBid: `${startingBid} WAX`, duration } }];
		}

		case 'bidOnAuction': {
			const auctionId = this.getNodeParameter('auctionId', index) as string;
			const bidAmount = this.getNodeParameter('bidAmount', index) as string;

			const api = await createApi(credentials);
			const quantity = `${formatWaxAmount(parseFloat(bidAmount))} WAX`;

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
						name: 'auctionbid',
						authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
						data: {
							bidder: credentials.accountName,
							auction_id: auctionId,
							bid: quantity,
							taker_marketplace: '',
						},
					},
				],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, bidder: credentials.accountName, auctionId, bidAmount: quantity } }];
		}

		case 'getActiveAuctions': {
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const auctions = await getAuctions(credentials, { state: '1', limit, page });
			return [{ json: { auctions, count: auctions.length } }];
		}

		case 'getAuctionBids': {
			const auctionId = this.getNodeParameter('auctionId', index) as string;
			const auction = await getAuction(credentials, auctionId);
			return [{ json: { auctionId, bids: auction.bids || [], currentBid: auction.price } }];
		}

		case 'getAuctionsBySeller': {
			const sellerAccount = this.getNodeParameter('sellerAccount', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const auctions = await getAuctions(credentials, { seller: sellerAccount, limit, page });
			return [{ json: { seller: sellerAccount, auctions, count: auctions.length } }];
		}

		case 'getAuctionsByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index, 100) as number;
			const page = this.getNodeParameter('page', index, 1) as number;

			const auctions = await getAuctions(credentials, { collection_name: collectionName, limit, page });
			return [{ json: { collection: collectionName, auctions, count: auctions.length } }];
		}

		case 'claimAuction': {
			const auctionId = this.getNodeParameter('auctionId', index) as string;

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicmarket',
					name: 'auctclaimbuy',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						auction_id: auctionId,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, claimedAuctionId: auctionId } }];
		}

		case 'cancelAuction': {
			const auctionId = this.getNodeParameter('auctionId', index) as string;

			const api = await createApi(credentials);
			const result = await api.transact({
				actions: [{
					account: 'atomicmarket',
					name: 'cancelauct',
					authorization: [{ actor: credentials.accountName, permission: credentials.permission || 'active' }],
					data: {
						auction_id: auctionId,
					},
				}],
			}, { blocksBehind: 3, expireSeconds: 300 });

			return [{ json: { success: true, transactionId: (result as any).transaction_id, cancelledAuctionId: auctionId } }];
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
