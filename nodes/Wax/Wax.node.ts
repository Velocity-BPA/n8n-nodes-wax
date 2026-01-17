// WAX Blockchain Node for n8n
// Author: Velocity BPA - https://velobpa.com
// GitHub: https://github.com/Velocity-BPA

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as account from './actions/account';
import * as transaction from './actions/transaction';
import * as transfer from './actions/transfer';
import * as atomicAssets from './actions/atomicAssets';
import * as atomicMarket from './actions/atomicMarket';
import * as auctions from './actions/auctions';
import * as buyoffers from './actions/buyoffers';
import * as collection from './actions/collection';
import * as schema from './actions/schema';
import * as template from './actions/template';
import * as minting from './actions/minting';
import * as drops from './actions/drops';
import * as packs from './actions/packs';
import * as blends from './actions/blends';
import * as staking from './actions/staking';
import * as game from './actions/game';
import * as token from './actions/token';
import * as contract from './actions/contract';
import * as resourceModule from './actions/resource';
import * as hyperion from './actions/hyperion';
import * as utility from './actions/utility';

export class Wax implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WAX',
		name: 'wax',
		icon: 'file:wax.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with WAX blockchain - NFTs, AtomicAssets, gaming, and more',
		defaults: {
			name: 'WAX',
		},
		inputs: ['main'],
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
			{
				name: 'waxCloudWallet',
				required: false,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Atomic Assets (NFT)', value: 'atomicAssets' },
					{ name: 'Atomic Market', value: 'atomicMarket' },
					{ name: 'Auctions', value: 'auctions' },
					{ name: 'Blends', value: 'blends' },
					{ name: 'Buy Offers', value: 'buyoffers' },
					{ name: 'Collection', value: 'collection' },
					{ name: 'Drops', value: 'drops' },
					{ name: 'Game', value: 'game' },
					{ name: 'Hyperion (History)', value: 'hyperion' },
					{ name: 'Minting', value: 'minting' },
					{ name: 'Packs', value: 'packs' },
					{ name: 'Resource (CPU/NET/RAM)', value: 'resource' },
					{ name: 'Schema', value: 'schema' },
					{ name: 'Smart Contract', value: 'contract' },
					{ name: 'Staking', value: 'staking' },
					{ name: 'Template', value: 'template' },
					{ name: 'Token', value: 'token' },
					{ name: 'Transaction', value: 'transaction' },
					{ name: 'Transfer', value: 'transfer' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'account',
			},

			// ==================== ACCOUNT OPERATIONS ====================
			...account.description,

			// ==================== TRANSACTION OPERATIONS ====================
			...transaction.description,

			// ==================== TRANSFER OPERATIONS ====================
			...transfer.description,

			// ==================== ATOMIC ASSETS OPERATIONS ====================
			...atomicAssets.description,

			// ==================== ATOMIC MARKET OPERATIONS ====================
			...atomicMarket.description,

			// ==================== AUCTIONS OPERATIONS ====================
			...auctions.description,

			// ==================== BUYOFFERS OPERATIONS ====================
			...buyoffers.description,

			// ==================== COLLECTION OPERATIONS ====================
			...collection.description,

			// ==================== SCHEMA OPERATIONS ====================
			...schema.description,

			// ==================== TEMPLATE OPERATIONS ====================
			...template.description,

			// ==================== MINTING OPERATIONS ====================
			...minting.description,

			// ==================== DROPS OPERATIONS ====================
			...drops.description,

			// ==================== PACKS OPERATIONS ====================
			...packs.description,

			// ==================== BLENDS OPERATIONS ====================
			...blends.description,

			// ==================== STAKING OPERATIONS ====================
			...staking.description,

			// ==================== GAME OPERATIONS ====================
			...game.description,

			// ==================== TOKEN OPERATIONS ====================
			...token.description,

			// ==================== CONTRACT OPERATIONS ====================
			...contract.description,

			// ==================== RESOURCE OPERATIONS ====================
			...resourceModule.description,

			// ==================== HYPERION OPERATIONS ====================
			...hyperion.description,

			// ==================== UTILITY OPERATIONS ====================
			...utility.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: any;

				switch (resource) {
					case 'account':
						result = await account.execute.call(this, i, operation);
						break;
					case 'transaction':
						result = await transaction.execute.call(this, i, operation);
						break;
					case 'transfer':
						result = await transfer.execute.call(this, i, operation);
						break;
					case 'atomicAssets':
						result = await atomicAssets.execute.call(this, i, operation);
						break;
					case 'atomicMarket':
						result = await atomicMarket.execute.call(this, i, operation);
						break;
					case 'auctions':
						result = await auctions.execute.call(this, i, operation);
						break;
					case 'buyoffers':
						result = await buyoffers.execute.call(this, i, operation);
						break;
					case 'collection':
						result = await collection.execute.call(this, i, operation);
						break;
					case 'schema':
						result = await schema.execute.call(this, i, operation);
						break;
					case 'template':
						result = await template.execute.call(this, i, operation);
						break;
					case 'minting':
						result = await minting.execute.call(this, i, operation);
						break;
					case 'drops':
						result = await drops.execute.call(this, i, operation);
						break;
					case 'packs':
						result = await packs.execute.call(this, i, operation);
						break;
					case 'blends':
						result = await blends.execute.call(this, i, operation);
						break;
					case 'staking':
						result = await staking.execute.call(this, i, operation);
						break;
					case 'game':
						result = await game.execute.call(this, i, operation);
						break;
					case 'token':
						result = await token.execute.call(this, i, operation);
						break;
					case 'contract':
						result = await contract.execute.call(this, i, operation);
						break;
					case 'resource':
						result = await resourceModule.execute.call(this, i, operation);
						break;
					case 'hyperion':
						result = await hyperion.execute.call(this, i, operation);
						break;
					case 'utility':
						result = await utility.execute.call(this, i, operation);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				if (Array.isArray(result)) {
					returnData.push(...result.map(item => ({ json: item })));
				} else {
					returnData.push({ json: result });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
