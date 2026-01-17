import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getTemplates, getAssets } from '../../transport/atomicApi';
import { createApi, executeTransaction, getAccount } from '../../transport/eosClient';
import { getActions } from '../../transport/hyperionClient';
import { isValidCollectionName, isValidSchemaName, isValidTemplateId } from '../../utils/assetUtils';

export const mintingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['minting'] } },
		options: [
			{ name: 'Mint Asset', value: 'mintAsset', description: 'Mint a new NFT asset', action: 'Mint asset' },
			{ name: 'Batch Mint Assets', value: 'batchMintAssets', description: 'Mint multiple assets at once', action: 'Batch mint assets' },
			{ name: 'Get Mintable Templates', value: 'getMintableTemplates', description: 'Get templates available for minting', action: 'Get mintable templates' },
			{ name: 'Pre-Mint Assets', value: 'preMintAssets', description: 'Pre-mint assets for drops', action: 'Pre mint assets' },
			{ name: 'Get Mint History', value: 'getMintHistory', description: 'Get minting history for account', action: 'Get mint history' },
			{ name: 'Estimate Mint Cost', value: 'estimateMintCost', description: 'Estimate RAM cost for minting', action: 'Estimate mint cost' },
		],
		default: 'mintAsset',
	},
];

export const mintingFields: INodeProperties[] = [
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'The collection to mint from',
		displayOptions: { show: { resource: ['minting'], operation: ['mintAsset', 'batchMintAssets', 'getMintableTemplates', 'preMintAssets', 'getMintHistory'] } },
	},
	{
		displayName: 'Schema Name',
		name: 'schemaName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'items',
		description: 'The schema to use',
		displayOptions: { show: { resource: ['minting'], operation: ['mintAsset', 'batchMintAssets', 'preMintAssets'] } },
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The template ID to mint from',
		displayOptions: { show: { resource: ['minting'], operation: ['mintAsset', 'batchMintAssets', 'preMintAssets', 'estimateMintCost'] } },
	},
	{
		displayName: 'New Asset Owner',
		name: 'newAssetOwner',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'recipient123',
		description: 'Account to receive the minted asset',
		displayOptions: { show: { resource: ['minting'], operation: ['mintAsset', 'batchMintAssets', 'preMintAssets'] } },
	},
	{
		displayName: 'Mint Count',
		name: 'mintCount',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 1,
		description: 'Number of assets to mint',
		displayOptions: { show: { resource: ['minting'], operation: ['batchMintAssets', 'preMintAssets', 'estimateMintCost'] } },
	},
	{
		displayName: 'Immutable Data',
		name: 'immutableData',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Data',
		description: 'Asset-specific immutable data (optional)',
		displayOptions: { show: { resource: ['minting'], operation: ['mintAsset', 'batchMintAssets'] } },
		options: [
			{
				name: 'data',
				displayName: 'Data',
				values: [
					{ displayName: 'Key', name: 'key', type: 'string', default: '', description: 'Attribute key' },
					{ displayName: 'Type', name: 'type', type: 'options', options: [{ name: 'String', value: 'string' }, { name: 'Uint64', value: 'uint64' }, { name: 'Image', value: 'image' }], default: 'string', description: 'Value type' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '', description: 'Attribute value' },
				],
			},
		],
	},
	{
		displayName: 'Mutable Data',
		name: 'mutableData',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Data',
		description: 'Asset-specific mutable data (optional)',
		displayOptions: { show: { resource: ['minting'], operation: ['mintAsset', 'batchMintAssets'] } },
		options: [
			{
				name: 'data',
				displayName: 'Data',
				values: [
					{ displayName: 'Key', name: 'key', type: 'string', default: '', description: 'Attribute key' },
					{ displayName: 'Type', name: 'type', type: 'options', options: [{ name: 'String', value: 'string' }, { name: 'Uint64', value: 'uint64' }, { name: 'Image', value: 'image' }], default: 'string', description: 'Value type' },
					{ displayName: 'Value', name: 'value', type: 'string', default: '', description: 'Attribute value' },
				],
			},
		],
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 20,
		description: 'Maximum results to return',
		displayOptions: { show: { resource: ['minting'], operation: ['getMintableTemplates', 'getMintHistory'] } },
	},
];

