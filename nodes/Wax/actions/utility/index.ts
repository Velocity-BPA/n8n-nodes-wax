/**
 * Utility Resource
 * Helper operations for WAX blockchain development
 * 
 * Provides validation, conversion, serialization, and chain info utilities
 */

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { chainQuery, getChainInfo, getAccount } from '../../transport/eosClient';
import { isValidAccountName } from '../../utils/accountUtils';
import { isValidAssetId, parseWaxAmount, WAXP_PRECISION } from '../../utils/assetUtils';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Convert Units',
				value: 'convertUnits',
				description: 'Convert between WAXP units (WAXP has 8 decimals)',
				action: 'Convert WAX units',
			},
			{
				name: 'Validate Account Name',
				value: 'validateAccountName',
				description: 'Validate a WAX account name format',
				action: 'Validate account name',
			},
			{
				name: 'Validate Asset ID',
				value: 'validateAssetId',
				description: 'Validate an AtomicAssets asset ID',
				action: 'Validate asset ID',
			},
			{
				name: 'Sign Data',
				value: 'signData',
				description: 'Sign arbitrary data with private key',
				action: 'Sign data',
			},
			{
				name: 'Verify Signature',
				value: 'verifySignature',
				description: 'Verify a signature against public key',
				action: 'Verify signature',
			},
			{
				name: 'Get Chain Info',
				value: 'getChainInfo',
				description: 'Get blockchain info (head block, chain ID, etc.)',
				action: 'Get chain info',
			},
			{
				name: 'Get Block',
				value: 'getBlock',
				description: 'Get block by number or ID',
				action: 'Get block',
			},
			{
				name: 'Get Block Info',
				value: 'getBlockInfo',
				description: 'Get minimal block information',
				action: 'Get block info',
			},
			{
				name: 'Get ABI',
				value: 'getAbi',
				description: 'Get contract ABI',
				action: 'Get contract ABI',
			},
			{
				name: 'Serialize Action',
				value: 'serializeAction',
				description: 'Serialize action data to hex',
				action: 'Serialize action',
			},
			{
				name: 'Deserialize Action',
				value: 'deserializeAction',
				description: 'Deserialize hex action data',
				action: 'Deserialize action',
			},
			{
				name: 'Get Producers',
				value: 'getProducers',
				description: 'Get list of block producers',
				action: 'Get block producers',
			},
			{
				name: 'Account Exists',
				value: 'accountExists',
				description: 'Check if an account exists on chain',
				action: 'Check account exists',
			},
			{
				name: 'Parse Asset String',
				value: 'parseAssetString',
				description: 'Parse a WAX asset string',
				action: 'Parse asset string',
			},
			{
				name: 'Format Asset',
				value: 'formatAsset',
				description: 'Format amount to WAX asset string',
				action: 'Format asset string',
			},
		],
		default: 'validateAccountName',
	},
];

