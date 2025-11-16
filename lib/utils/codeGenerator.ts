/**
 * Generates unique fleet codes for truck owners
 */

/**
 * Generates an 8-character alphanumeric code
 * Format: Uppercase letters and numbers (e.g., "A7K9M2P4")
 */
export function generateFleetCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
}

/**
 * Calculates the expiration date for a fleet code (7 days from now)
 */
export function calculateExpirationDate(fromDate: Date = new Date()): Date {
  const expirationDate = new Date(fromDate);
  expirationDate.setDate(expirationDate.getDate() + 7);
  return expirationDate;
}

/**
 * Checks if a fleet code has expired
 */
export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Generates a unique fleet code by checking against existing codes
 * @param existingCodes - Array of existing fleet codes to check against
 * @param maxAttempts - Maximum number of generation attempts (default: 10)
 * @returns A unique fleet code
 * @throws Error if unable to generate unique code after maxAttempts
 */
export function generateUniqueFleetCode(
  existingCodes: string[],
  maxAttempts: number = 10
): string {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateFleetCode();
    if (!existingCodes.includes(code)) {
      return code;
    }
  }
  
  throw new Error('Unable to generate unique fleet code after maximum attempts');
}
