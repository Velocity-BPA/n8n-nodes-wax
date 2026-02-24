import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class WAXApi implements ICredentialType {
	name = 'waxApi';
	displayName = 'WAX API';
	documentationUrl = 'https://github.com/pinknetworkx/atomicassets-api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: false,
			description: 'API key for higher rate limits (optional for most endpoints)',
		},
		{
			displayName: 'API Base URL',
			name: 'baseURL',
			type: 'string',
			default: 'https://wax.api.atomicassets.io',
			required: true,
			description: 'Base URL for the WAX AtomicAssets API',
		},
	];
}