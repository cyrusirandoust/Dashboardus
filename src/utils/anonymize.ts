/**
 * PII Anonymization Utilities
 * 
 * Functions to anonymize personally identifiable information (PII)
 * for display on public screens or shared dashboards.
 * 
 * Security Note: This is for display purposes only. The actual data
 * remains unchanged in Microsoft Graph. This helps protect privacy
 * when the dashboard is displayed on wall screens or in public areas.
 */

// ============================================================================
// Anonymization Functions
// ============================================================================

/**
 * Anonymize a user's display name.
 * @param name - Full name (e.g., "John Doe")
 * @returns Anonymized name (e.g., "J*** D***")
 */
export function anonymizeName(name: string | null | undefined): string {
  if (!name) return 'N/A';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 0) return '***';
  
  return parts
    .map(part => {
      if (part.length === 0) return '';
      if (part.length === 1) return part[0] + '***';
      return part[0] + '***';
    })
    .join(' ');
}

/**
 * Anonymize an email address.
 * @param email - Email address (e.g., "john.doe@contoso.com")
 * @returns Anonymized email (e.g., "j***@contoso.com")
 */
export function anonymizeEmail(email: string | null | undefined): string {
  if (!email) return 'N/A';
  
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***';
  
  const [localPart, domain] = parts;
  
  if (localPart.length === 0) return '***@' + domain;
  if (localPart.length === 1) return localPart[0] + '***@' + domain;
  
  return localPart[0] + '***@' + domain;
}

/**
 * Anonymize a User Principal Name (UPN).
 * Same as email anonymization.
 * @param upn - User Principal Name
 * @returns Anonymized UPN
 */
export function anonymizeUPN(upn: string | null | undefined): string {
  return anonymizeEmail(upn);
}

/**
 * Anonymize a device name.
 * @param deviceName - Device name (e.g., "LAPTOP-JOHNDOE")
 * @returns Anonymized device name (e.g., "LAPTOP-***")
 */
export function anonymizeDeviceName(deviceName: string | null | undefined): string {
  if (!deviceName) return 'N/A';
  
  // If device name contains a hyphen, keep prefix and anonymize suffix
  if (deviceName.includes('-')) {
    const parts = deviceName.split('-');
    return parts[0] + '-***';
  }
  
  // Otherwise, show first 3 characters and anonymize rest
  if (deviceName.length <= 3) return '***';
  return deviceName.substring(0, 3) + '***';
}

/**
 * Anonymize a tenant name.
 * @param tenantName - Tenant name (e.g., "Contoso Ltd")
 * @returns Anonymized tenant name (e.g., "C*** L***")
 */
export function anonymizeTenantName(tenantName: string | null | undefined): string {
  if (!tenantName) return 'N/A';
  
  const parts = tenantName.trim().split(' ');
  
  if (parts.length === 0) return '***';
  
  return parts
    .map(part => {
      if (part.length === 0) return '';
      if (part.length === 1) return part[0] + '***';
      return part[0] + '***';
    })
    .join(' ');
}

/**
 * Anonymize a domain name.
 * @param domain - Domain name (e.g., "contoso.com")
 * @returns Anonymized domain (e.g., "c***.com")
 */
export function anonymizeDomain(domain: string | null | undefined): string {
  if (!domain) return 'N/A';
  
  const parts = domain.split('.');
  if (parts.length === 0) return '***';
  
  // Keep TLD, anonymize rest
  const tld = parts[parts.length - 1];
  const mainPart = parts[0];
  
  if (mainPart.length === 0) return '***.' + tld;
  if (mainPart.length === 1) return mainPart[0] + '***.' + tld;
  
  return mainPart[0] + '***.' + tld;
}

/**
 * Anonymize an IP address.
 * @param ip - IP address (e.g., "192.168.1.100")
 * @returns Anonymized IP (e.g., "192.168.***.***")
 */
export function anonymizeIP(ip: string | null | undefined): string {
  if (!ip) return 'N/A';
  
  const parts = ip.split('.');
  if (parts.length !== 4) return '***.***.***. ***';
  
  // Keep first two octets, anonymize last two
  return `${parts[0]}.${parts[1]}.***. ***`;
}

