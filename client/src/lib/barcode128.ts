/**
 * Code 128 (Subset B) barcode bar pattern generator.
 * Zero external dependencies.
 */

const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131',
  '211412', // 103: Start Code A
  '211214', // 104: Start Code B
  '211232', // 105: Start Code C
  '2331112', // 106: Stop pattern
];

const START_CODE_B = 104;
const STOP_CODE = 106;

export function encodeCode128B(text: string): string[] {
  const safeText = (text || '100001').slice(0, 32);
  const values: number[] = [START_CODE_B];
  let checkSum = START_CODE_B;

  for (let i = 0; i < safeText.length; i++) {
    const code = safeText.charCodeAt(i) - 32;
    const val = code >= 0 && code <= 95 ? code : 0;
    values.push(val);
    checkSum += val * (i + 1);
  }

  const checkDigit = checkSum % 103;
  values.push(checkDigit);
  values.push(STOP_CODE);

  return values.map((v) => CODE128_PATTERNS[v] || CODE128_PATTERNS[0]);
}

/**
 * Computes barcode bar rects { x, width } and total width.
 */
export function computeBarcodeBars(text: string, barWidth = 1.5): { bars: Array<{ x: number; width: number }>; totalWidth: number } {
  const patterns = encodeCode128B(text);
  let x = 10;
  const bars: Array<{ x: number; width: number }> = [];

  for (const pattern of patterns) {
    let isBar = true;
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i], 10) * barWidth;
      if (isBar) {
        bars.push({ x, width });
      }
      x += width;
      isBar = !isBar;
    }
  }

  return { bars, totalWidth: x + 10 };
}

