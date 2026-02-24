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

    it('should define 8 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(8);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(8);
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
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  test('should get assets successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAssets',
        owner: 'testowner',
        collectionName: 'testcollection',
        limit: 10,
        page: 1,
      };
      return params[param];
    });

    const mockResponse = {
      success: true,
      data: [
        { asset_id: '1', owner: 'testowner', collection: { name: 'testcollection' } }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/atomicassets/v1/assets'),
      })
    );
  });

  test('should get specific asset successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAsset',
        assetId: '12345',
      };
      return params[param];
    });

    const mockResponse = {
      success: true,
      data: { asset_id: '12345', owner: 'testowner' }
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/atomicassets/v1/assets/12345'),
      })
    );
  });

  test('should get asset stats successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAssetStats',
        assetId: '12345',
      };
      return params[param];
    });

    const mockResponse = {
      success: true,
      data: { asset_id: '12345', transfers: 5, views: 100 }
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/atomicassets/v1/assets/12345/stats'),
      })
    );
  });

  test('should get asset logs successfully', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAssetLogs',
        assetId: '12345',
        page: 1,
        limit: 10,
      };
      return params[param];
    });

    const mockResponse = {
      success: true,
      data: [
        { log_id: 1, asset_id: '12345', action: 'transfer' }
      ]
    };

    mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual(mockResponse);
    expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/atomicassets/v1/assets/12345/logs'),
      })
    );
  });

  test('should handle API errors', async () => {
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAsset',
        assetId: 'invalid',
      };
      return params[param];
    });

    const mockError = new Error('Asset not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    await expect(executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]))
      .rejects.toThrow('Asset not found');
  });

  test('should handle errors gracefully when continueOnFail is true', async () => {
    mockExecuteFunctions.continueOnFail.mockReturnValue(true);
    mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
      const params: any = {
        operation: 'getAsset',
        assetId: 'invalid',
      };
      return params[param];
    });

    const mockError = new Error('Asset not found');
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(mockError);

    const result = await executeAtomicAssetsOperations.call(mockExecuteFunctions, [{ json: {} }]);

    expect(result).toHaveLength(1);
    expect(result[0].json).toEqual({ error: 'Asset not found' });
  });
});

