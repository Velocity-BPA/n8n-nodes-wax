import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getTemplates, getTemplate, getTemplateStats, getAssets } from '../../transport/atomicApi';
import { createApi, executeTransaction } from '../../transport/eosClient';
import { isValidTemplateId, isValidCollectionName, isValidSchemaName } from '../../utils/assetUtils';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['template'] } },
		options: [
			{ name: 'Get Template Info', value: 'getTemplateInfo', description: 'Get template details', action: 'Get template info' },
			{ name: 'Get Template Stats', value: 'getTemplateStats', description: 'Get template statistics', action: 'Get template stats' },
			{ name: 'Create Template', value: 'createTemplate', description: 'Create a new template', action: 'Create template' },
			{ name: 'Get Templates by Collection', value: 'getTemplatesByCollection', description: 'Get all templates in collection', action: 'Get templates by collection' },
			{ name: 'Get Assets by Template', value: 'getAssetsByTemplate', description: 'Get all assets from template', action: 'Get assets by template' },
			{ name: 'Lock Template', value: 'lockTemplate', description: 'Lock template max supply', action: 'Lock template' },
			{ name: 'Get Template Data', value: 'getTemplateData', description: 'Get template immutable data', action: 'Get template data' },
		],
		default: 'getTemplateInfo',
	},
];

export const templateFields: INodeProperties[] = [
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'The collection name',
		displayOptions: { show: { resource: ['template'], operation: ['getTemplateInfo', 'getTemplateStats', 'createTemplate', 'getTemplatesByCollection', 'getAssetsByTemplate', 'lockTemplate', 'getTemplateData'] } },
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345',
		description: 'The template ID',
		displayOptions: { show: { resource: ['template'], operation: ['getTemplateInfo', 'getTemplateStats', 'getAssetsByTemplate', 'lockTemplate', 'getTemplateData'] } },
	},
	{
		displayName: 'Schema Name',
		name: 'schemaName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'items',
		description: 'The schema to use for this template',
		displayOptions: { show: { resource: ['template'], operation: ['createTemplate'] } },
	},
	{
		displayName: 'Max Supply',
		name: 'maxSupply',
		type: 'number',
		typeOptions: { minValue: 0 },
		default: 0,
		description: 'Maximum supply (0 = unlimited)',
		displayOptions: { show: { resource: ['template'], operation: ['createTemplate'] } },
	},
	{
		displayName: 'Transferable',
		name: 'transferable',
		type: 'boolean',
		default: true,
		description: 'Whether assets can be transferred',
		displayOptions: { show: { resource: ['template'], operation: ['createTemplate'] } },
	},
	{
		displayName: 'Burnable',
		name: 'burnable',
		type: 'boolean',
		default: true,
		description: 'Whether assets can be burned',
		displayOptions: { show: { resource: ['template'], operation: ['createTemplate'] } },
	},
	{
		displayName: 'Immutable Data',
		name: 'immutableData',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Data',
		description: 'Template immutable attributes',
		displayOptions: { show: { resource: ['template'], operation: ['createTemplate'] } },
		options: [
			{
				name: 'data',
				displayName: 'Data',
				values: [
					{
						displayName: 'Key',
						name: 'key',
						type: 'string',
						default: '',
						placeholder: 'name',
						description: 'Attribute key (must match schema)',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'String', value: 'string' },
							{ name: 'Uint64', value: 'uint64' },
							{ name: 'Int64', value: 'int64' },
							{ name: 'Float', value: 'float' },
							{ name: 'Image (IPFS)', value: 'image' },
							{ name: 'IPFS Hash', value: 'ipfs' },
						],
						default: 'string',
						description: 'Value type',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Attribute value',
					},
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
		displayOptions: { show: { resource: ['template'], operation: ['getTemplatesByCollection', 'getAssetsByTemplate'] } },
	},
];

export async function executeTemplateAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getTemplateInfo': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			if (!isValidCollectionName(collectionName)) throw new Error(`Invalid collection name: ${collectionName}`);
			if (!isValidTemplateId(templateId)) throw new Error(`Invalid template ID: ${templateId}`);
			result = await getTemplate.call(this, collectionName, templateId);
			break;
		}

		case 'getTemplateStats': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			result = await getTemplateStats.call(this, collectionName, templateId);
			break;
		}

		case 'createTemplate': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const maxSupply = this.getNodeParameter('maxSupply', index) as number;
			const transferable = this.getNodeParameter('transferable', index) as boolean;
			const burnable = this.getNodeParameter('burnable', index) as boolean;
			const dataInput = this.getNodeParameter('immutableData', index) as { data: { key: string; type: string; value: string }[] };

			if (!isValidCollectionName(collectionName)) throw new Error(`Invalid collection name: ${collectionName}`);
			if (!isValidSchemaName(schemaName)) throw new Error(`Invalid schema name: ${schemaName}`);

			const immutableData = (dataInput.data || []).map(item => ({
				key: item.key,
				value: [item.type, item.value],
			}));

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'createtempl',
				authorization: [{ actor: author, permission: 'active' }],
				data: {
					authorized_creator: author,
					collection_name: collectionName,
					schema_name: schemaName,
					transferable,
					burnable,
					max_supply: maxSupply,
					immutable_data: immutableData,
				},
			}]);
			break;
		}

		case 'getTemplatesByCollection': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getTemplates.call(this, { collection_name: collectionName, limit });
			break;
		}

		case 'getAssetsByTemplate': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getAssets.call(this, { collection_name: collectionName, template_id: templateId, limit });
			break;
		}

		case 'lockTemplate': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'locktemplate',
				authorization: [{ actor: author, permission: 'active' }],
				data: {
					authorized_editor: author,
					collection_name: collectionName,
					template_id: parseInt(templateId),
				},
			}]);
			break;
		}

		case 'getTemplateData': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const templateId = this.getNodeParameter('templateId', index) as string;
			const template = await getTemplate.call(this, collectionName, templateId);
			result = {
				template_id: template.data.template_id,
				collection_name: template.data.collection.collection_name,
				schema_name: template.data.schema.schema_name,
				immutable_data: template.data.immutable_data,
				max_supply: template.data.max_supply,
				issued_supply: template.data.issued_supply,
				is_transferable: template.data.is_transferable,
				is_burnable: template.data.is_burnable,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...templateOperations, ...templateFields];
export const execute = executeTemplateAction;
