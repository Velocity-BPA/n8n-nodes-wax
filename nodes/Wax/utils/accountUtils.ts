// WAX Account Utilities
// Author: Velocity BPA - https://velobpa.com

/**
 * Validate WAX account name format
 * WAX accounts are 12 characters, using a-z, 1-5, and optional dots
 */
export function isValidAccountName(name: string): boolean {
	if (!name || typeof name !== 'string') return false;
	
	// Account names are exactly 12 characters (or less with premium names)
	if (name.length > 12 || name.length === 0) return false;
	
	// Only lowercase letters, digits 1-5, and dots allowed
	const validPattern = /^[a-z1-5.]{1,12}$/;
	if (!validPattern.test(name)) return false;
	
	// Cannot start or end with a dot
	if (name.startsWith('.') || name.endsWith('.')) return false;
	
	// Cannot have consecutive dots
	if (name.includes('..')) return false;
	
	return true;
}

/**
 * Validate WAX Cloud Wallet account (ends with .wam)
 */
export function isWaxCloudWallet(name: string): boolean {
	return isValidAccountName(name) && name.endsWith('.wam');
}

/**
 * Format account name for display
 */
export function formatAccountName(name: string): string {
	return name.toLowerCase().trim();
}

/**
 * Generate a random account name suffix
 */
export function generateRandomSuffix(length: number = 5): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz12345';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Parse permission level string (e.g., "account@active")
 */
export interface PermissionLevel {
	actor: string;
	permission: string;
}

export function parsePermissionLevel(permissionStr: string): PermissionLevel {
	const parts = permissionStr.split('@');
	return {
		actor: parts[0],
		permission: parts[1] || 'active',
	};
}

/**
 * Format permission level for transactions
 */
export function formatPermissionLevel(actor: string, permission: string = 'active'): PermissionLevel {
	return { actor, permission };
}

/**
 * Check if an account has sufficient resources
 */
export interface ResourceUsage {
	cpu: {
		used: number;
		available: number;
		max: number;
		percentUsed: number;
	};
	net: {
		used: number;
		available: number;
		max: number;
		percentUsed: number;
	};
	ram: {
		used: number;
		available: number;
		max: number;
		percentUsed: number;
	};
}

export function parseResourceUsage(accountData: any): ResourceUsage {
	const cpu = accountData.cpu_limit || {};
	const net = accountData.net_limit || {};
	const ram = {
		used: accountData.ram_usage || 0,
		max: accountData.ram_quota || 0,
	};
	
	return {
		cpu: {
			used: cpu.used || 0,
			available: cpu.available || 0,
			max: cpu.max || 0,
			percentUsed: cpu.max ? (cpu.used / cpu.max) * 100 : 0,
		},
		net: {
			used: net.used || 0,
			available: net.available || 0,
			max: net.max || 0,
			percentUsed: net.max ? (net.used / net.max) * 100 : 0,
		},
		ram: {
			used: ram.used,
			available: ram.max - ram.used,
			max: ram.max,
			percentUsed: ram.max ? (ram.used / ram.max) * 100 : 0,
		},
	};
}

/**
 * Check if account has enough resources for a transaction
 */
export function hasEnoughResources(
	resources: ResourceUsage,
	estimatedCpu: number = 1000,
	estimatedNet: number = 100
): boolean {
	return resources.cpu.available >= estimatedCpu && resources.net.available >= estimatedNet;
}

/**
 * Parse staked resources from account data
 */
export interface StakedResources {
	cpuWeight: string;
	netWeight: string;
	totalStaked: number;
}

export function parseStakedResources(accountData: any): StakedResources {
	const cpuWeight = accountData.cpu_weight || '0.00000000 WAX';
	const netWeight = accountData.net_weight || '0.00000000 WAX';
	
	const cpuValue = parseFloat(cpuWeight.split(' ')[0]) || 0;
	const netValue = parseFloat(netWeight.split(' ')[0]) || 0;
	
	return {
		cpuWeight,
		netWeight,
		totalStaked: cpuValue + netValue,
	};
}

/**
 * Format resource bytes to human readable
 */
export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format microseconds to human readable
 */
export function formatMicroseconds(us: number): string {
	if (us < 1000) return `${us} µs`;
	if (us < 1000000) return `${(us / 1000).toFixed(2)} ms`;
	return `${(us / 1000000).toFixed(2)} s`;
}
