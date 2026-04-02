const UNWANTED_CHARS = /[\s\-\.\(\)/\_\u00A0]+/g;
const RO_MOBILE_REGEX = /^(\+?40|0040)?0?7[0-9][0-9]{7}$/;

/**
 * Clean a phone string by removing unwanted characters.
 */
export function cleanPhone(phone: string): string {
  return phone.replace(UNWANTED_CHARS, "").trim();
}

/**
 * Check if a cleaned phone string is a valid Romanian mobile number.
 */
export function isRoMobile(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return RO_MOBILE_REGEX.test(cleaned);
}

/**
 * If the phone is a valid Romanian mobile, normalize it to +40 format.
 * Otherwise return the cleaned phone as-is.
 */
export function normalizeRoPhone(phone: string): string {
  const cleaned = cleanPhone(phone);
  if (!RO_MOBILE_REGEX.test(cleaned)) return cleaned;

  // Extract digits only
  let digits = cleaned.replace(/\D/g, "");
  // Strip country code prefix to get 7xxxxxxxx
  if (digits.startsWith("0040")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("40") && digits.length > 9) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return `+40${digits}`;
}

/**
 * Validate phone for form fields.
 * Returns true only for valid Romanian mobile numbers.
 */
export function isValidPhone(phone: string): boolean {
  return isRoMobile(phone);
}