/**
 * Anonymize a phone number.
 * @param phone - Phone number (e.g., "+1 (555) 123-4567")
 * @returns Anonymized phone (e.g., "+1 (***) ***-4567")
 */
export function anonymizePhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  
  // Keep last 4 digits, anonymize rest
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  
  const last4 = digits.slice(-4);
  return '*** *** ' + last4;
}

// ============================================================================
// Conditional Anonymization
// ============================================================================

/**
 * Anonymize text based on anonymization rules.
 * @param text - Text to potentially anonymize
 * @param type - Type of text ('name' | 'email' | 'device' | 'tenant' | 'domain')
 * @param shouldAnonymize - Whether to anonymize
 * @returns Original or anonymized text
 */
export function conditionalAnonymize(
  text: string | null | undefined,
  type: 'name' | 'email' | 'device' | 'tenant' | 'domain' | 'ip' | 'phone',
  shouldAnonymize: boolean
): string {
  if (!shouldAnonymize) return text || 'N/A';
  
  switch (type) {
    case 'name':
      return anonymizeName(text);
    case 'email':
      return anonymizeEmail(text);
    case 'device':
      return anonymizeDeviceName(text);
    case 'tenant':
      return anonymizeTenantName(text);
    case 'domain':
      return anonymizeDomain(text);
    case 'ip':
      return anonymizeIP(text);
    case 'phone':
      return anonymizePhone(text);
    default:
      return text || 'N/A';
  }
}

// ============================================================================
// Bulk Anonymization
// ============================================================================

/**
 * Anonymize multiple fields in an object.
 * @param obj - Object with fields to anonymize
 * @param rules - Anonymization rules (field name -> type)
 * @param shouldAnonymize - Whether to anonymize
 * @returns New object with anonymized fields
 */
export function anonymizeObject<T extends Record<string, any>>(
  obj: T,
  rules: Record<keyof T, 'name' | 'email' | 'device' | 'tenant' | 'domain' | 'ip' | 'phone'>,
  shouldAnonymize: boolean
): T {
  if (!shouldAnonymize) return obj;
  
  const result = { ...obj };
  
  for (const [field, type] of Object.entries(rules)) {
    if (field in result) {
      result[field as keyof T] = conditionalAnonymize(
        result[field as keyof T] as string,
        type as any,
        true
      ) as any;
    }
  }
  
  return result;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a string appears to be an email address.
 * @param text - Text to check
 * @returns True if appears to be an email
 */
export function looksLikeEmail(text: string | null | undefined): boolean {
  if (!text) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

/**
 * Check if a string appears to be a device name.
 * @param text - Text to check
 * @returns True if appears to be a device name
 */
export function looksLikeDeviceName(text: string | null | undefined): boolean {
  if (!text) return false;
  // Common device name patterns: DESKTOP-*, LAPTOP-*, PC-*, etc.
  return /^(DESKTOP|LAPTOP|PC|WORKSTATION|SERVER)-/i.test(text);
}

/**
 * Auto-detect and anonymize text based on pattern.
 * @param text - Text to anonymize
 * @param shouldAnonymize - Whether to anonymize
 * @returns Anonymized text
 */
export function autoAnonymize(text: string | null | undefined, shouldAnonymize: boolean): string {
  if (!shouldAnonymize || !text) return text || 'N/A';
  
  if (looksLikeEmail(text)) {
    return anonymizeEmail(text);
  }
  
  if (looksLikeDeviceName(text)) {
    return anonymizeDeviceName(text);
  }
  
  // Default to name anonymization
  return anonymizeName(text);
}

// ============================================================================
// Export All
// ============================================================================

export const anonymize = {
  name: anonymizeName,
  email: anonymizeEmail,
  upn: anonymizeUPN,
  deviceName: anonymizeDeviceName,
  tenantName: anonymizeTenantName,
  domain: anonymizeDomain,
  ip: anonymizeIP,
  phone: anonymizePhone,
  conditional: conditionalAnonymize,
  object: anonymizeObject,
  auto: autoAnonymize,
  utils: {
    looksLikeEmail,
    looksLikeDeviceName,
  },
};

export default anonymize;

// Made with Bob
