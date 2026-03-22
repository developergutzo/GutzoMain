/**
 * Robust email validation utility following RFC 5322 subset and common typo protection.
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { valid: false, message: 'Email is required' };
  }

  // 1. Structural Regex (RFC 5322 compliant subset)
  // Ensures: user@domain.tld structure with at least 2 char TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  // 2. Prevent consecutive dots, leading/trailing dots in local/domain parts
  if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.') || trimmedEmail.includes('@.') || trimmedEmail.includes('.@')) {
    return { valid: false, message: 'Email format is invalid' };
  }

  // 3. Typo Protection for Major Domains
  const [local, domain] = trimmedEmail.toLowerCase().split('@');
  
  const providers = [
    { name: 'gmail', full: 'gmail.com' },
    { name: 'yahoo', full: 'yahoo.com' },
    { name: 'hotmail', full: 'hotmail.com' },
    { name: 'outlook', full: 'outlook.com' },
    { name: 'icloud', full: 'icloud.com' },
    { name: 'ymail', full: 'ymail.com' }
  ];

  const domainParts = domain.split('.');
  const domainName = domainParts[0];
  
  // Check for common prefix/subset typos (e.g., g.com, gm.com, gma.com, y.com, yaho.com)
  for (const provider of providers) {
    // If it's a prefix of the provider name (like 'gma' for 'gmail' or 'y' for 'yahoo')
    const isPrefix = provider.name.startsWith(domainName) && domainName.length > 0;
    
    // If it's a near-match (missing chars or transposed)
    const isNearMatch = (
      domainName.length >= 2 && 
      (provider.name.includes(domainName) || domainName.includes(provider.name.substring(0, 3)))
    );

    if ((isPrefix || isNearMatch) && domainName !== provider.name) {
      return { 
        valid: false, 
        message: `Did you mean ${provider.full}?` 
      };
    }
  }

  // Explicit mapping for specific tricky typos
  const explicitTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmail.con': 'gmail.com',
    'ymail.con': 'ymail.com',
    'yhoo.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
  };

  if (explicitTypos[domain]) {
    return { 
      valid: false, 
      message: `Did you mean ${explicitTypos[domain]}?` 
    };
  }

  // 4. Minimum TLD length (ensuring at least .xx)
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return { valid: false, message: 'Invalid domain extension' };
  }

  return { valid: true };
};