export const utilityFields: INodeProperties[] = [
	// Amount for conversion
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.00000000',
		description: 'Amount to convert',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits', 'formatAsset'],
			},
		},
	},
	// Conversion direction
	{
		displayName: 'Convert From',
		name: 'convertFrom',
		type: 'options',
		required: true,
		options: [
			{ name: 'WAXP (Full Units)', value: 'waxp' },
			{ name: 'Smallest Unit (Sats)', value: 'sats' },
		],
		default: 'waxp',
		description: 'Unit to convert from',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
	},
	// Account name for validation
	{
		displayName: 'Account Name',
		name: 'accountName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'myaccount123',
		description: 'WAX account name to validate',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateAccountName', 'accountExists', 'getAbi'],
			},
		},
	},
	// Asset ID for validation
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1099511627776',
		description: 'AtomicAssets asset ID to validate',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateAssetId'],
			},
		},
	},
	// Data to sign
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Message to sign',
		description: 'Data to sign or verify',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['signData', 'verifySignature'],
			},
		},
	},
	// Signature for verification
	{
		displayName: 'Signature',
		name: 'signature',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'SIG_K1_...',
		description: 'Signature to verify',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
	},
	// Public key for verification
	{
		displayName: 'Public Key',
		name: 'publicKey',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'EOS/PUB_K1...',
		description: 'Public key to verify against',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
	},
	// Block identifier
	{
		displayName: 'Block Identifier',
		name: 'blockId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12345678 or block hash',
		description: 'Block number or block ID/hash',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getBlock', 'getBlockInfo'],
			},
		},
	},
	// Contract for serialization
	{
		displayName: 'Contract',
		name: 'contract',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'eosio.token',
		description: 'Contract account for action',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['serializeAction', 'deserializeAction'],
			},
		},
	},
	// Action name for serialization
	{
		displayName: 'Action Name',
		name: 'actionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'transfer',
		description: 'Name of the action',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['serializeAction', 'deserializeAction'],
			},
		},
	},
	// Action data for serialization
	{
		displayName: 'Action Data (JSON)',
		name: 'actionData',
		type: 'json',
		required: true,
		default: '{}',
		description: 'Action data as JSON object',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['serializeAction'],
			},
		},
	},
	// Hex data for deserialization
	{
		displayName: 'Hex Data',
		name: 'hexData',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'aabbccdd...',
		description: 'Serialized action data in hex',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['deserializeAction'],
			},
		},
	},
	// Asset string for parsing
	{
		displayName: 'Asset String',
		name: 'assetString',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.00000000 WAX',
		description: 'WAX asset string to parse (e.g., "1.00000000 WAX")',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['parseAssetString'],
			},
		},
	},
	// Symbol for formatting
	{
		displayName: 'Token Symbol',
		name: 'tokenSymbol',
		type: 'string',
		required: true,
		default: 'WAX',
		placeholder: 'WAX',
		description: 'Token symbol (e.g., WAX, TLM)',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['formatAsset'],
			},
		},
	},
	// Precision for formatting
	{
		displayName: 'Precision',
		name: 'precision',
		type: 'number',
		required: true,
		default: 8,
		description: 'Number of decimal places (WAX = 8, TLM = 4)',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['formatAsset'],
			},
		},
	},
	// Producer options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getProducers'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 21,
				description: 'Number of producers to return',
			},
			{
				displayName: 'Lower Bound',
				name: 'lowerBound',
				type: 'string',
				default: '',
				description: 'Lower bound producer name',
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

	if (operation === 'convertUnits') {
		const amount = this.getNodeParameter('amount', index) as string;
		const convertFrom = this.getNodeParameter('convertFrom', index) as string;

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum)) {
			throw new Error(`Invalid amount: ${amount}`);
		}

		const multiplier = Math.pow(10, WAXP_PRECISION);

		if (convertFrom === 'waxp') {
			// Convert WAXP to smallest units
			const sats = Math.round(amountNum * multiplier);
			result = {
				input: { amount: amountNum, unit: 'WAXP' },
				output: { amount: sats, unit: 'smallest_unit' },
				formatted: `${amountNum.toFixed(WAXP_PRECISION)} WAX = ${sats} smallest units`,
			};
		} else {
			// Convert smallest units to WAXP
			const waxp = amountNum / multiplier;
			result = {
				input: { amount: amountNum, unit: 'smallest_unit' },
				output: { amount: waxp, unit: 'WAXP' },
				formatted: `${amountNum} smallest units = ${waxp.toFixed(WAXP_PRECISION)} WAX`,
			};
		}
	}

	else if (operation === 'validateAccountName') {
		const accountName = this.getNodeParameter('accountName', index) as string;
		const valid = isValidAccountName(accountName);

		const issues: string[] = [];
		if (accountName.length > 12) issues.push('Name must be 12 characters or less');
		if (accountName.length === 0) issues.push('Name cannot be empty');
		if (/[^a-z1-5.]/.test(accountName)) issues.push('Name can only contain a-z, 1-5, and . (period)');
		if (accountName.startsWith('.') || accountName.endsWith('.')) issues.push('Name cannot start or end with a period');
		if (accountName.includes('..')) issues.push('Name cannot contain consecutive periods');

		result = {
			accountName,
			valid,
			issues: issues.length > 0 ? issues : undefined,
			format: 'Must be 1-12 characters: a-z, 1-5, . (not at start/end, not consecutive)',
		};
	}

	else if (operation === 'validateAssetId') {
		const assetId = this.getNodeParameter('assetId', index) as string;
		const valid = isValidAssetId(assetId);

		const issues: string[] = [];
		if (!/^\d+$/.test(assetId)) issues.push('Asset ID must be numeric');
		if (assetId.length === 0) issues.push('Asset ID cannot be empty');

		result = {
			assetId,
			valid,
			issues: issues.length > 0 ? issues : undefined,
			format: 'AtomicAssets asset IDs are unsigned 64-bit integers',
		};
	}

	else if (operation === 'signData') {
		const data = this.getNodeParameter('data', index) as string;
		
		// Note: This requires the private key from credentials
		// For security, we'll provide the hash but actual signing requires eosjs
		const crypto = require('crypto');
		const hash = crypto.createHash('sha256').update(data).digest('hex');

		result = {
			data,
			hash,
			message: 'To sign this data, use the transaction signing functionality with your private key credentials',
			note: 'Direct message signing requires eosjs Signature class with private key access',
		};
	}

	else if (operation === 'verifySignature') {
		const data = this.getNodeParameter('data', index) as string;
		const signature = this.getNodeParameter('signature', index) as string;
		const publicKey = this.getNodeParameter('publicKey', index) as string;

		// Basic format validation
		const validSigFormat = signature.startsWith('SIG_K1_') || signature.startsWith('SIG_R1_');
		const validKeyFormat = publicKey.startsWith('EOS') || publicKey.startsWith('PUB_K1_') || publicKey.startsWith('PUB_R1_');

		result = {
			data,
			signature: signature.substring(0, 20) + '...',
			publicKey: publicKey.substring(0, 20) + '...',
			signatureFormatValid: validSigFormat,
			publicKeyFormatValid: validKeyFormat,
			note: 'Full cryptographic verification requires eosjs Signature.verify()',
		};
	}

	else if (operation === 'getChainInfo') {
		const info = await getChainInfo.call(this);

		result = {
			chainId: info.chain_id,
			headBlockNum: info.head_block_num,
			headBlockTime: info.head_block_time,
			headBlockId: info.head_block_id,
			headBlockProducer: info.head_block_producer,
			lastIrreversibleBlockNum: info.last_irreversible_block_num,
			lastIrreversibleBlockId: info.last_irreversible_block_id,
			virtualBlockCpuLimit: info.virtual_block_cpu_limit,
			virtualBlockNetLimit: info.virtual_block_net_limit,
			blockCpuLimit: info.block_cpu_limit,
			blockNetLimit: info.block_net_limit,
			serverVersion: info.server_version,
			serverVersionString: info.server_version_string,
			forkDbHeadBlockNum: info.fork_db_head_block_num,
			forkDbHeadBlockId: info.fork_db_head_block_id,
		};
	}

	else if (operation === 'getBlock') {
		const blockId = this.getNodeParameter('blockId', index) as string;

		const response = await chainQuery.call(this, '/v1/chain/get_block', {
			block_num_or_id: blockId,
		});

		result = {
			blockNum: response.block_num,
			blockId: response.id,
			timestamp: response.timestamp,
			producer: response.producer,
			confirmed: response.confirmed,
			previous: response.previous,
			transactionMroot: response.transaction_mroot,
			actionMroot: response.action_mroot,
			scheduleVersion: response.schedule_version,
			producerSignature: response.producer_signature,
			transactions: response.transactions?.length || 0,
			refBlockPrefix: response.ref_block_prefix,
		};
	}

	else if (operation === 'getBlockInfo') {
		const blockId = this.getNodeParameter('blockId', index) as string;

		const response = await chainQuery.call(this, '/v1/chain/get_block_info', {
			block_num: parseInt(blockId, 10),
		});

		result = {
			blockNum: response.block_num,
			refBlockNum: response.ref_block_num,
			refBlockPrefix: response.ref_block_prefix,
			timestamp: response.timestamp,
			producer: response.producer,
			confirmed: response.confirmed,
			previous: response.previous,
			id: response.id,
		};
	}

	else if (operation === 'getAbi') {
		const accountName = this.getNodeParameter('accountName', index) as string;

		const response = await chainQuery.call(this, '/v1/chain/get_abi', {
			account_name: accountName,
		});

		const abi = response.abi;
		result = {
			accountName,
			hasAbi: !!abi,
			version: abi?.version,
			types: abi?.types?.length || 0,
			structs: abi?.structs?.map((s: any) => s.name) || [],
			actions: abi?.actions?.map((a: any) => a.name) || [],
			tables: abi?.tables?.map((t: any) => t.name) || [],
			ricardianClauses: abi?.ricardian_clauses?.length || 0,
			errorMessages: abi?.error_messages?.length || 0,
			abiExtensions: abi?.abi_extensions?.length || 0,
			variants: abi?.variants?.length || 0,
		};
	}

	else if (operation === 'serializeAction') {
		const contract = this.getNodeParameter('contract', index) as string;
		const actionName = this.getNodeParameter('actionName', index) as string;
		const actionData = this.getNodeParameter('actionData', index) as object;

		// Use chain API to serialize
		const response = await chainQuery.call(this, '/v1/chain/abi_json_to_bin', {
			code: contract,
			action: actionName,
			args: actionData,
		});

		result = {
			contract,
			action: actionName,
			data: actionData,
			binargs: response.binargs,
			byteLength: response.binargs ? response.binargs.length / 2 : 0,
		};
	}

	else if (operation === 'deserializeAction') {
		const contract = this.getNodeParameter('contract', index) as string;
		const actionName = this.getNodeParameter('actionName', index) as string;
		const hexData = this.getNodeParameter('hexData', index) as string;

		// Use chain API to deserialize
		const response = await chainQuery.call(this, '/v1/chain/abi_bin_to_json', {
			code: contract,
			action: actionName,
			binargs: hexData,
		});

		result = {
			contract,
			action: actionName,
			hexData: hexData.substring(0, 32) + (hexData.length > 32 ? '...' : ''),
			args: response.args,
		};
	}

	else if (operation === 'getProducers') {
		const options = this.getNodeParameter('options', index, {}) as {
			limit?: number;
			lowerBound?: string;
		};

		const response = await chainQuery.call(this, '/v1/chain/get_producers', {
			json: true,
			limit: options.limit || 21,
			lower_bound: options.lowerBound || '',
		});

		result = {
			producers: response.rows?.map((p: any) => ({
				owner: p.owner,
				totalVotes: parseFloat(p.total_votes),
				producerKey: p.producer_key,
				isActive: p.is_active === 1,
				url: p.url,
				unpaidBlocks: p.unpaid_blocks,
				lastClaimTime: p.last_claim_time,
				location: p.location,
			})) || [],
			totalProducerVoteWeight: response.total_producer_vote_weight,
			more: response.more,
		};
	}

	else if (operation === 'accountExists') {
		const accountName = this.getNodeParameter('accountName', index) as string;

		if (!isValidAccountName(accountName)) {
			result = {
				accountName,
				exists: false,
				error: 'Invalid account name format',
			};
		} else {
			try {
				const account = await getAccount.call(this, accountName);
				result = {
					accountName,
					exists: true,
					created: account.created,
					ramQuota: account.ram_quota,
					netWeight: account.net_weight,
					cpuWeight: account.cpu_weight,
				};
			} catch (error: any) {
				if (error.message?.includes('unknown key') || error.message?.includes('Account not found')) {
					result = {
						accountName,
						exists: false,
					};
				} else {
					throw error;
				}
			}
		}
	}

	else if (operation === 'parseAssetString') {
		const assetString = this.getNodeParameter('assetString', index) as string;

		const parsed = parseWaxAmount(assetString);
		const parts = assetString.trim().split(' ');
		const amountPart = parts[0] || '0';
		const symbolPart = parts[1] || 'UNKNOWN';
		const decimalPlaces = amountPart.includes('.') ? amountPart.split('.')[1].length : 0;

		result = {
			original: assetString,
			amount: parsed,
			symbol: symbolPart,
			precision: decimalPlaces,
			formatted: `${parsed.toFixed(decimalPlaces)} ${symbolPart}`,
		};
	}

	else if (operation === 'formatAsset') {
		const amount = this.getNodeParameter('amount', index) as string;
		const tokenSymbol = this.getNodeParameter('tokenSymbol', index) as string;
		const precision = this.getNodeParameter('precision', index) as number;

		const amountNum = parseFloat(amount);
		if (isNaN(amountNum)) {
			throw new Error(`Invalid amount: ${amount}`);
		}

		const formatted = `${amountNum.toFixed(precision)} ${tokenSymbol}`;

		result = {
			amount: amountNum,
			symbol: tokenSymbol,
			precision,
			formatted,
		};
	}

	else {
		throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...utilityOperations, ...utilityFields];
