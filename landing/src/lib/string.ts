/** Keeps only digits, optionally capped: digitsOnly('98-76 5', 10) -> '98765' */
export const digitsOnly = (value = '', maxLength?: number) => {
  const digits = value.replace(/\D/g, '');
  return maxLength ? digits.slice(0, maxLength) : digits;
};

/** Lower-case letters and digits only: "K-Mart 1" -> "kmart1". */
export const alphanumericLower = (value = '', maxLength?: number) => {
  const clean = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  return maxLength ? clean.slice(0, maxLength) : clean;
};
