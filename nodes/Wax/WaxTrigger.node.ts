/**
 * WAX Blockchain Trigger Node
 * Real-time event monitoring for WAX blockchain
 * 
 * Monitors blockchain events using polling via Hyperion API
 * Supports account, NFT, market, collection, staking, game, pack/blend, and block events
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA/n8n-nodes-wax
 */

import {
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

export class WaxTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WAX Trigger',
		name: 'waxTrigger',
		icon: 'file:waxTrigger.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Listen for WAX blockchain events in real-time',
		defaults: {
			name: 'WAX Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'waxNetwork',
				required: true,
			},
			{
				name: 'atomicAssets',
				required: false,
			},
		],
		polling: true,
		properties: [
			// Event Category
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account Events',
						value: 'account',
						description: 'WAXP and token transfers, resource changes',
					},
					{
						name: 'NFT Events',
						value: 'nft',
						description: 'Asset transfers, minting, burning',
					},
					{
						name: 'Market Events',
						value: 'market',
						description: 'Sales, auctions, buyoffers',
					},
					{
						name: 'Collection Events',
						value: 'collection',
						description: 'Asset minted, template/schema created',
					},
					{
						name: 'Staking Events',
						value: 'staking',
						description: 'NFT staked/unstaked, rewards',
					},
					{
						name: 'Game Events',
						value: 'game',
						description: 'Game actions, rewards, achievements',
					},
					{
						name: 'Pack/Blend Events',
						value: 'packBlend',
						description: 'Pack opened, drop claimed, blend completed',
					},
					{
						name: 'Block Events',
						value: 'block',
						description: 'New blocks, specific action executed',
					},
				],
				default: 'account',
			},

			// Account Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['account'],
					},
				},
				options: [
					{ name: 'WAXP Received', value: 'waxpReceived' },
					{ name: 'WAXP Sent', value: 'waxpSent' },
					{ name: 'Token Received', value: 'tokenReceived' },
					{ name: 'Token Sent', value: 'tokenSent' },
					{ name: 'Resource Changed', value: 'resourceChanged' },
				],
				default: 'waxpReceived',
			},

			// NFT Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['nft'],
					},
				},
				options: [
					{ name: 'Asset Received', value: 'assetReceived' },
					{ name: 'Asset Sent', value: 'assetSent' },
					{ name: 'Asset Burned', value: 'assetBurned' },
					{ name: 'Asset Backed', value: 'assetBacked' },
					{ name: 'Asset Minted', value: 'assetMinted' },
				],
				default: 'assetReceived',
			},

			// Market Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['market'],
					},
				},
				options: [
					{ name: 'Sale Created', value: 'saleCreated' },
					{ name: 'Sale Cancelled', value: 'saleCancelled' },
					{ name: 'Sale Completed', value: 'saleCompleted' },
					{ name: 'Auction Created', value: 'auctionCreated' },
					{ name: 'Auction Bid', value: 'auctionBid' },
					{ name: 'Auction Ended', value: 'auctionEnded' },
					{ name: 'Buyoffer Received', value: 'buyofferReceived' },
					{ name: 'Buyoffer Accepted', value: 'buyofferAccepted' },
				],
				default: 'saleCompleted',
			},

			// Collection Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['collection'],
					},
				},
				options: [
					{ name: 'Asset Minted', value: 'collectionAssetMinted' },
					{ name: 'Template Created', value: 'templateCreated' },
					{ name: 'Schema Created', value: 'schemaCreated' },
					{ name: 'Schema Extended', value: 'schemaExtended' },
					{ name: 'Collection Updated', value: 'collectionUpdated' },
				],
				default: 'collectionAssetMinted',
			},

			// Staking Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['staking'],
					},
				},
				options: [
					{ name: 'NFT Staked', value: 'nftStaked' },
					{ name: 'NFT Unstaked', value: 'nftUnstaked' },
					{ name: 'Rewards Available', value: 'rewardsAvailable' },
					{ name: 'Pool Updated', value: 'poolUpdated' },
				],
				default: 'nftStaked',
			},

			// Game Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['game'],
					},
				},
				options: [
					{ name: 'Game Action', value: 'gameAction' },
					{ name: 'Reward Earned', value: 'rewardEarned' },
					{ name: 'Achievement Unlocked', value: 'achievementUnlocked' },
					{ name: 'Leaderboard Changed', value: 'leaderboardChanged' },
				],
				default: 'gameAction',
			},

			// Pack/Blend Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['packBlend'],
					},
				},
				options: [
					{ name: 'Pack Opened', value: 'packOpened' },
					{ name: 'Drop Claimed', value: 'dropClaimed' },
					{ name: 'Blend Completed', value: 'blendCompleted' },
				],
				default: 'packOpened',
			},

			// Block Events
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						eventCategory: ['block'],
					},
				},
				options: [
					{ name: 'New Block', value: 'newBlock' },
					{ name: 'Irreversible Block', value: 'irreversibleBlock' },
					{ name: 'Action Executed', value: 'actionExecuted' },
				],
				default: 'actionExecuted',
			},

			// Account name filter (for most events)
			{
				displayName: 'Account Name',
				name: 'accountName',
				type: 'string',
				default: '',
				placeholder: 'myaccount123',
				description: 'WAX account to monitor',
				displayOptions: {
					show: {
						eventCategory: ['account', 'nft', 'staking', 'game', 'packBlend'],
					},
				},
			},

			// Collection filter
			{
				displayName: 'Collection Name',
				name: 'collectionName',
				type: 'string',
				default: '',
				placeholder: 'alien.worlds',
				description: 'Collection to monitor',
				displayOptions: {
					show: {
						eventCategory: ['collection', 'market'],
					},
				},
			},

			// Token contract filter
			{
				displayName: 'Token Contract',
				name: 'tokenContract',
				type: 'string',
				default: 'eosio.token',
				placeholder: 'eosio.token',
				description: 'Token contract to monitor',
				displayOptions: {
					show: {
						event: ['tokenReceived', 'tokenSent'],
					},
				},
			},

			// Token symbol filter
			{
				displayName: 'Token Symbol',
				name: 'tokenSymbol',
				type: 'string',
				default: 'WAX',
				placeholder: 'WAX',
				description: 'Token symbol to filter',
				displayOptions: {
					show: {
						event: ['tokenReceived', 'tokenSent', 'waxpReceived', 'waxpSent'],
					},
				},
			},

			// Game contract filter
			{
				displayName: 'Game Contract',
				name: 'gameContract',
				type: 'string',
				default: '',
				placeholder: 'm.federation',
				description: 'Game contract to monitor',
				displayOptions: {
					show: {
						eventCategory: ['game'],
					},
				},
			},

			// Staking contract filter
			{
				displayName: 'Staking Contract',
				name: 'stakingContract',
				type: 'string',
				default: '',
				placeholder: 'stakingcontract',
				description: 'Staking contract to monitor',
				displayOptions: {
					show: {
						eventCategory: ['staking'],
					},
				},
			},

			// Action filter for block events
			{
				displayName: 'Contract',
				name: 'actionContract',
				type: 'string',
				default: '',
				placeholder: 'atomicassets',
				description: 'Contract to monitor for actions',
				displayOptions: {
					show: {
						event: ['actionExecuted'],
					},
				},
			},
			{
				displayName: 'Action Name',
				name: 'actionName',
				type: 'string',
				default: '',
				placeholder: 'transfer',
				description: 'Action name to filter',
				displayOptions: {
					show: {
						event: ['actionExecuted'],
					},
				},
			},

			// Minimum amount filter
			{
				displayName: 'Minimum Amount',
				name: 'minAmount',
				type: 'number',
				default: 0,
				description: 'Minimum amount to trigger (0 = any amount)',
				displayOptions: {
					show: {
						event: ['waxpReceived', 'waxpSent', 'tokenReceived', 'tokenSent'],
					},
				},
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const event = this.getNodeParameter('event') as string;
		const webhookData = this.getWorkflowStaticData('node');

		// Get the last processed timestamp
		const lastTimestamp = (webhookData.lastTimestamp as string) || new Date(Date.now() - 60000).toISOString();
		const currentTimestamp = new Date().toISOString();

		const returnData: INodeExecutionData[] = [];

		try {
			const credentials = await this.getCredentials('waxNetwork');
			const hyperionEndpoint = credentials.hyperionEndpoint as string || 'https://wax.eosphere.io';

			// Build query based on event type
			let endpoint = '';
			const params: Record<string, any> = {
				after: lastTimestamp,
				before: currentTimestamp,
				limit: 100,
				sort: 'asc',
			};

			switch (eventCategory) {
				case 'account': {
					const accountName = this.getNodeParameter('accountName', '') as string;
					endpoint = '/v2/history/get_actions';

					if (event === 'waxpReceived' || event === 'tokenReceived') {
						params['act.account'] = event === 'waxpReceived' ? 'eosio.token' : this.getNodeParameter('tokenContract', 'eosio.token');
						params['act.name'] = 'transfer';
						params['data.to'] = accountName;
					} else if (event === 'waxpSent' || event === 'tokenSent') {
						params['act.account'] = event === 'waxpSent' ? 'eosio.token' : this.getNodeParameter('tokenContract', 'eosio.token');
						params['act.name'] = 'transfer';
						params['data.from'] = accountName;
					} else if (event === 'resourceChanged') {
						params.account = accountName;
						params['act.name'] = 'delegatebw,undelegatebw,buyrambytes,buyram,sellram';
					}
					break;
				}

				case 'nft': {
					const accountName = this.getNodeParameter('accountName', '') as string;
					endpoint = '/v2/history/get_actions';
					params['act.account'] = 'atomicassets';

					if (event === 'assetReceived') {
						params['act.name'] = 'transfer,logtransfer';
						params['data.to'] = accountName;
					} else if (event === 'assetSent') {
						params['act.name'] = 'transfer,logtransfer';
						params['data.from'] = accountName;
					} else if (event === 'assetBurned') {
						params['act.name'] = 'burnasset,logburnasset';
						params['data.asset_owner'] = accountName;
					} else if (event === 'assetBacked') {
						params['act.name'] = 'logbackasset';
					} else if (event === 'assetMinted') {
						params['act.name'] = 'logmint';
						params['data.new_asset_owner'] = accountName;
					}
					break;
				}

				case 'market': {
					const collectionName = this.getNodeParameter('collectionName', '') as string;
					endpoint = '/v2/history/get_actions';
					params['act.account'] = 'atomicmarket';

					if (event === 'saleCreated') {
						params['act.name'] = 'lognewsale';
					} else if (event === 'saleCancelled') {
						params['act.name'] = 'logcancelsale';
					} else if (event === 'saleCompleted') {
						params['act.name'] = 'purchasesale,logpurchsale';
					} else if (event === 'auctionCreated') {
						params['act.name'] = 'lognewauct';
					} else if (event === 'auctionBid') {
						params['act.name'] = 'auctionbid,logauctbid';
					} else if (event === 'auctionEnded') {
						params['act.name'] = 'auctclaimbuy,auctclaimsel';
					} else if (event === 'buyofferReceived') {
						params['act.name'] = 'lognewbuyo';
					} else if (event === 'buyofferAccepted') {
						params['act.name'] = 'acceptbuyo';
					}

					if (collectionName) {
						params['data.collection_name'] = collectionName;
					}
					break;
				}

				case 'collection': {
					const collectionName = this.getNodeParameter('collectionName', '') as string;
					endpoint = '/v2/history/get_actions';
					params['act.account'] = 'atomicassets';

					if (event === 'collectionAssetMinted') {
						params['act.name'] = 'logmint';
					} else if (event === 'templateCreated') {
						params['act.name'] = 'createtempl,lognewtempl';
					} else if (event === 'schemaCreated') {
						params['act.name'] = 'createschema';
					} else if (event === 'schemaExtended') {
						params['act.name'] = 'extendschema';
					} else if (event === 'collectionUpdated') {
						params['act.name'] = 'setcoldata,addcolauth,remcolauth';
					}

					if (collectionName) {
						params['data.collection_name'] = collectionName;
					}
					break;
				}

				case 'staking': {
					const accountName = this.getNodeParameter('accountName', '') as string;
					const stakingContract = this.getNodeParameter('stakingContract', '') as string;
					endpoint = '/v2/history/get_actions';

					if (stakingContract) {
						params['act.account'] = stakingContract;
					}

					if (event === 'nftStaked') {
						params['act.name'] = 'stake,logstake';
						params.account = accountName;
					} else if (event === 'nftUnstaked') {
						params['act.name'] = 'unstake,logunstake';
						params.account = accountName;
					} else if (event === 'rewardsAvailable') {
						params['act.name'] = 'logreward,claimreward';
						params['data.owner'] = accountName;
					} else if (event === 'poolUpdated') {
						params['act.name'] = 'setpool,updatepool';
					}
					break;
				}

				case 'game': {
					const accountName = this.getNodeParameter('accountName', '') as string;
					const gameContract = this.getNodeParameter('gameContract', '') as string;
					endpoint = '/v2/history/get_actions';

					if (gameContract) {
						params['act.account'] = gameContract;
					}

					params.account = accountName;

					if (event === 'rewardEarned') {
						params['act.name'] = 'claim,reward,claimreward';
					} else if (event === 'achievementUnlocked') {
						params['act.name'] = 'achievement,unlock';
					}
					break;
				}

				case 'packBlend': {
					const accountName = this.getNodeParameter('accountName', '') as string;
					endpoint = '/v2/history/get_actions';

					if (event === 'packOpened') {
						params['act.account'] = 'atomicpacksx';
						params['act.name'] = 'unboxassets,lognewunbox';
						params.account = accountName;
					} else if (event === 'dropClaimed') {
						params['act.account'] = 'atomicdropsx';
						params['act.name'] = 'claimdrop,logclaim';
						params.account = accountName;
					} else if (event === 'blendCompleted') {
						params['act.account'] = 'blenderizerx';
						params['act.name'] = 'logblend';
						params.account = accountName;
					}
					break;
				}

				case 'block': {
					if (event === 'newBlock' || event === 'irreversibleBlock') {
						// Get chain info for block events
						const axios = require('axios');
						const chainEndpoint = credentials.chainApiEndpoint as string || 'https://wax.greymass.com';
						const response = await axios.get(`${chainEndpoint}/v1/chain/get_info`);
						const info = response.data;

						const blockNum = event === 'newBlock' ? info.head_block_num : info.last_irreversible_block_num;
						const lastBlockNum = (webhookData.lastBlockNum as number) || blockNum - 1;

						if (blockNum > lastBlockNum) {
							returnData.push({
								json: {
									event,
									blockNum,
									blockId: event === 'newBlock' ? info.head_block_id : info.last_irreversible_block_id,
									blockTime: info.head_block_time,
									producer: info.head_block_producer,
									chainId: info.chain_id,
								},
							});
							webhookData.lastBlockNum = blockNum;
						}

						webhookData.lastTimestamp = currentTimestamp;
						return [returnData];
					} else if (event === 'actionExecuted') {
						const actionContract = this.getNodeParameter('actionContract', '') as string;
						const actionName = this.getNodeParameter('actionName', '') as string;
						params['act.account'] = actionContract;
						if (actionName) params['act.name'] = actionName;
					}
					break;
				}
			}

			// Fetch actions from Hyperion
			if (endpoint) {
				const axios = require('axios');
				const queryString = Object.entries(params)
					.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
					.join('&');

				const response = await axios.get(`${hyperionEndpoint}${endpoint}?${queryString}`);
				const actions = response.data.actions || [];

				// Filter by minimum amount if applicable
				const minAmount = this.getNodeParameter('minAmount', 0) as number;
				const tokenSymbol = this.getNodeParameter('tokenSymbol', 'WAX') as string;

				for (const action of actions) {
					// Apply amount filter if set
					if (minAmount > 0 && action.act?.data?.quantity) {
						const quantity = action.act.data.quantity;
						const parts = quantity.split(' ');
						const amount = parseFloat(parts[0]);
						const symbol = parts[1];

						if (symbol !== tokenSymbol || amount < minAmount) {
							continue;
						}
					}

					returnData.push({
						json: {
							event,
							eventCategory,
							timestamp: action['@timestamp'] || action.timestamp,
							blockNum: action.block_num,
							trxId: action.trx_id,
							action: {
								account: action.act?.account,
								name: action.act?.name,
								data: action.act?.data,
								authorization: action.act?.authorization,
							},
							receiver: action.receiver,
							producer: action.producer,
							globalSequence: action.global_sequence,
						},
					});
				}
			}
		} catch (error: any) {
			// Log error but don't fail - just return empty and try again next poll
			console.error('WAX Trigger poll error:', error.message);
		}

		// Update last timestamp
		webhookData.lastTimestamp = currentTimestamp;

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}
