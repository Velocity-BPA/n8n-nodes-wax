/**
 * Hyperion History Resource
 * Operations for querying WAX blockchain history via Hyperion
 * 
 * Hyperion is a full-history solution for EOSIO/Antelope chains
 * It provides fast, indexed access to all blockchain actions and deltas
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { hyperionRequest } from '../../transport/hyperionClient';

export const hyperionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['hyperion'],
			},
		},
		options: [
			{
				name: 'Get Actions',
				value: 'getActions',
				description: 'Get actions from history',
				action: 'Get actions from history',
			},
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'Get transactions from history',
				action: 'Get transactions from history',
			},
			{
				name: 'Get Transaction',
				value: 'getTransaction',
				description: 'Get a specific transaction by ID',
				action: 'Get transaction by ID',
			},
			{
				name: 'Get Deltas',
				value: 'getDeltas',
				description: 'Get table deltas (state changes)',
				action: 'Get table deltas',
			},
			{
				name: 'Get Account History',
				value: 'getAccountHistory',
				description: 'Get all actions for an account',
				action: 'Get account history',
			},
			{
				name: 'Search Actions',
				value: 'searchActions',
				description: 'Search actions with filters',
				action: 'Search actions',
			},
			{
				name: 'Get Creator',
				value: 'getCreator',
				description: 'Get the creator of an account',
				action: 'Get account creator',
			},
			{
				name: 'Get Key Accounts',
				value: 'getKeyAccounts',
				description: 'Get accounts associated with a public key',
				action: 'Get key accounts',
			},
			{
				name: 'Get Health',
				value: 'getHealth',
				description: 'Get Hyperion node health status',
				action: 'Get health status',
			},
			{
				name: 'Get Tokens',
				value: 'getTokens',
				description: 'Get token balances for an account',
				action: 'Get tokens for account',
			},
			{
				name: 'Get Voters',
				value: 'getVoters',
				description: 'Get voters for a producer',
				action: 'Get producer voters',
			},
			{
				name: 'Get Links',
				value: 'getLinks',
				description: 'Get permission links for an account',
				action: 'Get permission links',
			},
			{
				name: 'Get Proposals',
				value: 'getProposals',
				description: 'Get multisig proposals',
				action: 'Get multisig proposals',
			},
		],
		default: 'getActions',
	},
];

export const hyperionFields: INodeProperties[] = [
	// Account field for most operations
	{
		displayName: 'Account Name',
		name: 'account',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'myaccount123',
		description: 'WAX account name (12 characters, a-z, 1-5, .)',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getActions', 'getAccountHistory', 'getTokens', 'getCreator', 'getLinks'],
			},
		},
	},
	// Transaction ID
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'abc123...',
		description: 'Transaction ID (64 hex characters)',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getTransaction'],
			},
		},
	},
	// Public key
	{
		displayName: 'Public Key',
		name: 'publicKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'EOS/PUB_K1...',
		description: 'Public key in EOS or PUB_K1 format',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getKeyAccounts'],
			},
		},
	},
	// Producer name for voters
	{
		displayName: 'Producer',
		name: 'producer',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'producername',
		description: 'Block producer account name',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getVoters'],
			},
		},
	},
	// Contract for deltas/transactions
	{
		displayName: 'Contract',
		name: 'contract',
		type: 'string',
		required: false,
		default: '',
		placeholder: 'atomicassets',
		description: 'Contract account to filter by',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getDeltas', 'getTransactions', 'searchActions'],
			},
		},
	},
	// Table for deltas
	{
		displayName: 'Table',
		name: 'table',
		type: 'string',
		required: false,
		default: '',
		placeholder: 'assets',
		description: 'Table name to filter deltas',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getDeltas'],
			},
		},
	},
	// Action name for searching
	{
		displayName: 'Action Name',
		name: 'actionName',
		type: 'string',
		required: false,
		default: '',
		placeholder: 'transfer',
		description: 'Action name to filter by',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getActions', 'searchActions'],
			},
		},
	},
	// Search query
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: false,
		default: '',
		placeholder: 'data.to:myaccount123',
		description: 'Elasticsearch query string for advanced filtering',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['searchActions'],
			},
		},
	},
	// Proposer for proposals
	{
		displayName: 'Proposer',
		name: 'proposer',
		type: 'string',
		required: false,
		default: '',
		placeholder: 'proposername',
		description: 'Proposer account name',
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getProposals'],
			},
		},
	},
	// Additional options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['hyperion'],
				operation: ['getActions', 'getTransactions', 'getDeltas', 'getAccountHistory', 'searchActions', 'getVoters', 'getProposals'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of results to skip for pagination',
			},
			{
				displayName: 'After (Date)',
				name: 'after',
				type: 'dateTime',
				default: '',
				description: 'Filter results after this date',
			},
			{
				displayName: 'Before (Date)',
				name: 'before',
				type: 'dateTime',
				default: '',
				description: 'Filter results before this date',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Descending (Newest First)', value: 'desc' },
					{ name: 'Ascending (Oldest First)', value: 'asc' },
				],
				default: 'desc',
				description: 'Sort order for results',
			},
			{
				displayName: 'Track Total',
				name: 'trackTotal',
				type: 'boolean',
				default: false,
				description: 'Whether to return total count (slower query)',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	if (operation === 'getActions') {
		const account = this.getNodeParameter('account', index) as string;
		const actionName = this.getNodeParameter('actionName', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
			after?: string;
			before?: string;
			sort?: string;
			trackTotal?: boolean;
		};

		const params: Record<string, any> = {
			account,
			limit: options.limit || 100,
			skip: options.skip || 0,
			sort: options.sort || 'desc',
		};

		if (actionName) params['act.name'] = actionName;
		if (options.after) params.after = new Date(options.after).toISOString();
		if (options.before) params.before = new Date(options.before).toISOString();
		if (options.trackTotal) params.track = 'true';

		const response = await hyperionRequest.call(this, '/v2/history/get_actions', params);

		result = {
			account,
			actions: response.actions || [],
			total: response.total?.value || response.actions?.length || 0,
			lib: response.lib,
			queryTime: response.query_time_ms,
		};
	}

	else if (operation === 'getTransactions') {
		const contract = this.getNodeParameter('contract', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
			after?: string;
			before?: string;
			sort?: string;
		};

		const params: Record<string, any> = {
			limit: options.limit || 100,
			skip: options.skip || 0,
			sort: options.sort || 'desc',
		};

		if (contract) params.account = contract;
		if (options.after) params.after = new Date(options.after).toISOString();
		if (options.before) params.before = new Date(options.before).toISOString();

		const response = await hyperionRequest.call(this, '/v2/history/get_transaction', params);

		result = {
			transactions: response.transactions || [],
			total: response.total?.value || 0,
			queryTime: response.query_time_ms,
		};
	}

	else if (operation === 'getTransaction') {
		const transactionId = this.getNodeParameter('transactionId', index) as string;

		const response = await hyperionRequest.call(this, '/v2/history/get_transaction', {
			id: transactionId,
		});

		result = {
			transactionId,
			executed: response.executed,
			trxId: response.trx_id,
			lib: response.lib,
			actions: response.actions || [],
			blockNum: response.block_num,
			blockTime: response.block_time,
			producer: response.producer,
			cpuUsage: response.cpu_usage_us,
			netUsage: response.net_usage_words,
		};
	}

	else if (operation === 'getDeltas') {
		const contract = this.getNodeParameter('contract', index, '') as string;
		const table = this.getNodeParameter('table', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
			after?: string;
			before?: string;
		};

		const params: Record<string, any> = {
			limit: options.limit || 100,
			skip: options.skip || 0,
		};

		if (contract) params.code = contract;
		if (table) params.table = table;
		if (options.after) params.after = new Date(options.after).toISOString();
		if (options.before) params.before = new Date(options.before).toISOString();

		const response = await hyperionRequest.call(this, '/v2/history/get_deltas', params);

		result = {
			deltas: response.deltas || [],
			total: response.total?.value || response.deltas?.length || 0,
			queryTime: response.query_time_ms,
		};
	}

	else if (operation === 'getAccountHistory') {
		const account = this.getNodeParameter('account', index) as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
			after?: string;
			before?: string;
			sort?: string;
		};

		const params: Record<string, any> = {
			account,
			limit: options.limit || 100,
			skip: options.skip || 0,
			sort: options.sort || 'desc',
		};

		if (options.after) params.after = new Date(options.after).toISOString();
		if (options.before) params.before = new Date(options.before).toISOString();

		// Get all actions where account is actor or is referenced in action data
		const response = await hyperionRequest.call(this, '/v2/history/get_actions', params);

		// Group by action type
		const actionsByType: Record<string, number> = {};
		const actions = response.actions || [];
		for (const action of actions) {
			const actionType = `${action.act?.account}::${action.act?.name}`;
			actionsByType[actionType] = (actionsByType[actionType] || 0) + 1;
		}

		result = {
			account,
			actions,
			total: response.total?.value || actions.length,
			actionsByType,
			lib: response.lib,
			queryTime: response.query_time_ms,
		};
	}

	else if (operation === 'searchActions') {
		const contract = this.getNodeParameter('contract', index, '') as string;
		const actionName = this.getNodeParameter('actionName', index, '') as string;
		const searchQuery = this.getNodeParameter('searchQuery', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
			after?: string;
			before?: string;
			sort?: string;
		};

		const params: Record<string, any> = {
			limit: options.limit || 100,
			skip: options.skip || 0,
			sort: options.sort || 'desc',
		};

		if (contract) params['act.account'] = contract;
		if (actionName) params['act.name'] = actionName;
		if (searchQuery) params.q = searchQuery;
		if (options.after) params.after = new Date(options.after).toISOString();
		if (options.before) params.before = new Date(options.before).toISOString();

		const response = await hyperionRequest.call(this, '/v2/history/get_actions', params);

		result = {
			filters: { contract, actionName, searchQuery },
			actions: response.actions || [],
			total: response.total?.value || response.actions?.length || 0,
			queryTime: response.query_time_ms,
		};
	}

	else if (operation === 'getCreator') {
		const account = this.getNodeParameter('account', index) as string;

		const response = await hyperionRequest.call(this, '/v2/history/get_creator', {
			account,
		});

		result = {
			account,
			creator: response.creator,
			timestamp: response.timestamp,
			blockNum: response.block_num,
			trxId: response.trx_id,
		};
	}

	else if (operation === 'getKeyAccounts') {
		const publicKey = this.getNodeParameter('publicKey', index) as string;

		const response = await hyperionRequest.call(this, '/v2/state/get_key_accounts', {
			public_key: publicKey,
		});

		result = {
			publicKey,
			accounts: response.account_names || [],
			permissions: response.permissions || [],
		};
	}

	else if (operation === 'getHealth') {
		const response = await hyperionRequest.call(this, '/v2/health', {});

		result = {
			version: response.version,
			versionHash: response.version_hash,
			host: response.host,
			features: response.features,
			health: response.health || [],
			queryTime: response.query_time_ms,
		};
	}

	else if (operation === 'getTokens') {
		const account = this.getNodeParameter('account', index) as string;

		const response = await hyperionRequest.call(this, '/v2/state/get_tokens', {
			account,
		});

		result = {
			account,
			tokens: response.tokens || [],
			total: response.tokens?.length || 0,
		};
	}

	else if (operation === 'getVoters') {
		const producer = this.getNodeParameter('producer', index) as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
		};

		const response = await hyperionRequest.call(this, '/v2/state/get_voters', {
			producer,
			limit: options.limit || 100,
			skip: options.skip || 0,
		});

		result = {
			producer,
			voters: response.voters || [],
			total: response.total?.value || response.voters?.length || 0,
		};
	}

	else if (operation === 'getLinks') {
		const account = this.getNodeParameter('account', index) as string;

		const response = await hyperionRequest.call(this, '/v2/state/get_links', {
			account,
		});

		result = {
			account,
			links: response.links || [],
			total: response.links?.length || 0,
		};
	}

	else if (operation === 'getProposals') {
		const proposer = this.getNodeParameter('proposer', index, '') as string;
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			skip?: number;
		};

		const params: Record<string, any> = {
			limit: options.limit || 100,
			skip: options.skip || 0,
		};

		if (proposer) params.proposer = proposer;

		const response = await hyperionRequest.call(this, '/v2/state/get_proposals', params);

		result = {
			proposals: response.proposals || [],
			total: response.total?.value || response.proposals?.length || 0,
		};
	}

	else {
		throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...hyperionOperations, ...hyperionFields];
