/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	isValidAccountName,
	isWaxCloudWallet,
	parsePermissionLevel,
	formatBytes,
	formatMicroseconds,
} from '../../nodes/Wax/utils/accountUtils';

describe('Account Utilities', () => {
	describe('isValidAccountName', () => {
		it('should return true for valid 12-character account names', () => {
			expect(isValidAccountName('testtesttest')).toBe(true);
			expect(isValidAccountName('myaccount123')).toBe(true);
			expect(isValidAccountName('a]1.b2.c3.d4')).toBe(true);
		});

		it('should return true for valid shorter account names', () => {
			expect(isValidAccountName('eosio')).toBe(true);
			expect(isValidAccountName('test')).toBe(true);
		});

		it('should return false for invalid account names', () => {
			expect(isValidAccountName('')).toBe(false);
			expect(isValidAccountName('UPPERCASE')).toBe(false);
			expect(isValidAccountName('has spaces')).toBe(false);
			expect(isValidAccountName('toolongaccountname')).toBe(false);
			expect(isValidAccountName('has6789')).toBe(false);
		});
	});

	describe('isWaxCloudWallet', () => {
		it('should return true for .wam accounts', () => {
			expect(isWaxCloudWallet('abc12.wam')).toBe(true);
			expect(isWaxCloudWallet('test1.wam')).toBe(true);
		});

		it('should return false for non-.wam accounts', () => {
			expect(isWaxCloudWallet('testaccount1')).toBe(false);
			expect(isWaxCloudWallet('eosio')).toBe(false);
		});
	});

	describe('parsePermissionLevel', () => {
		it('should parse account@permission format', () => {
			const result = parsePermissionLevel('myaccount@active');
			expect(result).toEqual({
				actor: 'myaccount',
				permission: 'active',
			});
		});

		it('should default to active permission', () => {
			const result = parsePermissionLevel('myaccount');
			expect(result).toEqual({
				actor: 'myaccount',
				permission: 'active',
			});
		});
	});

	describe('formatBytes', () => {
		it('should format bytes correctly', () => {
			expect(formatBytes(0)).toBe('0 Bytes');
			expect(formatBytes(1024)).toBe('1 KB');
			expect(formatBytes(1048576)).toBe('1 MB');
			expect(formatBytes(1073741824)).toBe('1 GB');
		});
	});

	describe('formatMicroseconds', () => {
		it('should format microseconds correctly', () => {
			expect(formatMicroseconds(1000)).toBe('1.00 ms');
			expect(formatMicroseconds(1000000)).toBe('1000.00 ms');
		});
	});
});
