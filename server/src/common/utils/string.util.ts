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

  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  static toCamelCase(text: string): string {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
        index === 0 ? letter.toLowerCase() : letter.toUpperCase()
      )
      .replace(/\s+/g, '');
  }

  static toSnakeCase(text: string): string {
    return text
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((string) => string.toLowerCase())
      .join('_');
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
