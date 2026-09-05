import { describe, expect, it } from 'vitest';
import { isValidEmail, isValidFullName, isValidPhone, validateUploadFile } from './validation';

describe('isValidEmail', () => {
  it('accepts well-formed addresses', () => {
    expect(isValidEmail('ahmet.yilmaz@gmail.com')).toBe(true);
    expect(isValidEmail('test@sub.example.co')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing-domain@')).toBe(false);
    expect(isValidEmail('@missing-local.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts Polish and Turkish formatted numbers', () => {
    expect(isValidPhone('+48 570 123 456')).toBe(true);
    expect(isValidPhone('+48570123456')).toBe(true);
    expect(isValidPhone('+90 532 123 45 67')).toBe(true);
  });

  it('rejects numbers without country code or too short', () => {
    expect(isValidPhone('570123456')).toBe(false);
    expect(isValidPhone('+48')).toBe(false);
    expect(isValidPhone('+48 ')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});

describe('isValidFullName', () => {
  it('requires a first and last name', () => {
    expect(isValidFullName('Ahmet Yılmaz')).toBe(true);
  });

  it('rejects single-word or too-short names', () => {
    expect(isValidFullName('Ahmet')).toBe(false);
    expect(isValidFullName('Al')).toBe(false);
    expect(isValidFullName('')).toBe(false);
  });
});

describe('validateUploadFile', () => {
  function makeFile(name: string, sizeBytes: number): File {
    const blob = new Blob([new Uint8Array(Math.max(0, sizeBytes))]);
    return new File([blob], name);
  }

  it('accepts a small PDF', () => {
    const result = validateUploadFile(makeFile('kira-kontrati.pdf', 1024));
    expect(result.valid).toBe(true);
  });

  it('rejects files over the 15 MB limit', () => {
    const result = validateUploadFile(makeFile('buyuk-dosya.pdf', 16 * 1024 * 1024));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/15 MB/);
  });

  it('rejects disallowed file extensions', () => {
    const result = validateUploadFile(makeFile('script.exe', 1024));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Desteklenmeyen/);
  });
});