export async function executeMintingAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'mintAsset': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			const newAssetOwner = this.getNodeParameter('newAssetOwner', index) as string;
			const immutableInput = this.getNodeParameter('immutableData', index) as { data: { key: string; type: string; value: string }[] };
			const mutableInput = this.getNodeParameter('mutableData', index) as { data: { key: string; type: string; value: string }[] };

			if (!isValidCollectionName(collectionName)) throw new Error(`Invalid collection name: ${collectionName}`);
			if (!isValidSchemaName(schemaName)) throw new Error(`Invalid schema name: ${schemaName}`);
			if (!isValidTemplateId(templateId)) throw new Error(`Invalid template ID: ${templateId}`);

			const formatData = (input: { key: string; type: string; value: string }[]) =>
				input.map(item => ({ key: item.key, value: [item.type, item.value] }));

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'mintasset',
				authorization: [{ actor: author, permission: 'active' }],
				data: {
					authorized_minter: author,
					collection_name: collectionName,
					schema_name: schemaName,
					template_id: parseInt(templateId),
					new_asset_owner: newAssetOwner,
					immutable_data: formatData(immutableInput.data || []),
					mutable_data: formatData(mutableInput.data || []),
					tokens_to_back: [],
				},
			}]);
			break;
		}

		case 'batchMintAssets': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			const newAssetOwner = this.getNodeParameter('newAssetOwner', index) as string;
			const mintCount = this.getNodeParameter('mintCount', index) as number;
			const immutableInput = this.getNodeParameter('immutableData', index) as { data: { key: string; type: string; value: string }[] };
			const mutableInput = this.getNodeParameter('mutableData', index) as { data: { key: string; type: string; value: string }[] };

			const formatData = (input: { key: string; type: string; value: string }[]) =>
				input.map(item => ({ key: item.key, value: [item.type, item.value] }));

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			const actions = [];
			for (let i = 0; i < mintCount; i++) {
				actions.push({
					account: 'atomicassets',
					name: 'mintasset',
					authorization: [{ actor: author, permission: 'active' }],
					data: {
						authorized_minter: author,
						collection_name: collectionName,
						schema_name: schemaName,
						template_id: parseInt(templateId),
						new_asset_owner: newAssetOwner,
						immutable_data: formatData(immutableInput.data || []),
						mutable_data: formatData(mutableInput.data || []),
						tokens_to_back: [],
					},
				});
			}

			result = await executeTransaction.call(this, api, actions);
			break;
		}

		case 'getMintableTemplates': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const templates = await getTemplates.call(this, { collection_name: collectionName, limit, has_assets: 'false' });
			result = {
				templates: templates.data.filter((t: any) => {
					const maxSupply = parseInt(t.max_supply);
					const issued = parseInt(t.issued_supply);
					return maxSupply === 0 || issued < maxSupply;
				}),
			};
			break;
		}

		case 'preMintAssets': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			const newAssetOwner = this.getNodeParameter('newAssetOwner', index) as string;
			const mintCount = this.getNodeParameter('mintCount', index) as number;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			const actions = [];
			for (let i = 0; i < mintCount; i++) {
				actions.push({
					account: 'atomicassets',
					name: 'mintasset',
					authorization: [{ actor: author, permission: 'active' }],
					data: {
						authorized_minter: author,
						collection_name: collectionName,
						schema_name: schemaName,
						template_id: parseInt(templateId),
						new_asset_owner: newAssetOwner,
						immutable_data: [],
						mutable_data: [],
						tokens_to_back: [],
					},
				});
			}

			result = await executeTransaction.call(this, api, actions);
			break;
		}

		case 'getMintHistory': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			const credentials = await this.getCredentials('waxNetwork');
			const account = credentials.accountName as string;

			result = await getActions.call(this, {
				account,
				filter: 'atomicassets:mintasset',
				limit,
			});
			break;
		}

		case 'estimateMintCost': {
			const templateId = this.getNodeParameter('templateId', index) as string;
			const mintCount = this.getNodeParameter('mintCount', index) as number;
			const ramPerAsset = 300;
			const totalRamBytes = ramPerAsset * mintCount;
			const ramPricePerKb = 0.05;
			const estimatedCost = (totalRamBytes / 1024) * ramPricePerKb;

			result = {
				template_id: templateId,
				mint_count: mintCount,
				ram_per_asset_bytes: ramPerAsset,
				total_ram_bytes: totalRamBytes,
				estimated_cost_wax: estimatedCost.toFixed(8),
				note: 'Actual cost depends on current RAM market price',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...mintingOperations, ...mintingFields];
export const execute = executeMintingAction;
