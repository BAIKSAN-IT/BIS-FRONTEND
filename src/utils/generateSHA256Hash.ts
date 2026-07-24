import sha256 from "crypto-js/sha256";

/**
 * Generates SHA-256 hash for a given plaintext.
 * @param plaintext The plaintext to hash.
 * @returns The SHA-256 hash.
 */
const generateSHA256Hash = (plaintext: string): string => {
  const hash = sha256(plaintext).toString();
  return hash;
};

export default generateSHA256Hash;
