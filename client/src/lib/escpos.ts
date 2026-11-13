import type { InvoiceData } from '../types/pos.types';

/** Standard ESC/POS byte commands for thermal receipt printers (80mm & 58mm) */
export const ESC_POS = {
  INIT: [0x1b, 0x40],
  ALIGN_LEFT: [0x1b, 0x61, 0x00],
  ALIGN_CENTER: [0x1b, 0x61, 0x01],
  ALIGN_RIGHT: [0x1b, 0x61, 0x02],
  BOLD_ON: [0x1b, 0x45, 0x01],
  BOLD_OFF: [0x1b, 0x45, 0x00],
  DOUBLE_ON: [0x1d, 0x21, 0x11],
  DOUBLE_OFF: [0x1d, 0x21, 0x00],
  FEED_3: [0x1b, 0x64, 0x03],
  PARTIAL_CUT: [0x1d, 0x56, 0x01],
  FULL_CUT: [0x1d, 0x56, 0x00],
  DRAWER_KICK: [0x1b, 0x70, 0x00, 0x19, 0xfa],
};

export interface EscposOptions {
  rollWidth?: '80mm' | '58mm';
  kickDrawer?: boolean;
  cutPaper?: boolean;
}

/** Formats a string to fit two columns: left-aligned text and right-aligned value */
function padLine(left: string, right: string, maxLen: number): string {
  const available = Math.max(0, maxLen - left.length - right.length);
  return left + ' '.repeat(available) + right;
}

/** Converts plain UTF-8 text string to ASCII / CP437 byte array */
function textToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Replace ₹ with Rs. for standard thermal printers without Unicode KaTeX
    if (code === 0x20b9) {
      bytes.push(0x52, 0x73, 0x2e); // 'Rs.'
    } else if (code < 128) {
      bytes.push(code);
    } else {
      bytes.push(0x20); // space for unsupported extended characters
    }
  }
  return bytes;
}

/**
 * Builds raw binary ESC/POS command stream for 80mm (42-48 cols) or 58mm (32 cols).
 */
export function generateEscposBuffer(invoice: InvoiceData, options: EscposOptions = {}): Uint8Array {
  const { rollWidth = '80mm', kickDrawer = true, cutPaper = true } = options;
  const colWidth = rollWidth === '80mm' ? 42 : 32;
  const bytes: number[] = [];

  const add = (...cmd: number[][]) => {
    cmd.forEach((c) => bytes.push(...c));
  };
  const addLine = (text: string) => {
    bytes.push(...textToBytes(text));
    bytes.push(0x0a); // LF
  };

  // 1. Initialize
  add(ESC_POS.INIT);
  if (kickDrawer) add(ESC_POS.DRAWER_KICK);

  // 2. Header
  add(ESC_POS.ALIGN_CENTER, ESC_POS.BOLD_ON, ESC_POS.DOUBLE_ON);
  addLine(invoice.shopName || 'VENDORA STORE');
  add(ESC_POS.DOUBLE_OFF);

  if (invoice.address) addLine(invoice.address);
  if (invoice.phone) addLine(`Ph: ${invoice.phone}`);
  if (invoice.gstin) addLine(`GSTIN: ${invoice.gstin}`);
  addLine('-'.repeat(colWidth));

  // 3. Bill Meta
  add(ESC_POS.ALIGN_LEFT, ESC_POS.BOLD_OFF);
  addLine(padLine(`Inv: ${invoice.invoiceNumber}`, `Date: ${invoice.date}`, colWidth));
  addLine(padLine(`Time: ${invoice.time}`, `Cashier: ${invoice.cashier || 'Staff'}`, colWidth));
  if (invoice.customerName) {
    addLine(`Customer: ${invoice.customerName} (${invoice.customerPhone || ''})`);
  }
  addLine('-'.repeat(colWidth));

  // 4. Line Items Table
  add(ESC_POS.BOLD_ON);
  addLine(padLine('Item (Qty x Rate)', 'Total', colWidth));
  add(ESC_POS.BOLD_OFF);
  addLine('-'.repeat(colWidth));

  invoice.items.forEach((item) => {
    const itemTotal = (item.quantity * item.unitPrice).toFixed(2);
    addLine(padLine(item.name.slice(0, colWidth - itemTotal.length - 1), itemTotal, colWidth));
    addLine(`  ${item.quantity} x Rs.${item.unitPrice.toFixed(2)}`);
  });

  addLine('-'.repeat(colWidth));

  // 5. Totals
  addLine(padLine('Subtotal:', `Rs.${invoice.subTotal.toFixed(2)}`, colWidth));
  if (invoice.discountAmount && invoice.discountAmount > 0) {
    addLine(padLine(`Discount (${invoice.couponCode || 'PROMO'}):`, `-Rs.${invoice.discountAmount.toFixed(2)}`, colWidth));
  }
  addLine(padLine('CGST:', `Rs.${invoice.cgst.toFixed(2)}`, colWidth));
  addLine(padLine('SGST:', `Rs.${invoice.sgst.toFixed(2)}`, colWidth));
  if (invoice.roundOff !== 0) {
    addLine(padLine('Round Off:', `Rs.${invoice.roundOff.toFixed(2)}`, colWidth));
  }
  addLine('='.repeat(colWidth));

  add(ESC_POS.BOLD_ON, ESC_POS.DOUBLE_ON);
  addLine(padLine('TOTAL:', `Rs.${invoice.grandTotal.toFixed(2)}`, Math.floor(colWidth / 2)));
  add(ESC_POS.DOUBLE_OFF);
  addLine('='.repeat(colWidth));

  // 6. Tender Details
  addLine(padLine(`Paid via ${invoice.paymentMode}:`, `Rs.${invoice.cashTendered.toFixed(2)}`, colWidth));
  if (invoice.changeDue > 0) {
    addLine(padLine('Change Returned:', `Rs.${invoice.changeDue.toFixed(2)}`, colWidth));
  }

  // 7. Footer
  add(ESC_POS.ALIGN_CENTER, ESC_POS.BOLD_OFF);
  addLine('');
  addLine('*** THANK YOU! VISIT AGAIN ***');
  addLine('Powered by Vendora Retail Cloud');
  addLine('');

  // 8. Feed & Cut
  add(ESC_POS.FEED_3);
  if (cutPaper) add(ESC_POS.PARTIAL_CUT);

  return new Uint8Array(bytes);
}

/** Sends raw ESC/POS commands to USB/Serial thermal printer via Web Serial API if supported */
export async function printToSerialThermalPrinter(buffer: Uint8Array): Promise<boolean> {
  const nav = navigator as unknown as { serial?: { requestPort: () => Promise<unknown> } };
  if (!nav.serial) {
    return false;
  }
  try {
    const port = (await nav.serial.requestPort()) as {
      open: (cfg: { baudRate: number }) => Promise<void>;
      writable?: { getWriter: () => { write: (b: Uint8Array) => Promise<void>; releaseLock: () => void } };
      close: () => Promise<void>;
    };
    await port.open({ baudRate: 9600 });
    const writer = port.writable?.getWriter();
    if (writer) {
      await writer.write(buffer);
      writer.releaseLock();
    }
    await port.close();
    return true;
  } catch (err) {
    console.warn('WebSerial print failed or cancelled:', err);
    return false;
  }
}
