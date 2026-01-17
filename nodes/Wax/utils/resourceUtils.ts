// WAX Resource Utilities (CPU, NET, RAM)
// Author: Velocity BPA - https://velobpa.com

/**
 * Resource state types
 */
export interface ResourceState {
	used: number;
	available: number;
	max: number;
}

export interface AccountResources {
	cpu: ResourceState;
	net: ResourceState;
	ram: ResourceState;
	cpuWeight: number;
	netWeight: number;
}

/**
 * Parse account resources from chain data
 */
export function parseAccountResources(accountData: any): AccountResources {
	const cpu = accountData.cpu_limit || { used: 0, available: 0, max: 0 };
	const net = accountData.net_limit || { used: 0, available: 0, max: 0 };
	
	return {
		cpu: {
			used: cpu.used || 0,
			available: cpu.available || 0,
			max: cpu.max || 0,
		},
		net: {
			used: net.used || 0,
			available: net.available || 0,
			max: net.max || 0,
		},
		ram: {
			used: accountData.ram_usage || 0,
			available: (accountData.ram_quota || 0) - (accountData.ram_usage || 0),
			max: accountData.ram_quota || 0,
		},
		cpuWeight: parseFloat(accountData.cpu_weight) || 0,
		netWeight: parseFloat(accountData.net_weight) || 0,
	};
}

/**
 * Calculate resource usage percentage
 */
export function calculateUsagePercentage(resource: ResourceState): number {
	if (resource.max === 0) return 0;
	return (resource.used / resource.max) * 100;
}

/**
 * Check if resources are critically low
 */
export function isResourceCritical(resource: ResourceState, threshold: number = 10): boolean {
	const availablePercent = (resource.available / resource.max) * 100;
	return availablePercent < threshold;
}

/**
 * RAM price calculation from rammarket table
 */
export interface RamMarket {
	supply: string;
	baseBalance: string;
	baseWeight: string;
	quoteBalance: string;
	quoteWeight: string;
}

export function parseRamMarket(rammarketRow: any): RamMarket {
	const base = rammarketRow.base || {};
	const quote = rammarketRow.quote || {};
	
	return {
		supply: rammarketRow.supply || '0',
		baseBalance: base.balance || '0 RAM',
		baseWeight: base.weight || '0.5',
		quoteBalance: quote.balance || '0.00000000 WAX',
		quoteWeight: quote.weight || '0.5',
	};
}

/**
 * Calculate RAM price per KB
 */
export function calculateRamPricePerKb(ramMarket: RamMarket): number {
	const quoteBalance = parseFloat(ramMarket.quoteBalance.split(' ')[0]) || 0;
	const baseBalance = parseFloat(ramMarket.baseBalance.split(' ')[0]) || 0;
	
	if (baseBalance === 0) return 0;
	
	// Price per byte
	const pricePerByte = quoteBalance / baseBalance;
	// Price per KB
	return pricePerByte * 1024;
}

/**
 * Estimate RAM cost for bytes
 */
export function estimateRamCost(bytes: number, ramMarket: RamMarket): number {
	const quoteBalance = parseFloat(ramMarket.quoteBalance.split(' ')[0]) || 0;
	const baseBalance = parseFloat(ramMarket.baseBalance.split(' ')[0]) || 0;
	
	if (baseBalance === 0) return 0;
	
	// Bancor formula for buying RAM
	const cost = (bytes * quoteBalance) / (baseBalance - bytes);
	return cost * 1.005; // Add 0.5% fee
}

/**
 * Estimate RAM bytes from WAX amount
 */
export function estimateRamBytes(waxAmount: number, ramMarket: RamMarket): number {
	const quoteBalance = parseFloat(ramMarket.quoteBalance.split(' ')[0]) || 0;
	const baseBalance = parseFloat(ramMarket.baseBalance.split(' ')[0]) || 0;
	
	if (quoteBalance === 0) return 0;
	
	// Bancor formula for calculating bytes
	const adjustedAmount = waxAmount / 1.005; // Remove 0.5% fee
	const bytes = (adjustedAmount * baseBalance) / (quoteBalance + adjustedAmount);
	return Math.floor(bytes);
}

