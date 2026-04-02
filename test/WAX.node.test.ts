/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { WAX } from '../nodes/WAX/WAX.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('WAX Node', () => {
  let node: WAX;

  beforeAll(() => {
    node = new WAX();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('WAX');
      expect(node.description.name).toBe('wax');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 6 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(6);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(6);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('AtomicAssets Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://wax.api.atomicassets.io' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  it('should get assets successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAssets');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('testowner');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('testcollection');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(100);
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(1);

    const mockResponse = { success: true, data: [] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=testowner&collection_name=testcollection&limit=100&page=1',
      json: true,
    });
  });

  it('should get specific asset successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAsset');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('1099511627776');

    const mockResponse = { success: true, data: { asset_id: '1099511627776' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://wax.api.atomicassets.io/atomicassets/v1/assets/1099511627776',
      json: true,
    });
  });

  it('should handle API errors gracefully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getAsset');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('invalid-id');
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);

    const mockError = new Error('Asset not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: { error: 'Asset not found' }, pairedItem: { item: 0 } }]);
  });

  it('should get collections successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getCollections');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('testauthor');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(50);
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(1);

    const mockResponse = { success: true, data: [] };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
  });

  it('should get specific template successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTemplate');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('testcollection');
    mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('123456');

    const mockResponse = { success: true, data: { template_id: '123456' } };
    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://wax.api.atomicassets.io/atomicassets/v1/templates/testcollection/123456',
      json: true,
    });
  });
});

describe('AtomicMarket Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getSales operation', () => {
		it('should get sales list successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'getSales';
					case 'state': return '1';
					case 'seller': return 'testseller';
					case 'buyer': return '';
					case 'collectionName': return 'testcoll';
					case 'limit': return 100;
					case 'page': return 1;
					default: return '';
				}
			});

			const mockResponse = {
				success: true,
				data: [{ sale_id: '123', seller: 'testseller' }],
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAtomicMarketOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/atomicmarket/v1/sales'),
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});

		it('should handle getSales error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getSales');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAtomicMarketOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('API Error');
		});
	});

	describe('getSale operation', () => {
		it('should get specific sale successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'getSale';
					case 'saleId': return '123';
					default: return '';
				}
			});

			const mockResponse = {
				success: true,
				data: { sale_id: '123', seller: 'testseller' },
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAtomicMarketOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicmarket/v1/sales/123',
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAuctions operation', () => {
		it('should get auctions list successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'getAuctions';
					case 'state': return '1';
					case 'seller': return 'testseller';
					case 'bidder': return 'testbidder';
					case 'collectionName': return 'testcoll';
					case 'limit': return 50;
					case 'page': return 1;
					default: return '';
				}
			});

			const mockResponse = {
				success: true,
				data: [{ auction_id: '456', seller: 'testseller' }],
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAtomicMarketOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/atomicmarket/v1/auctions'),
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getPrices operation', () => {
		it('should get prices successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
				switch (param) {
					case 'operation': return 'getPrices';
					case 'collectionName': return 'testcoll';
					case 'templateId': return '12345';
					case 'symbol': return 'WAX';
					default: return '';
				}
			});

			const mockResponse = {
				success: true,
				data: [{ template_id: '12345', median: '100.0000 WAX' }],
			};
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAtomicMarketOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: expect.stringContaining('/atomicmarket/v1/prices'),
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Accounts Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://wax.api.atomicassets.io',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getAccounts operation', () => {
		it('should get accounts successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccounts')
				.mockReturnValueOnce('test')
				.mockReturnValueOnce('collection1')
				.mockReturnValueOnce(50)
				.mockReturnValueOnce(1);

			const mockResponse = { data: [{ account: 'testaccount' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts?match=test&collection_name=collection1&limit=50&page=1',
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});

		it('should handle errors in getAccounts', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getAccounts');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result[0].json.error).toBe('API Error');
		});
	});

	describe('getAccount operation', () => {
		it('should get account successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccount')
				.mockReturnValueOnce('testaccount');

			const mockResponse = { data: { account: 'testaccount' } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts/testaccount',
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAccountCollections operation', () => {
		it('should get account collections successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountCollections')
				.mockReturnValueOnce('testaccount')
				.mockReturnValueOnce(25)
				.mockReturnValueOnce(2);

			const mockResponse = { data: [{ collection_name: 'collection1' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts/testaccount/collections?limit=25&page=2',
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});
	});

	describe('getAccountCollection operation', () => {
		it('should get account collection successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getAccountCollection')
				.mockReturnValueOnce('testaccount')
				.mockReturnValueOnce('testcollection');

			const mockResponse = { data: [{ asset_id: '123' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeAccountsOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts/testaccount/testcollection',
				json: true,
			});
			expect(result[0].json).toEqual(mockResponse);
		});
	});
});

