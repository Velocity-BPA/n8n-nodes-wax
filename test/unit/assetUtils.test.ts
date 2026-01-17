/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	WAXP_PRECISION,
	parseWaxAmount,
	toSmallestUnit,
	isValidAssetId,
	isValidTemplateId,
	isValidCollectionName,
	isValidSchemaName,
	getIpfsUrl,
} from '../../nodes/Wax/utils/assetUtils';

describe('Asset Utilities', () => {
	describe('Constants', () => {
		it('should have correct WAXP precision', () => {
			expect(WAXP_PRECISION).toBe(8);
		});
	});

	describe('parseWaxAmount', () => {
		it('should parse WAX amount strings', () => {
			expect(parseWaxAmount('10.00000000 WAX')).toBe(10);
			expect(parseWaxAmount('1.50000000 WAX')).toBe(1.5);
			expect(parseWaxAmount('100.12345678 WAX')).toBeCloseTo(100.12345678);
		});

		it('should handle amounts without symbol', () => {
			expect(parseWaxAmount('10.00000000')).toBe(10);
		});
	});

	describe('toSmallestUnit', () => {
		it('should convert WAX to smallest unit', () => {
			expect(toSmallestUnit(1, 8)).toBe(100000000);
			expect(toSmallestUnit(10, 8)).toBe(1000000000);
		});
	});

	describe('isValidAssetId', () => {
		it('should return true for valid asset IDs', () => {
			expect(isValidAssetId('1099511627776')).toBe(true);
			expect(isValidAssetId('123456789')).toBe(true);
		});

		it('should return false for invalid asset IDs', () => {
			expect(isValidAssetId('')).toBe(false);
			expect(isValidAssetId('abc')).toBe(false);
			expect(isValidAssetId('-123')).toBe(false);
		});
	});

	describe('isValidTemplateId', () => {
		it('should return true for valid template IDs', () => {
			expect(isValidTemplateId('12345')).toBe(true);
			expect(isValidTemplateId('1')).toBe(true);
		});

		it('should return false for invalid template IDs', () => {
			expect(isValidTemplateId('')).toBe(false);
			expect(isValidTemplateId('abc')).toBe(false);
		});
	});

	describe('isValidCollectionName', () => {
		it('should return true for valid collection names', () => {
			expect(isValidCollectionName('mycollection')).toBe(true);
			expect(isValidCollectionName('alien.worlds')).toBe(true);
		});

		it('should return false for invalid collection names', () => {
			expect(isValidCollectionName('')).toBe(false);
			expect(isValidCollectionName('UPPERCASE')).toBe(false);
		});
	});

	describe('isValidSchemaName', () => {
		it('should return true for valid schema names', () => {
			expect(isValidSchemaName('myschema')).toBe(true);
			expect(isValidSchemaName('land.nft')).toBe(true);
		});

		it('should return false for invalid schema names', () => {
			expect(isValidSchemaName('')).toBe(false);
		});
	});

	describe('getIpfsUrl', () => {
		it('should convert IPFS hash to URL', () => {
			const hash = 'QmTest123456789';
			const url = getIpfsUrl(hash);
			expect(url).toContain(hash);
			expect(url).toMatch(/^https?:\/\//);
		});

		it('should handle ipfs:// prefix', () => {
			const url = getIpfsUrl('ipfs://QmTest123');
			expect(url).toContain('QmTest123');
		});
	});
});