/**
 * Calculate sell RAM return
 */
export function estimateRamSellReturn(bytes: number, ramMarket: RamMarket): number {
	const quoteBalance = parseFloat(ramMarket.quoteBalance.split(' ')[0]) || 0;
	const baseBalance = parseFloat(ramMarket.baseBalance.split(' ')[0]) || 0;
	
	if (baseBalance === 0) return 0;
	
	// Bancor formula for selling RAM
	const waxReturn = (bytes * quoteBalance) / (baseBalance + bytes);
	return waxReturn * 0.995; // Remove 0.5% fee
}

/**
 * Powerup state parsing
 */
export interface PowerupState {
	version: number;
	cpu: {
		weight: number;
		weightRatio: number;
		assumedStakeWeight: number;
		initialWeightRatio: number;
		targetWeightRatio: number;
		initialTimestamp: string;
		targetTimestamp: string;
		exponent: number;
		decaySeconds: number;
		minPrice: number;
		maxPrice: number;
		utilization: number;
		adjustedUtilization: number;
		utilizedDecaySeconds: number;
	};
	net: {
		weight: number;
		weightRatio: number;
		assumedStakeWeight: number;
		initialWeightRatio: number;
		targetWeightRatio: number;
		initialTimestamp: string;
		targetTimestamp: string;
		exponent: number;
		decaySeconds: number;
		minPrice: number;
		maxPrice: number;
		utilization: number;
		adjustedUtilization: number;
		utilizedDecaySeconds: number;
	};
	powerupDays: number;
	minPowerupFee: number;
}

/**
 * Estimate powerup cost
 */
export function estimatePowerupCost(
	cpuFrac: number,
	netFrac: number,
	powerupState: any
): { cpu: number; net: number; total: number } {
	// Simplified estimation - actual calculation is complex
	const cpuCost = (cpuFrac / 1000000) * 0.0001; // Very rough estimate
	const netCost = (netFrac / 1000000) * 0.00001;
	
	return {
		cpu: cpuCost,
		net: netCost,
		total: cpuCost + netCost,
	};
}

/**
 * Format resource display
 */
export function formatResourceDisplay(resources: AccountResources): string {
	const cpuPercent = calculateUsagePercentage(resources.cpu).toFixed(1);
	const netPercent = calculateUsagePercentage(resources.net).toFixed(1);
	const ramPercent = calculateUsagePercentage(resources.ram).toFixed(1);
	
	return `CPU: ${cpuPercent}% | NET: ${netPercent}% | RAM: ${ramPercent}%`;
}

/**
 * Get resource recommendations
 */
export function getResourceRecommendations(resources: AccountResources): string[] {
	const recommendations: string[] = [];
	
	if (isResourceCritical(resources.cpu, 20)) {
		recommendations.push('CPU is running low. Consider staking more WAX or using powerup.');
	}
	
	if (isResourceCritical(resources.net, 20)) {
		recommendations.push('NET is running low. Consider staking more WAX or using powerup.');
	}
	
	if (isResourceCritical(resources.ram, 10)) {
		recommendations.push('RAM is running low. Consider buying more RAM.');
	}
	
	return recommendations;
}

/**
 * Convert microseconds to readable time
 */
export function formatCpuTime(microseconds: number): string {
	if (microseconds < 1000) {
		return `${microseconds}µs`;
	} else if (microseconds < 1000000) {
		return `${(microseconds / 1000).toFixed(2)}ms`;
	} else {
		return `${(microseconds / 1000000).toFixed(2)}s`;
	}
}

/**
 * Convert bytes to readable size
 */
export function formatRamSize(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB'];
	let unitIndex = 0;
	let size = bytes;
	
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}
	
	return `${size.toFixed(2)} ${units[unitIndex]}`;
}
