import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WaxApi implements ICredentialType {
	name = 'waxApi';
	displayName = 'WAX API';
	documentationUrl = 'https://docs.atomicassets.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://wax.api.atomicassets.io',
			description: 'The base URL for the WAX AtomicAssets API',
			required: true,
		},
	];
}