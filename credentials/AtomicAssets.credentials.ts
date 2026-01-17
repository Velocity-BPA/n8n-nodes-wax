import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AtomicAssets implements ICredentialType {
	name = 'atomicAssets';
	displayName = 'AtomicAssets API';
	documentationUrl = 'https://wax.api.atomicassets.io/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'WAX Mainnet',
					value: 'mainnet',
				},
				{
					name: 'WAX Testnet',
					value: 'testnet',
				},
				{
					name: 'Custom',
					value: 'custom',
				},
			],
			default: 'mainnet',
			description: 'Select the network for AtomicAssets API',
		},
		{
			displayName: 'AtomicAssets API Endpoint',
			name: 'atomicAssetsEndpoint',
			type: 'string',
			default: 'https://wax.api.atomicassets.io',
			description: 'The AtomicAssets API endpoint URL',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'AtomicMarket API Endpoint',
			name: 'atomicMarketEndpoint',
			type: 'string',
			default: 'https://wax.api.atomicassets.io',
			description: 'The AtomicMarket API endpoint URL',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Optional API key for rate-limited endpoints',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://wax.api.atomicassets.io" : $credentials.network === "testnet" ? "https://test.wax.api.atomicassets.io" : $credentials.atomicAssetsEndpoint}}',
			url: '/health',
			method: 'GET',
		},
	};
}
