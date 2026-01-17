// WAX Smart Contracts Constants
// Author: Velocity BPA - https://velobpa.com

// System Contracts
export const SYSTEM_CONTRACTS = {
	eosio: 'eosio',
	eosioToken: 'eosio.token',
	eosioMsig: 'eosio.msig',
	eosioWrap: 'eosio.wrap',
	eosioRex: 'eosio.rex',
};

// AtomicAssets Ecosystem
export const ATOMIC_CONTRACTS = {
	atomicassets: 'atomicassets',
	atomicmarket: 'atomicmarket',
	atomicdropsx: 'atomicdropsx',
	atomicpacksx: 'atomicpacksx',
	blenderizerx: 'blenderizerx',
	neftyblocksd: 'neftyblocksd',
	neftyblendxx: 'neftyblendxx',
	waxdaobacker: 'waxdaobacker',
};

// Popular Token Contracts
export const TOKEN_CONTRACTS = {
	wax: 'eosio.token', // WAXP native token
	tlm: 'alien.worlds', // Trilium
	wuf: 'wuffi', // WUF token
	nefty: 'token.nefty', // NEFTY
	aether: 'e.rplanet', // Aether
	waxg: 'waxgovernance', // WAX Governance
};

// Staking Contracts
export const STAKING_CONTRACTS = {
	alienWorlds: 'federation',
	rplanet: 'e.rplanet',
	farmersworld: 'farmersworld',
};

// Gaming Contracts
export const GAME_CONTRACTS = {
	alienWorlds: {
		federation: 'federation',
		mining: 'm.federation',
		dao: 'dao.worlds',
	},
	farmersworld: {
		main: 'farmersworld',
		tools: 'farmerstools',
	},
	rplanet: {
		main: 'e.rplanet',
		staking: 's.rplanet',
	},
};

// Contract Actions
export const CONTRACT_ACTIONS = {
	eosioToken: {
		transfer: 'transfer',
		issue: 'issue',
		retire: 'retire',
		open: 'open',
		close: 'close',
		create: 'create',
	},
	eosio: {
		buyram: 'buyram',
		buyrambytes: 'buyrambytes',
		sellram: 'sellram',
		delegatebw: 'delegatebw',
		undelegatebw: 'undelegatebw',
		refund: 'refund',
		newaccount: 'newaccount',
		updateauth: 'updateauth',
		deleteauth: 'deleteauth',
		linkauth: 'linkauth',
		unlinkauth: 'unlinkauth',
		powerup: 'powerup',
	},
	atomicassets: {
		transfer: 'transfer',
		createcol: 'createcol',
		createschema: 'createschema',
		createtempl: 'createtempl',
		mintasset: 'mintasset',
		burnasset: 'burnasset',
		backasset: 'backasset',
		setcoldata: 'setcoldata',
		addcolauth: 'addcolauth',
		remcolauth: 'remcolauth',
		setmarketfee: 'setmarketfee',
		extendschema: 'extendschema',
		locktemplate: 'locktemplate',
	},
	atomicmarket: {
		announcesale: 'announcesale',
		cancelsale: 'cancelsale',
		purchasesale: 'purchasesale',
		announceauct: 'announceauct',
		cancelauct: 'cancelauct',
		auctionbid: 'auctionbid',
		auctclaimbuy: 'auctclaimbuy',
		auctclaimsel: 'auctclaimsel',
		createbuyo: 'createbuyo',
		cancelbuyo: 'cancelbuyo',
		acceptbuyo: 'acceptbuyo',
		declinebuyo: 'declinebuyo',
	},
};

// Table Names
export const TABLE_NAMES = {
	eosioToken: {
		accounts: 'accounts',
		stat: 'stat',
	},
	eosio: {
		userres: 'userres',
		delband: 'delband',
		refunds: 'refunds',
		voters: 'voters',
		rammarket: 'rammarket',
		global: 'global',
	},
	atomicassets: {
		assets: 'assets',
		collections: 'collections',
		schemas: 'schemas',
		templates: 'templates',
		offers: 'offers',
		balances: 'balances',
		config: 'config',
	},
	atomicmarket: {
		sales: 'sales',
		auctions: 'auctions',
		buyoffers: 'buyoffers',
		marketplaces: 'marketplaces',
		config: 'config',
		balances: 'balances',
	},
};