describe('Collections Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getCollections', () => {
    it('should successfully get collections with filters', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            collection_name: 'test.collection',
            name: 'Test Collection',
            author: 'testauthor',
            allow_notify: true,
            authorized_accounts: ['testaccount'],
            notify_accounts: [],
            market_fee: 0.05,
            created_at_block: '123456789',
            created_at_time: '1634567890000'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCollections';
          case 'author': return 'testauthor';
          case 'limit': return 100;
          case 'page': return 1;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCollectionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/collections?author=testauthor&limit=100&page=1',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getCollection', () => {
    it('should successfully get specific collection', async () => {
      const mockResponse = {
        success: true,
        data: {
          collection_name: 'test.collection',
          name: 'Test Collection',
          author: 'testauthor',
          allow_notify: true,
          authorized_accounts: ['testaccount'],
          notify_accounts: [],
          market_fee: 0.05,
          data: {}
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCollection';
          case 'collection_name': return 'test.collection';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCollectionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/collections/test.collection',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getCollectionStats', () => {
    it('should successfully get collection statistics', async () => {
      const mockResponse = {
        success: true,
        data: {
          assets: '1000',
          burned: '50',
          templates: '25',
          schemas: '5'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCollectionStats';
          case 'collection_name': return 'test.collection';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCollectionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/collections/test.collection/stats',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getCollectionLogs', () => {
    it('should successfully get collection logs', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            log_id: '123456',
            name: 'logsetdata',
            data: {
              collection_name: 'test.collection',
              new_data: {}
            },
            txid: 'abc123def456',
            created_at_block: '123456789',
            created_at_time: '1634567890000'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCollectionLogs';
          case 'collection_name': return 'test.collection';
          case 'limit': return 100;
          case 'page': return 1;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeCollectionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/collections/test.collection/logs?limit=100&page=1',
        headers: {
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCollection';
          case 'collection_name': return 'nonexistent';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Collection not found'));

      await expect(executeCollectionsOperations.call(mockExecuteFunctions, [{ json: {} }]))
        .rejects.toThrow('Collection not found');
    });

    it('should continue on fail when enabled', async () => {
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.getNodeParameter.mockImplementation((name: string) => {
        switch (name) {
          case 'operation': return 'getCollection';
          case 'collection_name': return 'nonexistent';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Collection not found'));

      const result = await executeCollectionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'Collection not found' });
    });
  });
});

describe('Templates Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getTemplates', () => {
    it('should get templates successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            template_id: '1',
            collection_name: 'testcollection',
            schema_name: 'testschema',
            max_supply: '1000',
            issued_supply: '500'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTemplates';
          case 'collection_name': return 'testcollection';
          case 'limit': return 100;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplatesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=testcollection&limit=100',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle getTemplates error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        if (paramName === 'operation') return 'getTemplates';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeTemplatesOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow();
    });
  });

  describe('getTemplate', () => {
    it('should get specific template successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          template_id: '123',
          collection_name: 'testcollection',
          schema_name: 'testschema',
          max_supply: '1000',
          issued_supply: '500'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTemplate';
          case 'collection_name': return 'testcollection';
          case 'template_id': return '123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplatesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/templates/testcollection/123',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getTemplateStats', () => {
    it('should get template statistics successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          assets: '500',
          burned: '50',
          template_mint: '550'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTemplateStats';
          case 'collection_name': return 'testcollection';
          case 'template_id': return '123';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplatesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/templates/testcollection/123/stats',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });

  describe('getTemplateLogs', () => {
    it('should get template logs successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            log_id: '1',
            name: 'mint',
            txid: 'abc123',
            created_at_time: '1234567890'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        switch (paramName) {
          case 'operation': return 'getTemplateLogs';
          case 'collection_name': return 'testcollection';
          case 'template_id': return '123';
          case 'page': return 1;
          case 'limit': return 10;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTemplatesOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/templates/testcollection/123/logs?page=1&limit=10',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });
  });
});

describe('Schemas Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getSchemas', () => {
    it('should get schemas successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            collection: { collection_name: 'testcoll' },
            schema_name: 'testschema',
            format: [{ name: 'name', type: 'string' }]
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSchemas';
          case 'collectionName': return 'testcoll';
          case 'limit': return 100;
          case 'page': return 1;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSchemasOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/atomicassets/v1/schemas'),
        headers: { 'Authorization': 'Bearer test-api-key' },
        json: true,
      });
    });

    it('should handle errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        if (param === 'operation') return 'getSchemas';
        return undefined;
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(executeSchemasOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow();
    });
  });

  describe('getSchema', () => {
    it('should get specific schema successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          collection: { collection_name: 'testcoll' },
          schema_name: 'testschema',
          format: [{ name: 'name', type: 'string' }]
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSchema';
          case 'collectionName': return 'testcoll';
          case 'schemaName': return 'testschema';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSchemasOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/schemas/testcoll/testschema',
        headers: { 'Authorization': 'Bearer test-api-key' },
        json: true,
      });
    });
  });

  describe('getSchemaStats', () => {
    it('should get schema stats successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          assets: '1234',
          burned: '0',
          templates: '5'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSchemaStats';
          case 'collectionName': return 'testcoll';
          case 'schemaName': return 'testschema';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSchemasOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/schemas/testcoll/testschema/stats',
        headers: { 'Authorization': 'Bearer test-api-key' },
        json: true,
      });
    });
  });

  describe('getSchemaLogs', () => {
    it('should get schema logs successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            log_id: '123456789',
            name: 'createschema',
            data: { schema_name: 'testschema' },
            txid: 'abc123def456'
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSchemaLogs';
          case 'collectionName': return 'testcoll';
          case 'schemaName': return 'testschema';
          case 'page': return 1;
          case 'limit': return 100;
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeSchemasOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: expect.stringContaining('/atomicassets/v1/schemas/testcoll/testschema/logs'),
        headers: { 'Authorization': 'Bearer test-api-key' },
        json: true,
      });
    });
  });
});

describe('AtomicMarket Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getSales', () => {
    it('should get sales successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            sale_id: '123',
            seller: 'testaccount',
            price: { amount: '1000', token_symbol: 'WAX' },
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSales';
          case 'state': return '1';
          case 'limit': return 100;
          case 'page': return 1;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAtomicMarketOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/atomicmarket/v1/sales'),
        }),
      );
    });

    it('should handle errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getSales');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeAtomicMarketOperations.call(mockExecuteFunctions, [{ json: {} }]),
      ).rejects.toThrow();
    });
  });

  describe('getSale', () => {
    it('should get specific sale successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          sale_id: '123',
          seller: 'testaccount',
          price: { amount: '1000', token_symbol: 'WAX' },
        },
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getSale';
          case 'saleId': return '123';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAtomicMarketOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/atomicmarket/v1/sales/123'),
        }),
      );
    });
  });

  describe('getAuctions', () => {
    it('should get auctions successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            auction_id: '456',
            seller: 'testaccount',
            end_time: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAuctions';
          case 'state': return '1';
          case 'limit': return 100;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAtomicMarketOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
    });
  });

  describe('getBuyOffers', () => {
    it('should get buy offers successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            buyoffer_id: '789',
            buyer: 'testbuyer',
            price: { amount: '500', token_symbol: 'WAX' },
          },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getBuyOffers';
          case 'buyer': return 'testbuyer';
          case 'limit': return 50;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeAtomicMarketOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toHaveLength(1);
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
        apiKey: 'test-api-key',
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

  describe('getAccounts', () => {
    it('should get accounts list successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          { account: 'testaccount1' },
          { account: 'testaccount2' }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccounts';
          case 'match': return 'test';
          case 'limit': return 100;
          case 'page': return 1;
          case 'collection_name': return '';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts?match=test&limit=100&page=1',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });

    it('should handle getAccounts error', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccounts';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];

      await expect(executeAccountsOperations.call(mockExecuteFunctions, items)).rejects.toThrow();
    });
  });

  describe('getAccount', () => {
    it('should get account details successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          account: 'testaccount',
          assets: '150'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccount';
          case 'account': return 'testaccount';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts/testaccount',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });

  describe('getAccountCollection', () => {
    it('should get account collection successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          assets: '25',
          collection: 'testcollection'
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getAccountCollection';
          case 'account': return 'testaccount';
          case 'collection_name': return 'testcollection';
          default: return undefined;
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeAccountsOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/accounts/testaccount/testcollection',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        json: true,
      });
    });
  });
});

