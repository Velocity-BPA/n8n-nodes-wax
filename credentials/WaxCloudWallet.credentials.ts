import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WaxCloudWallet implements ICredentialType {
	name = 'waxCloudWallet';
	displayName = 'WAX Cloud Wallet';
	documentationUrl = 'https://developer.wax.io/waa/waxjs-demo/';
	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Production',
					value: 'production',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
			],
			default: 'production',
			description: 'Select the WAX Cloud Wallet environment',
		},
		{
			displayName: 'WCW Endpoint',
			name: 'wcwEndpoint',
			type: 'string',
			default: 'https://api-idm.wax.io',
			description: 'The WAX Cloud Wallet API endpoint',
		},
		{
			displayName: 'Account Name',
			name: 'accountName',
			type: 'string',
			default: '',
			required: true,
			description: 'Your WAX Cloud Wallet account name (ends with .wam)',
			placeholder: 'xxxxx.wam',
		},
		{
			displayName: 'Authentication Token',
			name: 'authToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'WAX Cloud Wallet authentication token for API access',
		},
		{
			displayName: 'Session Token',
			name: 'sessionToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Session token for maintaining wallet session',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.authToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.wcwEndpoint}}',
			url: '/v1/health',
			method: 'GET',
		},
	};
}
