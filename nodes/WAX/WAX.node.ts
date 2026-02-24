/**
 * Copyright (c) 2026 Velocity BPA
 * 
 * Licensed under the Business Source License 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     https://github.com/VelocityBPA/n8n-nodes-wax/blob/main/LICENSE
 * 
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

export class WAX implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'WAX',
    name: 'wax',
    icon: 'file:wax.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the WAX API',
    defaults: {
      name: 'WAX',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'waxApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'AtomicAssets',
            value: 'atomicAssets',
          },
          {
            name: 'Collections',
            value: 'collections',
          },
          {
            name: 'Templates',
            value: 'templates',
          },
          {
            name: 'Schemas',
            value: 'schemas',
          },
          {
            name: 'AtomicMarket',
            value: 'atomicMarket',
          },
          {
            name: 'Accounts',
            value: 'accounts',
          },
          {
            name: 'Transfers',
            value: 'transfers',
          },
          {
            name: 'Offers',
            value: 'offers',
          }
        ],
        default: 'atomicAssets',
      },
      // Operation dropdowns per resource
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
    },
  },
  options: [
    {
      name: 'Get Assets',
      value: 'getAssets',
      description: 'Fetch assets with filtering options',
      action: 'Get assets',
    },
    {
      name: 'Get Asset',
      value: 'getAsset',
      description: 'Get specific asset details',
      action: 'Get asset',
    },
    {
      name: 'Get Asset Stats',
      value: 'getAssetStats',
      description: 'Get asset statistics',
      action: 'Get asset stats',
    },
    {
      name: 'Get Asset Logs',
      value: 'getAssetLogs',
      description: 'Get asset transaction history',
      action: 'Get asset logs',
    },
  ],
  default: 'getAssets',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['collections'],
    },
  },
  options: [
    {
      name: 'Get Collections',
      value: 'getCollections',
      description: 'List all collections',
      action: 'Get collections',
    },
    {
      name: 'Get Collection',
      value: 'getCollection',
      description: 'Get specific collection details',
      action: 'Get collection',
    },
    {
      name: 'Get Collection Stats',
      value: 'getCollectionStats',
      description: 'Get collection statistics',
      action: 'Get collection stats',
    },
    {
      name: 'Get Collection Logs',
      value: 'getCollectionLogs',
      description: 'Get collection activity logs',
      action: 'Get collection logs',
    },
  ],
  default: 'getCollections',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['templates'],
    },
  },
  options: [
    {
      name: 'Get Templates',
      value: 'getTemplates',
      description: 'List templates with filters',
      action: 'Get templates',
    },
    {
      name: 'Get Template',
      value: 'getTemplate',
      description: 'Get specific template',
      action: 'Get template',
    },
    {
      name: 'Get Template Statistics',
      value: 'getTemplateStats',
      description: 'Get template statistics',
      action: 'Get template statistics',
    },
    {
      name: 'Get Template Logs',
      value: 'getTemplateLogs',
      description: 'Get template activity logs',
      action: 'Get template logs',
    },
  ],
  default: 'getTemplates',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['schemas'],
    },
  },
  options: [
    {
      name: 'Get Schemas',
      value: 'getSchemas',
      description: 'List schemas with optional filters',
      action: 'Get schemas',
    },
    {
      name: 'Get Schema',
      value: 'getSchema',
      description: 'Get a specific schema by collection and schema name',
      action: 'Get schema',
    },
    {
      name: 'Get Schema Stats',
      value: 'getSchemaStats',
      description: 'Get statistics for a specific schema',
      action: 'Get schema stats',
    },
    {
      name: 'Get Schema Logs',
      value: 'getSchemaLogs',
      description: 'Get activity logs for a specific schema',
      action: 'Get schema logs',
    },
  ],
  default: 'getSchemas',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
    },
  },
  options: [
    {
      name: 'Get Sales',
      value: 'getSales',
      description: 'List marketplace sales',
      action: 'Get sales',
    },
    {
      name: 'Get Sale',
      value: 'getSale',
      description: 'Get specific sale details',
      action: 'Get sale',
    },
    {
      name: 'Get Auctions',
      value: 'getAuctions',
      description: 'List auctions',
      action: 'Get auctions',
    },
    {
      name: 'Get Auction',
      value: 'getAuction',
      description: 'Get specific auction',
      action: 'Get auction',
    },
    {
      name: 'Get Buy Offers',
      value: 'getBuyOffers',
      description: 'List buy offers',
      action: 'Get buy offers',
    },
    {
      name: 'Get Buy Offer',
      value: 'getBuyOffer',
      description: 'Get specific buy offer',
      action: 'Get buy offer',
    },
  ],
  default: 'getSales',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
    },
  },
  options: [
    {
      name: 'Get Accounts',
      value: 'getAccounts',
      description: 'List accounts',
      action: 'Get accounts',
    },
    {
      name: 'Get Account',
      value: 'getAccount',
      description: 'Get account details',
      action: 'Get account details',
    },
    {
      name: 'Get Account Collection',
      value: 'getAccountCollection',
      description: 'Get account\'s assets in collection',
      action: 'Get account collection',
    },
  ],
  default: 'getAccounts',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['transfers'],
    },
  },
  options: [
    {
      name: 'Get Transfers',
      value: 'getTransfers',
      description: 'List asset transfers',
      action: 'Get transfers',
    },
    {
      name: 'Get Transfer',
      value: 'getTransfer',
      description: 'Get specific transfer by ID',
      action: 'Get transfer',
    },
  ],
  default: 'getTransfers',
},
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: {
    show: {
      resource: ['offers'],
    },
  },
  options: [
    {
      name: 'Get Offers',
      value: 'getOffers',
      description: 'List trading offers',
      action: 'Get offers',
    },
    {
      name: 'Get Offer',
      value: 'getOffer',
      description: 'Get specific offer details',
      action: 'Get offer',
    },
  ],
  default: 'getOffers',
},
      // Parameter definitions
{
  displayName: 'Owner',
  name: 'owner',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter assets by owner account name',
},
{
  displayName: 'Collection Name',
  name: 'collectionName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter assets by collection name',
},
{
  displayName: 'Schema Name',
  name: 'schemaName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter assets by schema name',
},
{
  displayName: 'Template ID',
  name: 'templateId',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAssets'],
    },
  },
  default: '',
  description: 'Filter assets by template ID',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAssets', 'getAssetLogs'],
    },
  },
  default: 100,
  description: 'Number of results to return (max 1000)',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAssets', 'getAssetLogs'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Asset ID',
  name: 'assetId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['atomicAssets'],
      operation: ['getAsset', 'getAssetStats', 'getAssetLogs'],
    },
  },
  default: '',
  description: 'The unique identifier of the asset',
},
{
  displayName: 'Author',
  name: 'author',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['collections'],
      operation: ['getCollections'],
    },
  },
  default: '',
  description: 'Filter by collection author account',
},
{
  displayName: 'Match',
  name: 'match',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['collections'],
      operation: ['getCollections'],
    },
  },
  default: '',
  description: 'Search for collections matching this string',
},
{
  displayName: 'Authorized Account',
  name: 'authorized_account',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['collections'],
      operation: ['getCollections'],
    },
  },
  default: '',
  description: 'Filter by authorized account',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['collections'],
      operation: ['getCollections', 'getCollectionLogs'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['collections'],
      operation: ['getCollections', 'getCollectionLogs'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['collections'],
      operation: ['getCollection', 'getCollectionStats', 'getCollectionLogs'],
    },
  },
  default: '',
  description: 'The name of the collection',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplates'],
    },
  },
  default: '',
  description: 'Filter by collection name',
},
{
  displayName: 'Schema Name',
  name: 'schema_name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplates'],
    },
  },
  default: '',
  description: 'Filter by schema name',
},
{
  displayName: 'Issued Supply',
  name: 'issued_supply',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplates'],
    },
  },
  default: undefined,
  description: 'Filter by issued supply amount',
},
{
  displayName: 'Max Supply',
  name: 'max_supply',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplates'],
    },
  },
  default: undefined,
  description: 'Filter by maximum supply amount',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplates', 'getTemplateLogs'],
    },
  },
  default: 100,
  description: 'Number of results to return',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplates', 'getTemplateLogs'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplate'],
    },
  },
  default: '',
  description: 'The name of the collection',
},
{
  displayName: 'Template ID',
  name: 'template_id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplate'],
    },
  },
  default: '',
  description: 'The ID of the template',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplateStats'],
    },
  },
  default: '',
  description: 'The name of the collection',
},
{
  displayName: 'Template ID',
  name: 'template_id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplateStats'],
    },
  },
  default: '',
  description: 'The ID of the template',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplateLogs'],
    },
  },
  default: '',
  description: 'The name of the collection',
},
{
  displayName: 'Template ID',
  name: 'template_id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['templates'],
      operation: ['getTemplateLogs'],
    },
  },
  default: '',
  description: 'The ID of the template',
},
{
  displayName: 'Collection Name',
  name: 'collectionName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['schemas'],
      operation: ['getSchemas'],
    },
  },
  default: '',
  description: 'Filter schemas by collection name',
},
{
  displayName: 'Authorized Account',
  name: 'authorizedAccount',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['schemas'],
      operation: ['getSchemas'],
    },
  },
  default: '',
  description: 'Filter by authorized account name',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['schemas'],
      operation: ['getSchemas', 'getSchemaLogs'],
    },
  },
  default: 100,
  description: 'Maximum number of results to return',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['schemas'],
      operation: ['getSchemas', 'getSchemaLogs'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Collection Name',
  name: 'collectionName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['schemas'],
      operation: ['getSchema', 'getSchemaStats', 'getSchemaLogs'],
    },
  },
  default: '',
  description: 'The collection name that contains the schema',
},
{
  displayName: 'Schema Name',
  name: 'schemaName',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['schemas'],
      operation: ['getSchema', 'getSchemaStats', 'getSchemaLogs'],
    },
  },
  default: '',
  description: 'The schema name to retrieve',
},
{
  displayName: 'Sale ID',
  name: 'saleId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSale'],
    },
  },
  default: '',
  description: 'The ID of the sale to retrieve',
},
{
  displayName: 'Auction ID',
  name: 'auctionId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getAuction'],
    },
  },
  default: '',
  description: 'The ID of the auction to retrieve',
},
{
  displayName: 'Buy Offer ID',
  name: 'buyOfferId',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getBuyOffer'],
    },
  },
  default: '',
  description: 'The ID of the buy offer to retrieve',
},
{
  displayName: 'State',
  name: 'state',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales', 'getAuctions', 'getBuyOffers'],
    },
  },
  options: [
    {
      name: 'All States',
      value: '',
    },
    {
      name: 'Waiting',
      value: '0',
    },
    {
      name: 'Listed',
      value: '1',
    },
    {
      name: 'Canceled',
      value: '2',
    },
    {
      name: 'Sold',
      value: '3',
    },
    {
      name: 'Invalid',
      value: '4',
    },
  ],
  default: '',
  description: 'Filter by sale/auction/offer state',
},
{
  displayName: 'Seller',
  name: 'seller',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales', 'getAuctions', 'getBuyOffers'],
    },
  },
  default: '',
  description: 'Filter by seller account name',
},
{
  displayName: 'Buyer',
  name: 'buyer',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales', 'getBuyOffers'],
    },
  },
  default: '',
  description: 'Filter by buyer account name',
},
{
  displayName: 'Bidder',
  name: 'bidder',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getAuctions'],
    },
  },
  default: '',
  description: 'Filter by bidder account name',
},
{
  displayName: 'Collection Name',
  name: 'collectionName',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales', 'getAuctions', 'getBuyOffers'],
    },
  },
  default: '',
  description: 'Filter by collection name',
},
{
  displayName: 'Minimum Price',
  name: 'minPrice',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales'],
    },
  },
  default: '',
  description: 'Minimum price filter',
},
{
  displayName: 'Maximum Price',
  name: 'maxPrice',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales'],
    },
  },
  default: '',
  description: 'Maximum price filter',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales', 'getAuctions', 'getBuyOffers'],
    },
  },
  default: 100,
  description: 'Limit the number of results',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['atomicMarket'],
      operation: ['getSales', 'getAuctions', 'getBuyOffers'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Match Pattern',
  name: 'match',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: '',
  description: 'Account name match pattern',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: '',
  description: 'Filter by collection name',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: 100,
  description: 'Limit the number of results',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccounts'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Account',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccount'],
    },
  },
  default: '',
  description: 'The account name',
},
{
  displayName: 'Account',
  name: 'account',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountCollection'],
    },
  },
  default: '',
  description: 'The account name',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['accounts'],
      operation: ['getAccountCollection'],
    },
  },
  default: '',
  description: 'The collection name',
},
{
  displayName: 'Account',
  name: 'account',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: '',
  description: 'Filter by account involved in transfer',
},
{
  displayName: 'Sender',
  name: 'sender',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: '',
  description: 'Filter by sender account',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: '',
  description: 'Filter by recipient account',
},
{
  displayName: 'Asset ID',
  name: 'asset_id',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: '',
  description: 'Filter by asset ID',
},
{
  displayName: 'Collection Name',
  name: 'collection_name',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: '',
  description: 'Filter by collection name',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: 100,
  description: 'Limit the number of results',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfers'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Transfer ID',
  name: 'transfer_id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['transfers'],
      operation: ['getTransfer'],
    },
  },
  default: '',
  description: 'The transfer ID to retrieve',
},
{
  displayName: 'Account',
  name: 'account',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  default: '',
  description: 'Filter by account involved in offer',
},
{
  displayName: 'Sender',
  name: 'sender',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  default: '',
  description: 'Filter by offer sender account',
},
{
  displayName: 'Recipient',
  name: 'recipient',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  default: '',
  description: 'Filter by offer recipient account',
},
{
  displayName: 'State',
  name: 'state',
  type: 'options',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  options: [
    {
      name: 'Pending',
      value: '0',
    },
    {
      name: 'Invalid',
      value: '1',
    },
    {
      name: 'Unknown',
      value: '2',
    },
    {
      name: 'Accepted',
      value: '3',
    },
    {
      name: 'Declined',
      value: '4',
    },
    {
      name: 'Cancelled',
      value: '5',
    },
  ],
  default: '',
  description: 'Filter by offer state',
},
{
  displayName: 'Asset ID',
  name: 'asset_id',
  type: 'string',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  default: '',
  description: 'Filter by asset ID involved in offer',
},
{
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  default: 100,
  description: 'Maximum number of offers to return',
},
{
  displayName: 'Page',
  name: 'page',
  type: 'number',
  required: false,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffers'],
    },
  },
  default: 1,
  description: 'Page number for pagination',
},
{
  displayName: 'Offer ID',
  name: 'offer_id',
  type: 'string',
  required: true,
  displayOptions: {
    show: {
      resource: ['offers'],
      operation: ['getOffer'],
    },
  },
  default: '',
  description: 'The ID of the offer to retrieve',
},
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    switch (resource) {
      case 'atomicAssets':
        return [await executeAtomicAssetsOperations.call(this, items)];
      case 'collections':
        return [await executeCollectionsOperations.call(this, items)];
      case 'templates':
        return [await executeTemplatesOperations.call(this, items)];
      case 'schemas':
        return [await executeSchemasOperations.call(this, items)];
      case 'atomicMarket':
        return [await executeAtomicMarketOperations.call(this, items)];
      case 'accounts':
        return [await executeAccountsOperations.call(this, items)];
      case 'transfers':
        return [await executeTransfersOperations.call(this, items)];
      case 'offers':
        return [await executeOffersOperations.call(this, items)];
      default:
        throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported`);
    }
  }
}

// ============================================================
// Resource Handler Functions
// ============================================================

async function executeAtomicAssetsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAssets': {
          const owner = this.getNodeParameter('owner', i) as string;
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const schemaName = this.getNodeParameter('schemaName', i) as string;
          const templateId = this.getNodeParameter('templateId', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          const params: any = {};
          if (owner) params.owner = owner;
          if (collectionName) params.collection_name = collectionName;
          if (schemaName) params.schema_name = schemaName;
          if (templateId) params.template_id = templateId;
          if (limit) params.limit = limit;
          if (page) params.page = page;

          const queryString = new URLSearchParams(params).toString();
          const url = `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/assets${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAsset': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/assets/${assetId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetStats': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/assets/${assetId}/stats`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAssetLogs': {
          const assetId = this.getNodeParameter('assetId', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const params: any = {};
          if (page) params.page = page;
          if (limit) params.limit = limit;

          const queryString = new URLSearchParams(params).toString();
          const url = `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/assets/${assetId}/logs${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        } else {
          throw new NodeOperationError(this.getNode(), error.message);
        }
      }
    }
  }

  return returnData;
}

async function executeCollectionsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getCollections': {
          const author = this.getNodeParameter('author', i) as string;
          const match = this.getNodeParameter('match', i) as string;
          const authorizedAccount = this.getNodeParameter('authorized_account', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          const queryParams: any = {};
          if (author) queryParams.author = author;
          if (match) queryParams.match = match;
          if (authorizedAccount) queryParams.authorized_account = authorizedAccount;
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/collections${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCollection': {
          const collectionName = this.getNodeParameter('collection_name', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/collections/${collectionName}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCollectionStats': {
          const collectionName = this.getNodeParameter('collection_name', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/collections/${collectionName}/stats`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getCollectionLogs': {
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          const queryParams: any = {};
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/collections/${collectionName}/logs${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeTemplatesOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTemplates': {
          const queryParams: any = {};
          
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          if (collectionName) queryParams.collection_name = collectionName;
          
          const schemaName = this.getNodeParameter('schema_name', i) as string;
          if (schemaName) queryParams.schema_name = schemaName;
          
          const issuedSupply = this.getNodeParameter('issued_supply', i) as number;
          if (issuedSupply !== undefined) queryParams.issued_supply = issuedSupply;
          
          const maxSupply = this.getNodeParameter('max_supply', i) as number;
          if (maxSupply !== undefined) queryParams.max_supply = maxSupply;
          
          const limit = this.getNodeParameter('limit', i) as number;
          if (limit) queryParams.limit = limit;
          
          const page = this.getNodeParameter('page', i) as number;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/templates${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTemplate': {
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          const templateId = this.getNodeParameter('template_id', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/templates/${collectionName}/${templateId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTemplateStats': {
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          const templateId = this.getNodeParameter('template_id', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/templates/${collectionName}/${templateId}/stats`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTemplateLogs': {
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          const templateId = this.getNodeParameter('template_id', i) as string;
          
          const queryParams: any = {};
          const page = this.getNodeParameter('page', i) as number;
          if (page) queryParams.page = page;
          
          const limit = this.getNodeParameter('limit', i) as number;
          if (limit) queryParams.limit = limit;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/templates/${collectionName}/${templateId}/logs${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeSchemasOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getSchemas': {
          const queryParams: any = {};
          
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const authorizedAccount = this.getNodeParameter('authorizedAccount', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          if (collectionName) queryParams.collection_name = collectionName;
          if (authorizedAccount) queryParams.authorized_account = authorizedAccount;
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/schemas${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': credentials.apiKey ? `Bearer ${credentials.apiKey}` : undefined,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSchema': {
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const schemaName = this.getNodeParameter('schemaName', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/schemas/${collectionName}/${schemaName}`,
            headers: {
              'Authorization': credentials.apiKey ? `Bearer ${credentials.apiKey}` : undefined,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSchemaStats': {
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const schemaName = this.getNodeParameter('schemaName', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/schemas/${collectionName}/${schemaName}/stats`,
            headers: {
              'Authorization': credentials.apiKey ? `Bearer ${credentials.apiKey}` : undefined,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSchemaLogs': {
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const schemaName = this.getNodeParameter('schemaName', i) as string;
          const page = this.getNodeParameter('page', i) as number;
          const limit = this.getNodeParameter('limit', i) as number;

          const queryParams: any = {};
          if (page) queryParams.page = page;
          if (limit) queryParams.limit = limit;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/schemas/${collectionName}/${schemaName}/logs${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': credentials.apiKey ? `Bearer ${credentials.apiKey}` : undefined,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeAtomicMarketOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getSales': {
          const queryParams: any = {};
          
          const state = this.getNodeParameter('state', i) as string;
          const seller = this.getNodeParameter('seller', i) as string;
          const buyer = this.getNodeParameter('buyer', i) as string;
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const minPrice = this.getNodeParameter('minPrice', i) as string;
          const maxPrice = this.getNodeParameter('maxPrice', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          if (state) queryParams.state = state;
          if (seller) queryParams.seller = seller;
          if (buyer) queryParams.buyer = buyer;
          if (collectionName) queryParams.collection_name = collectionName;
          if (minPrice) queryParams.min_price = minPrice;
          if (maxPrice) queryParams.max_price = maxPrice;
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicmarket/v1/sales${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getSale': {
          const saleId = this.getNodeParameter('saleId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicmarket/v1/sales/${saleId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAuctions': {
          const queryParams: any = {};
          
          const state = this.getNodeParameter('state', i) as string;
          const seller = this.getNodeParameter('seller', i) as string;
          const bidder = this.getNodeParameter('bidder', i) as string;
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          if (state) queryParams.state = state;
          if (seller) queryParams.seller = seller;
          if (bidder) queryParams.bidder = bidder;
          if (collectionName) queryParams.collection_name = collectionName;
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicmarket/v1/auctions${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAuction': {
          const auctionId = this.getNodeParameter('auctionId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicmarket/v1/auctions/${auctionId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBuyOffers': {
          const queryParams: any = {};
          
          const state = this.getNodeParameter('state', i) as string;
          const seller = this.getNodeParameter('seller', i) as string;
          const buyer = this.getNodeParameter('buyer', i) as string;
          const collectionName = this.getNodeParameter('collectionName', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          if (state) queryParams.state = state;
          if (seller) queryParams.seller = seller;
          if (buyer) queryParams.buyer = buyer;
          if (collectionName) queryParams.collection_name = collectionName;
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl}/atomicmarket/v1/buyoffers${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getBuyOffer': {
          const buyOfferId = this.getNodeParameter('buyOfferId', i) as string;
          
          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicmarket/v1/buyoffers/${buyOfferId}`,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ json: result, pairedItem: { item: i } });
    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeAccountsOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getAccounts': {
          const match = this.getNodeParameter('match', i) as string;
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          const queryParams: any = {};
          if (match) queryParams.match = match;
          if (collectionName) queryParams.collection_name = collectionName;
          if (limit) queryParams.limit = limit;
          if (page) queryParams.page = page;

          const queryString = new URLSearchParams(queryParams).toString();
          const url = `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/accounts${queryString ? `?${queryString}` : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers.Authorization = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccount': {
          const account = this.getNodeParameter('account', i) as string;

          const url = `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/accounts/${account}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers.Authorization = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getAccountCollection': {
          const account = this.getNodeParameter('account', i) as string;
          const collectionName = this.getNodeParameter('collection_name', i) as string;

          const url = `${credentials.baseUrl || 'https://wax.api.atomicassets.io'}/atomicassets/v1/accounts/${account}/${collectionName}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Content-Type': 'application/json',
            },
            json: true,
          };

          if (credentials.apiKey) {
            options.headers.Authorization = `Bearer ${credentials.apiKey}`;
          }

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({ 
        json: result, 
        pairedItem: { item: i } 
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({ 
          json: { error: error.message }, 
          pairedItem: { item: i } 
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}

async function executeTransfersOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;

      switch (operation) {
        case 'getTransfers': {
          const account = this.getNodeParameter('account', i) as string;
          const sender = this.getNodeParameter('sender', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          const assetId = this.getNodeParameter('asset_id', i) as string;
          const collectionName = this.getNodeParameter('collection_name', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          const params: any = {};
          if (account) params.account = account;
          if (sender) params.sender = sender;
          if (recipient) params.recipient = recipient;
          if (assetId) params.asset_id = assetId;
          if (collectionName) params.collection_name = collectionName;
          if (limit) params.limit = limit;
          if (page) params.page = page;

          const queryString = new URLSearchParams(params).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/transfers${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getTransfer': {
          const transferId = this.getNodeParameter('transfer_id', i) as string;

          if (!transferId) {
            throw new NodeOperationError(this.getNode(), 'Transfer ID is required');
          }

          const url = `${credentials.baseUrl}/atomicassets/v1/transfers/${transferId}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'Authorization': `Bearer ${credentials.apiKey}`,
              'Content-Type': 'application/json',
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        if (error.httpCode) {
          throw new NodeApiError(this.getNode(), error);
        }
        throw new NodeOperationError(this.getNode(), error.message);
      }
    }
  }

  return returnData;
}

async function executeOffersOperations(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];
  const operation = this.getNodeParameter('operation', 0) as string;
  const credentials = await this.getCredentials('waxApi') as any;

  for (let i = 0; i < items.length; i++) {
    try {
      let result: any;
      
      switch (operation) {
        case 'getOffers': {
          const account = this.getNodeParameter('account', i) as string;
          const sender = this.getNodeParameter('sender', i) as string;
          const recipient = this.getNodeParameter('recipient', i) as string;
          const state = this.getNodeParameter('state', i) as string;
          const assetId = this.getNodeParameter('asset_id', i) as string;
          const limit = this.getNodeParameter('limit', i) as number;
          const page = this.getNodeParameter('page', i) as number;

          const params: any = {};
          if (account) params.account = account;
          if (sender) params.sender = sender;
          if (recipient) params.recipient = recipient;
          if (state) params.state = state;
          if (assetId) params.asset_id = assetId;
          if (limit) params.limit = limit;
          if (page) params.page = page;

          const queryString = new URLSearchParams(params).toString();
          const url = `${credentials.baseUrl}/atomicassets/v1/offers${queryString ? '?' + queryString : ''}`;

          const options: any = {
            method: 'GET',
            url,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        case 'getOffer': {
          const offerId = this.getNodeParameter('offer_id', i) as string;

          const options: any = {
            method: 'GET',
            url: `${credentials.baseUrl}/atomicassets/v1/offers/${offerId}`,
            headers: {
              'X-API-Key': credentials.apiKey,
            },
            json: true,
          };

          result = await this.helpers.httpRequest(options) as any;
          break;
        }

        default:
          throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
      }

      returnData.push({
        json: result,
        pairedItem: { item: i },
      });

    } catch (error: any) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
      } else {
        throw new NodeApiError(this.getNode(), error);
      }
    }
  }

  return returnData;
}
