export class StringUtil {
  static slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  static sanitizeAlphanumeric(text: string, maxLen?: number): string {
    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    return maxLen ? cleaned.substring(0, maxLen) : cleaned;
  }

  static maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const masked = local.length <= 2 ? `${local[0]}*` : `${local[0]}***${local[local.length - 1]}`;
    return `${masked}@${domain}`;
  }

  static maskPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return phone;
    return `******${clean.slice(-4)}`;
  }
}

