/**
 * Generic compression utilities for QR code data transfer
 * Framework implementation - game-agnostic
 * 
 * NOTE: Game implementations should provide field mappings for compression optimization
 */

import * as pako from 'pako';

// Constants for size thresholds and compression parameters
export const COMPRESSION_THRESHOLD = 10000; // Minimum bytes to trigger compression for scouting data
export const MIN_FOUNTAIN_SIZE_COMPRESSED = 50; // Minimum bytes for compressed fountain codes
export const MIN_FOUNTAIN_SIZE_UNCOMPRESSED = 100; // Minimum bytes for uncompressed fountain codes
export const QR_CODE_SIZE_BYTES = 2000; // Estimated bytes per QR code

/**
 * Check if data should use compression based on size
 * @param data - Data to check for compression eligibility
 * @param jsonString - Optional pre-computed JSON string to avoid duplicate serialization
 */
export function shouldUseCompression(data: unknown, jsonString?: string): boolean {
  const jsonSize = jsonString ? jsonString.length : JSON.stringify(data).length;
  return jsonSize > COMPRESSION_THRESHOLD;
}

/**
 * Compress data using pako gzip
 * @param data - Data object to compress
 * @param originalJson - Optional pre-computed JSON string to avoid duplicate serialization
 * @returns Compressed Uint8Array
 */
export function compressData(data: unknown, originalJson?: string): Uint8Array {
  const jsonString = originalJson || JSON.stringify(data);
  const gzipCompressed = pako.gzip(jsonString);
  
  if (import.meta.env.DEV) {
    const originalSize = jsonString.length;
    const finalSize = gzipCompressed.length;
    const compressionRatio = ((1 - finalSize / originalSize) * 100).toFixed(1);
    console.log(`✅ Compressed: ${originalSize} → ${finalSize} bytes (${compressionRatio}% reduction)`);
  }
  
  return gzipCompressed;
}

/**
 * Decompress gzip data
 * @param compressedData - Compressed Uint8Array
 * @returns Decompressed data object
 */
export function decompressData<T = unknown>(compressedData: Uint8Array): T {
  const binaryData = pako.ungzip(compressedData);
  const jsonString = new TextDecoder().decode(binaryData);
  return JSON.parse(jsonString) as T;
}

/**
 * Get compression statistics for display
 * @param originalData - Original data object
 * @param compressedData - Compressed data
 * @param originalJson - Optional pre-computed JSON string to avoid duplicate serialization
 */
export function getCompressionStats(
  originalData: unknown, 
  compressedData: Uint8Array, 
  originalJson?: string
): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  estimatedQRReduction: string;
} {
  const originalSize = originalJson ? originalJson.length : JSON.stringify(originalData).length;
  const compressedSize = compressedData.length;
  const compressionRatio = compressedSize / originalSize;
  
  // Estimate QR code count reduction
  const originalQRs = Math.ceil(originalSize / QR_CODE_SIZE_BYTES);
  const compressedQRs = Math.ceil(compressedSize / QR_CODE_SIZE_BYTES);
  const estimatedQRReduction = `~${originalQRs} → ${compressedQRs} codes`;
  
  return {
    originalSize,
    compressedSize,
    compressionRatio,
    estimatedQRReduction
  };
}

/**
 * Helper to create compression wrapper with base64-encoded data
 * @param isCompressed - Whether data is compressed
 * @param data - Data (Uint8Array if compressed, original type otherwise)
 * @param fromUint8Array - Base64 encoding function (from js-base64)
 */
export function createCompressionWrapper<T>(
  isCompressed: boolean,
  data: Uint8Array | T,
  fromUint8Array: (data: Uint8Array) => string
): { compressed: boolean; data: string | T } {
  return {
    compressed: isCompressed,
    data: isCompressed ? fromUint8Array(data as Uint8Array) : data as T
  };
}

/**
 * Convert various compressed data formats to Uint8Array
 * Handles base64 strings, number arrays, and Uint8Arrays
 * @param data - Data to convert
 * @param toUint8Array - Base64 decoding function (from js-base64)
 * @param dataLabel - Label for error messages
 */
export function convertToUint8Array(
  data: unknown, 
  toUint8Array: (data: string) => Uint8Array,
  dataLabel: string
): Uint8Array {
  if (typeof data === 'string') {
    return toUint8Array(data);
  } else if (Array.isArray(data)) {
    return new Uint8Array(data as number[]);
  } else if (data instanceof Uint8Array) {
    return data;
  } else {
    throw new Error(`Invalid ${dataLabel} format: expected base64 string, number array, or Uint8Array`);
  }
}
