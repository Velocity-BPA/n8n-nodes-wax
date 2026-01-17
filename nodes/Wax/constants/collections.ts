// Popular WAX NFT Collections
// Author: Velocity BPA - https://velobpa.com

export interface CollectionInfo {
	name: string;
	displayName: string;
	author: string;
	description: string;
	website?: string;
	marketFee: number;
}

// Popular WAX Collections
export const POPULAR_COLLECTIONS: Record<string, CollectionInfo> = {
	'alien.worlds': {
		name: 'alien.worlds',
		displayName: 'Alien Worlds',
		author: 'federation',
		description: 'Alien Worlds NFT game collection',
		website: 'https://alienworlds.io',
		marketFee: 0.06,
	},
	'farmersworld': {
		name: 'farmersworld',
		displayName: 'Farmers World',
		author: 'farmersworld',
		description: 'Farmers World farming game NFTs',
		website: 'https://farmersworld.io',
		marketFee: 0.05,
	},
	'rplanet': {
		name: 'rplanet',
		displayName: 'R-Planet',
		author: 'rplanet',
		description: 'R-Planet staking and crafting game',
		website: 'https://rplanet.io',
		marketFee: 0.05,
	},
	'crptomonkeys': {
		name: 'crptomonkeys',
		displayName: 'cryptomonKeys',
		author: 'crptomonkeys',
		description: 'Free-to-claim NFT trading cards',
		website: 'https://cryptomonkeys.cc',
		marketFee: 0.04,
	},
	'kolobok.game': {
		name: 'kolobok.game',
		displayName: 'Kolobok Adventures',
		author: 'kolobokgames',
		description: 'Kolobok Adventures game collection',
		marketFee: 0.05,
	},
	'waxapes': {
		name: 'waxapes',
		displayName: 'WAX Apes',
		author: 'waxapes',
		description: 'WAX Apes PFP collection',
		marketFee: 0.06,
	},
	'bcbrawlers': {
		name: 'bcbrawlers',
		displayName: 'Blockchain Brawlers',
		author: 'bcbrawlers',
		description: 'Blockchain Brawlers wrestling game',
		website: 'https://bcbrawlers.com',
		marketFee: 0.05,
	},
	'mlb.topps': {
		name: 'mlb.topps',
		displayName: 'Topps MLB',
		author: 'topps',
		description: 'Official MLB Topps trading cards',
		marketFee: 0.05,
	},
	'hiphopheads': {
		name: 'hiphopheads',
		displayName: 'Hip Hop Heads',
		author: 'hiphopheads',
		description: 'Hip Hop Heads music NFTs',
		marketFee: 0.05,
	},
	'upliftworld': {
		name: 'upliftworld',
		displayName: 'The Uplift World',
		author: 'upliftworld',
		description: 'The Uplift World metaverse',
		website: 'https://theuplift.world',
		marketFee: 0.05,
	},
};

// Collection Categories
export const COLLECTION_CATEGORIES = {
	gaming: ['alien.worlds', 'farmersworld', 'rplanet', 'bcbrawlers', 'kolobok.game'],
	pfp: ['waxapes', 'crptomonkeys'],
	sports: ['mlb.topps'],
	music: ['hiphopheads'],
	metaverse: ['upliftworld'],
};

// Verified Collections (examples)
export const VERIFIED_COLLECTIONS = [
	'alien.worlds',
	'farmersworld',
	'rplanet',
	'bcbrawlers',
	'mlb.topps',
	'crptomonkeys',
	'upliftworld',
];

// Get collection display name
export function getCollectionDisplayName(collectionName: string): string {
	return POPULAR_COLLECTIONS[collectionName]?.displayName || collectionName;
}

// Check if collection is verified
export function isVerifiedCollection(collectionName: string): boolean {
	return VERIFIED_COLLECTIONS.includes(collectionName);
}
