/**
 * Utility functions exports
 * 
 * This exports all utility functions and helpers.
 */

// Compression utilities
export {
  shouldUseCompression,
  compressData,
  decompressData,
  getCompressionStats,
  createCompressionWrapper,
  convertToUint8Array,
  COMPRESSION_THRESHOLD,
  MIN_FOUNTAIN_SIZE_COMPRESSED,
  MIN_FOUNTAIN_SIZE_UNCOMPRESSED,
  QR_CODE_SIZE_BYTES
} from '../core/lib/compressionUtils';

// General utilities
export { cn, clearScoutingLocalStorage, convertArrayOfArraysToCSV, convertTeamRole } from '../core/lib/utils';
