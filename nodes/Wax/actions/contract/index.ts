import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createApi, executeTransaction, getTableRows, getAccount, getAbi } from '../../transport/eosClient';
import { isValidAccountName } from '../../utils/accountUtils';

export const contractOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contract'] } },
		options: [
			{ name: 'Get Contract Info', value: 'getContractInfo', description: 'Get contract account information', action: 'Get contract info' },
			{ name: 'Get Contract ABI', value: 'getContractAbi', description: 'Get contract ABI', action: 'Get contract ABI' },
			{ name: 'Get Contract Tables', value: 'getContractTables', description: 'Get list of contract tables', action: 'Get contract tables' },
			{ name: 'Get Table Rows', value: 'getTableRows', description: 'Query contract table data', action: 'Get table rows' },
			{ name: 'Execute Action', value: 'executeAction', description: 'Execute a contract action', action: 'Execute action' },
			{ name: 'Get Contract Actions', value: 'getContractActions', description: 'Get list of contract actions', action: 'Get contract actions' },
			{ name: 'Decode Action Data', value: 'decodeActionData', description: 'Decode action hex data', action: 'Decode action data' },
		],
		default: 'getContractInfo',
	},
];

export const contractFields: INodeProperties[] = [
	{
		displayName: 'Contract Account',
		name: 'contractAccount',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'eosio.token',
		description: 'The contract account name',
		displayOptions: { show: { resource: ['contract'], operation: ['getContractInfo', 'getContractAbi', 'getContractTables', 'getTableRows', 'executeAction', 'getContractActions', 'decodeActionData'] } },
	},
	{
		displayName: 'Table Name',
		name: 'tableName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'accounts',
		description: 'The table name to query',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Scope',
		name: 'scope',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'WAX',
		description: 'The table scope (often token symbol or account name)',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Lower Bound',
		name: 'lowerBound',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Lower bound for table query',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Upper Bound',
		name: 'upperBound',
		type: 'string',
		default: '',
		placeholder: 'myaccount123',
		description: 'Upper bound for table query',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Index Position',
		name: 'indexPosition',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 10 },
		default: 1,
		description: 'Index to use (1 = primary)',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Key Type',
		name: 'keyType',
		type: 'options',
		options: [
			{ name: 'Name', value: 'name' },
			{ name: 'i64', value: 'i64' },
			{ name: 'i128', value: 'i128' },
			{ name: 'i256', value: 'i256' },
			{ name: 'Float64', value: 'float64' },
			{ name: 'Float128', value: 'float128' },
			{ name: 'SHA256', value: 'sha256' },
			{ name: 'Ripemd160', value: 'ripemd160' },
		],
		default: 'name',
		description: 'Type of key to use for bounds',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Reverse',
		name: 'reverse',
		type: 'boolean',
		default: false,
		description: 'Whether to return results in reverse order',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
	{
		displayName: 'Action Name',
		name: 'actionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'transfer',
		description: 'The action to execute',
		displayOptions: { show: { resource: ['contract'], operation: ['executeAction', 'decodeActionData'] } },
	},
	{
		displayName: 'Action Data (JSON)',
		name: 'actionData',
		type: 'json',
		default: '{}',
		placeholder: '{"from": "account1", "to": "account2", "quantity": "1.00000000 WAX", "memo": ""}',
		description: 'Action parameters as JSON',
		displayOptions: { show: { resource: ['contract'], operation: ['executeAction'] } },
	},
	{
		displayName: 'Hex Data',
		name: 'hexData',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0000000000...',
		description: 'Hex-encoded action data to decode',
		displayOptions: { show: { resource: ['contract'], operation: ['decodeActionData'] } },
	},
	{
		displayName: 'Permission',
		name: 'permission',
		type: 'string',
		default: 'active',
		placeholder: 'active',
		description: 'Permission level to use',
		displayOptions: { show: { resource: ['contract'], operation: ['executeAction'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 1000 },
		default: 100,
		description: 'Maximum rows to return',
		displayOptions: { show: { resource: ['contract'], operation: ['getTableRows'] } },
	},
];

export async function executeContractAction(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let result: any;

	switch (operation) {
		case 'getContractInfo': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			if (!isValidAccountName(contractAccount)) throw new Error(`Invalid account name: ${contractAccount}`);
			
			const accountInfo = await getAccount.call(this, contractAccount);
			const hasCode = accountInfo.code_hash !== '0000000000000000000000000000000000000000000000000000000000000000';
			
			result = {
				account: contractAccount,
				has_code: hasCode,
				code_hash: accountInfo.code_hash,
				created: accountInfo.created,
				ram_quota: accountInfo.ram_quota,
				ram_usage: accountInfo.ram_usage,
				net_weight: accountInfo.net_weight,
				cpu_weight: accountInfo.cpu_weight,
				permissions: accountInfo.permissions,
			};
			break;
		}

		case 'getContractAbi': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			const abi = await getAbi.call(this, contractAccount);
			result = {
				account: contractAccount,
				abi: abi.abi,
			};
			break;
		}

		case 'getContractTables': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			const abi = await getAbi.call(this, contractAccount);
			result = {
				account: contractAccount,
				tables: abi.abi?.tables || [],
				count: abi.abi?.tables?.length || 0,
			};
			break;
		}

		case 'getTableRows': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			const tableName = this.getNodeParameter('tableName', index) as string;
			const scope = this.getNodeParameter('scope', index) as string;
			const lowerBound = this.getNodeParameter('lowerBound', index) as string;
			const upperBound = this.getNodeParameter('upperBound', index) as string;
			const indexPosition = this.getNodeParameter('indexPosition', index) as number;
			const keyType = this.getNodeParameter('keyType', index) as string;
			const reverse = this.getNodeParameter('reverse', index) as boolean;
			const limit = this.getNodeParameter('limit', index) as number;

			const params: any = {
				code: contractAccount,
				scope,
				table: tableName,
				limit,
				reverse,
			};

			if (lowerBound) params.lower_bound = lowerBound;
			if (upperBound) params.upper_bound = upperBound;
			if (indexPosition > 1) {
				params.index_position = indexPosition;
				params.key_type = keyType;
			}

			result = await getTableRows.call(this, params);
			break;
		}

		case 'executeAction': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			const actionName = this.getNodeParameter('actionName', index) as string;
			const actionData = this.getNodeParameter('actionData', index) as object;
			const permission = this.getNodeParameter('permission', index) as string;

			const api = await createApi.call(this);
			const credentials = await this.getCredentials('waxNetwork');
			const actor = credentials.accountName as string;

			result = await executeTransaction.call(this, api, [{
				account: contractAccount,
				name: actionName,
				authorization: [{ actor, permission }],
				data: actionData,
			}]);
			break;
		}

		case 'getContractActions': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			const abi = await getAbi.call(this, contractAccount);
			result = {
				account: contractAccount,
				actions: abi.abi?.actions || [],
				count: abi.abi?.actions?.length || 0,
			};
			break;
		}

		case 'decodeActionData': {
			const contractAccount = this.getNodeParameter('contractAccount', index) as string;
			const actionName = this.getNodeParameter('actionName', index) as string;
			const hexData = this.getNodeParameter('hexData', index) as string;

			const api = await createApi.call(this);
			const abi = await getAbi.call(this, contractAccount);
			
			try {
				const decoded = await api.deserializeActions([{
					account: contractAccount,
					name: actionName,
					authorization: [],
					data: hexData,
				}]);
				result = {
					account: contractAccount,
					action: actionName,
					decoded_data: decoded[0]?.data || {},
				};
			} catch (error: any) {
				result = {
					account: contractAccount,
					action: actionName,
					hex_data: hexData,
					error: `Failed to decode: ${error.message}`,
				};
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}


// Exports expected by main node
export const description = [...contractOperations, ...contractFields];
export const execute = executeContractAction;