describe('Transfers Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getTransfers', () => {
    it('should get transfers successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            transfer_id: '123456789',
            sender_name: 'alice',
            recipient_name: 'bob',
            assets: ['1099511627776'],
          }
        ]
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        const params: any = {
          operation: 'getTransfers',
          account: 'alice',
          limit: 100,
          page: 1,
        };
        return params[paramName];
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransfersOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/transfers?account=alice&limit=100&page=1',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle errors when getting transfers', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        return paramName === 'operation' ? 'getTransfers' : '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      await expect(
        executeTransfersOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('API Error');
    });
  });

  describe('getTransfer', () => {
    it('should get specific transfer successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          transfer_id: '123456789',
          sender_name: 'alice',
          recipient_name: 'bob',
          assets: ['1099511627776'],
        }
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        const params: any = {
          operation: 'getTransfer',
          transfer_id: '123456789',
        };
        return params[paramName];
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeTransfersOperations.call(
        mockExecuteFunctions,
        [{ json: {} }]
      );

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/transfers/123456789',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        json: true,
      });
    });

    it('should handle missing transfer ID', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((paramName: string) => {
        return paramName === 'operation' ? 'getTransfer' : '';
      });

      await expect(
        executeTransfersOperations.call(mockExecuteFunctions, [{ json: {} }])
      ).rejects.toThrow('Transfer ID is required');
    });
  });
});

describe('Offers Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        apiKey: 'test-api-key',
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

  describe('getOffers operation', () => {
    it('should retrieve offers successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            offer_id: '12345',
            sender_name: 'testaccount1',
            recipient_name: 'testaccount2',
            state: 0,
            memo: 'Trade offer',
            sender_assets: [],
            recipient_assets: [],
          },
        ],
        query_time: 1234567890,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getOffers';
          case 'account': return 'testaccount1';
          case 'limit': return 100;
          case 'page': return 1;
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeOffersOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/offers?account=testaccount1&limit=100&page=1',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle getOffers errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        return param === 'operation' ? 'getOffers' : '';
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];

      await expect(
        executeOffersOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('API Error');
    });
  });

  describe('getOffer operation', () => {
    it('should retrieve specific offer successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          offer_id: '12345',
          sender_name: 'testaccount1',
          recipient_name: 'testaccount2',
          state: 0,
          memo: 'Trade offer',
          sender_assets: [],
          recipient_assets: [],
          created_at_time: '1234567890',
          updated_at_time: '1234567890',
        },
        query_time: 1234567890,
      };

      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getOffer';
          case 'offer_id': return '12345';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const items = [{ json: {} }];
      const result = await executeOffersOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://wax.api.atomicassets.io/atomicassets/v1/offers/12345',
        headers: {
          'X-API-Key': 'test-api-key',
        },
        json: true,
      });
    });

    it('should handle getOffer errors', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        switch (param) {
          case 'operation': return 'getOffer';
          case 'offer_id': return 'invalid-id';
          default: return '';
        }
      });

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Offer not found'));

      const items = [{ json: {} }];

      await expect(
        executeOffersOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('Offer not found');
    });
  });

  describe('error handling', () => {
    it('should handle unknown operation', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

      const items = [{ json: {} }];

      await expect(
        executeOffersOperations.call(mockExecuteFunctions, items)
      ).rejects.toThrow('Unknown operation: unknownOperation');
    });

    it('should continue on fail when configured', async () => {
      mockExecuteFunctions.getNodeParameter.mockImplementation((param: string) => {
        return param === 'operation' ? 'getOffers' : '';
      });
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

      const items = [{ json: {} }];
      const result = await executeOffersOperations.call(mockExecuteFunctions, items);

      expect(result).toHaveLength(1);
      expect(result[0].json).toEqual({ error: 'API Error' });
    });
  });
});
});
