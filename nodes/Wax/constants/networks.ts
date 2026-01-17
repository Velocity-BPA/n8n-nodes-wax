// WAX Network Configurations
// Author: Velocity BPA - https://velobpa.com

export interface NetworkConfig {
	chainId: string;
	chainApi: string;
	hyperion: string;
	atomicAssets: string;
	atomicMarket: string;
	lightApi: string;
	name: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
	mainnet: {
		chainId: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
		chainApi: 'https://wax.greymass.com',
		hyperion: 'https://wax.eosusa.io',
		atomicAssets: 'https://wax.api.atomicassets.io',
		atomicMarket: 'https://wax.api.atomicassets.io',
		lightApi: 'https://lightapi.eosamsterdam.net',
		name: 'WAX Mainnet',
	},
	testnet: {
		chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
		chainApi: 'https://testnet.waxsweden.org',
		hyperion: 'https://testnet.wax.pink.gg',
		atomicAssets: 'https://test.wax.api.atomicassets.io',
		atomicMarket: 'https://test.wax.api.atomicassets.io',
		lightApi: 'https://testnet-lightapi.eosams.io',
		name: 'WAX Testnet',
	},
};

// Alternative RPC endpoints for fallback
export const MAINNET_ENDPOINTS = [
	'https://wax.greymass.com',
	'https://wax.eosphere.io',
	'https://api.wax.alohaeos.com',
	'https://wax.pink.gg',
	'https://api.waxsweden.org',
	'https://wax.cryptolions.io',
	'https://api.wax.bountyblok.io',
];

export const TESTNET_ENDPOINTS = [
	'https://testnet.waxsweden.org',
	'https://testnet.wax.pink.gg',
	'https://wax-testnet.eosphere.io',
];

// Hyperion endpoints
export const MAINNET_HYPERION = [
	'https://wax.eosusa.io',
	'https://api.waxsweden.org',
	'https://wax.cryptolions.io',
	'https://wax.eosphere.io',
];

export const TESTNET_HYPERION = [
	'https://testnet.wax.pink.gg',
	'https://testnet.waxsweden.org',
];

export function getNetworkConfig(network: string, customConfig?: Partial<NetworkConfig>): NetworkConfig {
	if (network === 'custom' && customConfig) {
		return {
			chainId: customConfig.chainId || NETWORKS.mainnet.chainId,
			chainApi: customConfig.chainApi || NETWORKS.mainnet.chainApi,
			hyperion: customConfig.hyperion || NETWORKS.mainnet.hyperion,
			atomicAssets: customConfig.atomicAssets || NETWORKS.mainnet.atomicAssets,
			atomicMarket: customConfig.atomicMarket || NETWORKS.mainnet.atomicMarket,
			lightApi: customConfig.lightApi || NETWORKS.mainnet.lightApi,
			name: 'Custom Network',
		};
	}
	return NETWORKS[network] || NETWORKS.mainnet;
}
