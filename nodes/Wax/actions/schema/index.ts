import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { getSchemas, getSchema, getAssets, getTemplates } from '../../transport/atomicApi';
import { createApi, executeTransaction } from '../../transport/eosClient';
import { isValidSchemaName, isValidCollectionName } from '../../utils/assetUtils';

export const schemaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['schema'] } },
		options: [
			{ name: 'Get Schema Info', value: 'getSchemaInfo', description: 'Get schema details', action: 'Get schema info' },
			{ name: 'Get Schema Format', value: 'getSchemaFormat', description: 'Get schema attribute format', action: 'Get schema format' },
			{ name: 'Create Schema', value: 'createSchema', description: 'Create a new schema', action: 'Create schema' },
			{ name: 'Extend Schema', value: 'extendSchema', description: 'Add attributes to existing schema', action: 'Extend schema' },
			{ name: 'Get Assets by Schema', value: 'getAssetsBySchema', description: 'Get all assets using this schema', action: 'Get assets by schema' },
			{ name: 'Get Templates by Schema', value: 'getTemplatesBySchema', description: 'Get all templates using this schema', action: 'Get templates by schema' },
		],
		default: 'getSchemaInfo',
	},
];

export const schemaFields: INodeProperties[] = [
	{
		displayName: 'Collection Name',
		name: 'collectionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mycollection',
		description: 'The collection containing the schema',
		displayOptions: { show: { resource: ['schema'], operation: ['getSchemaInfo', 'getSchemaFormat', 'createSchema', 'extendSchema', 'getAssetsBySchema', 'getTemplatesBySchema'] } },
	},
	{
		displayName: 'Schema Name',
		name: 'schemaName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'myschema',
		description: 'The schema name',
		displayOptions: { show: { resource: ['schema'], operation: ['getSchemaInfo', 'getSchemaFormat', 'extendSchema', 'getAssetsBySchema', 'getTemplatesBySchema'] } },
	},
	{
		displayName: 'New Schema Name',
		name: 'newSchemaName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'items',
		description: 'Name for the new schema (1-12 characters)',
		displayOptions: { show: { resource: ['schema'], operation: ['createSchema'] } },
	},
	{
		displayName: 'Schema Attributes',
		name: 'schemaAttributes',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		placeholder: 'Add Attribute',
		description: 'Define schema attributes',
		displayOptions: { show: { resource: ['schema'], operation: ['createSchema', 'extendSchema'] } },
		options: [
			{
				name: 'attributes',
				displayName: 'Attributes',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'rarity',
						description: 'Attribute name',
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
							{ name: 'Double', value: 'double' },
							{ name: 'Image (IPFS)', value: 'image' },
							{ name: 'IPFS Hash', value: 'ipfs' },
							{ name: 'Bool', value: 'bool' },
						],
						default: 'string',
						description: 'Attribute data type',
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
		displayOptions: { show: { resource: ['schema'], operation: ['getAssetsBySchema', 'getTemplatesBySchema'] } },
	},
];

export async function executeSchemaAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getSchemaInfo': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			if (!isValidCollectionName(collectionName)) throw new Error(`Invalid collection name: ${collectionName}`);
			if (!isValidSchemaName(schemaName)) throw new Error(`Invalid schema name: ${schemaName}`);
			result = await getSchema.call(this, collectionName, schemaName);
			break;
		}

		case 'getSchemaFormat': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const schema = await getSchema.call(this, collectionName, schemaName);
			result = {
				collection_name: collectionName,
				schema_name: schemaName,
				format: schema.data.format,
				created_at_time: schema.data.created_at_time,
			};
			break;
		}

		case 'createSchema': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const newSchemaName = this.getNodeParameter('newSchemaName', index) as string;
			const attributesData = this.getNodeParameter('schemaAttributes', index) as { attributes: { name: string; type: string }[] };
			
			if (!isValidSchemaName(newSchemaName)) throw new Error(`Invalid schema name: ${newSchemaName}`);
			
			const schemaFormat = (attributesData.attributes || []).map(attr => ({
				name: attr.name,
				type: attr.type,
			}));

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'createschema',
				authorization: [{ actor: author, permission: 'active' }],
				data: {
					authorized_creator: author,
					collection_name: collectionName,
					schema_name: newSchemaName,
					schema_format: schemaFormat,
				},
			}]);
			break;
		}

		case 'extendSchema': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const attributesData = this.getNodeParameter('schemaAttributes', index) as { attributes: { name: string; type: string }[] };

			const schemaFormat = (attributesData.attributes || []).map(attr => ({
				name: attr.name,
				type: attr.type,
			}));

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const author = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: 'atomicassets',
				name: 'extendschema',
				authorization: [{ actor: author, permission: 'active' }],
				data: {
					authorized_editor: author,
					collection_name: collectionName,
					schema_name: schemaName,
					schema_format_extension: schemaFormat,
				},
			}]);
			break;
		}

		case 'getAssetsBySchema': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getAssets.call(this, { collection_name: collectionName, schema_name: schemaName, limit });
			break;
		}

		case 'getTemplatesBySchema': {
			const collectionName = this.getNodeParameter('collectionName', index) as string;
			const schemaName = this.getNodeParameter('schemaName', index) as string;
			const limit = this.getNodeParameter('limit', index) as number;
			result = await getTemplates.call(this, { collection_name: collectionName, schema_name: schemaName, limit });
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...schemaOperations, ...schemaFields];
export const execute = executeSchemaAction;
