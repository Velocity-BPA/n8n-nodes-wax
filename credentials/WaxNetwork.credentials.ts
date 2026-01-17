import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WaxNetwork implements ICredentialType {
	name = 'waxNetwork';
	displayName = 'WAX Network';
	documentationUrl = 'https://developer.wax.io/';
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
			description: 'Select the WAX network to connect to',
		},
		{
			displayName: 'Chain API Endpoint',
			name: 'chainApiEndpoint',
			type: 'string',
			default: 'https://wax.greymass.com',
			description: 'The WAX Chain API endpoint URL',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Hyperion Endpoint',
			name: 'hyperionEndpoint',
			type: 'string',
			default: 'https://wax.eosusa.io',
			description: 'The Hyperion history API endpoint for historical data queries',
			displayOptions: {
				show: {
					network: ['custom'],
				},
			},
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'WAX private key (starts with 5 for legacy or PVT_K1_ for new format). Required for signing transactions.',
		},
		{
			displayName: 'Account Name',
			name: 'accountName',
			type: 'string',
			default: '',
			description: 'Your WAX account name (12 characters, a-z, 1-5, .)',
			placeholder: 'myaccount123',
		},
		{
			displayName: 'Permission',
			name: 'permission',
			type: 'string',
			default: 'active',
			description: 'Permission level to use for transactions',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.network === "mainnet" ? "https://wax.greymass.com" : $credentials.network === "testnet" ? "https://testnet.waxsweden.org" : $credentials.chainApiEndpoint}}',
			url: '/v1/chain/get_info',
			method: 'GET',
		},
	};
}