describe('Transfers Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        baseUrl: 'https://wax.api.atomicassets.io'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      }
    };
  });

  describe('getTransfers operation', () => {
    it('should get transfers successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            transfer_id: '123456',
            sender: 'sender.wax',
            recipient: 'recipient.wax',
            assets: []
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransfers')
        .mockReturnValueOnce('test.wax')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce('')
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(1);

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransfersOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle getTransfers error', async () => {
      const error = new Error('API Error');
      mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getTransfers');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeTransfersOperations.call(mockExecuteFunctions, items);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getTransfer operation', () => {
    it('should get transfer successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          transfer_id: '123456',
          sender: 'sender.wax',
          recipient: 'recipient.wax',
          assets: []
        }
      };

      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransfer')
        .mockReturnValueOnce('123456');

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeTransfersOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle getTransfer error', async () => {
      const error = new Error('Transfer not found');
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getTransfer')
        .mockReturnValueOnce('invalid-id');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const items = [{ json: {} }];
      const result = await executeTransfersOperations.call(mockExecuteFunctions, items);

      expect(result[0].json.error).toBe('Transfer not found');
    });
  });
});

describe('Burns Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({ apiKey: 'test-key', baseUrl: 'https://wax.api.atomicassets.io' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: { httpRequest: jest.fn(), requestWithAuthentication: jest.fn() },
    };
  });

  describe('getBurns operation', () => {
    it('should get burns with filters', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBurns';
          case 'collectionName': return 'testcollection';
          case 'schemaName': return '';
          case 'templateId': return '';
          case 'burnedByAccount': return '';
          case 'limit': return 100;
          case 'page': return 1;
          default: return '';
        }
      });

      const mockResponse = { data: [{ burn_id: '1', asset_id: '123' }] };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBurnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/burns?collection_name=testcollection&limit=100&page=1',
        json: true,
      });
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle getBurns errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getBurns');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBurnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });

  describe('getBurn operation', () => {
    it('should get specific burn', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBurn';
          case 'burnId': return '12345';
          default: return '';
        }
      });

      const mockResponse = { data: { burn_id: '12345', asset_id: '123' } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeBurnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/burns/12345',
        json: true,
      });
      expect(result[0].json).toEqual(mockResponse);
    });

    it('should handle getBurn errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBurn';
          case 'burnId': return '12345';
          default: return '';
        }
      });
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeBurnsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result[0].json.error).toBe('API Error');
    });
  });
});

describe('Config Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				baseUrl: 'https://wax.api.atomicassets.io',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getConfig operation', () => {
		it('should get AtomicAssets configuration successfully', async () => {
			const mockConfig = {
				success: true,
				data: {
					contract: 'atomicassets',
					version: '1.3.0',
					collection_format: [],
					supported_tokens: [],
				},
			};

			mockExecuteFunctions.getNodeParameter.mockReturnValue('getConfig');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockConfig);

			const result = await executeConfigOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicassets/v1/config',
				headers: {
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockConfig, pairedItem: { item: 0 } }]);
		});

		it('should handle getConfig errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getConfig');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeConfigOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('getMarketConfig operation', () => {
		it('should get AtomicMarket configuration successfully', async () => {
			const mockConfig = {
				success: true,
				data: {
					contract: 'atomicmarket',
					version: '1.3.0',
					maker_market_fee: 0.02,
					taker_market_fee: 0.02,
					minimum_auction_duration: 300,
				},
			};

			mockExecuteFunctions.getNodeParameter.mockReturnValue('getMarketConfig');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockConfig);

			const result = await executeConfigOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://wax.api.atomicassets.io/atomicmarket/v1/config',
				headers: {
					'Content-Type': 'application/json',
				},
				json: true,
			});
			expect(result).toEqual([{ json: mockConfig, pairedItem: { item: 0 } }]);
		});

		it('should handle getMarketConfig errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getMarketConfig');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Market API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeConfigOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Market API Error' }, pairedItem: { item: 0 } }]);
		});
	});
});
});
