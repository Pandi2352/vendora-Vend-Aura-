import { CheckoutModal } from './CheckoutModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { HeldCartsModal } from './cart/HeldCartsModal';
import { SalesReturnModal } from './orders/SalesReturnModal';
import { CashDrawerModal } from './orders/CashDrawerModal';
import type { InvoiceData, CustomerItem, PaymentMode } from '../types/pos.types';
import type { ShiftSummary, HeldCart } from '../types/shift-return.types';

interface AppModalsProps {
  isCheckoutOpen: boolean;
  grandTotal: number;
  customers: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  onSelectCustomer: (c: CustomerItem | null) => void;
  onCloseCheckout: () => void;
  onFinalizeBill: (mode: PaymentMode, cashTendered: number, customer?: CustomerItem | null) => void;
  checkoutError: string;
  isSubmittingBill: boolean;

  completedInvoice: InvoiceData | null;
  onCloseReceipt: () => void;
  onNewSale: () => void;

  isHeldCartsOpen: boolean;
  onCloseHeldCarts: () => void;
  heldCarts: HeldCart[];
  onResumeCart: (session: HeldCart) => void;
  onDiscardCart: (id: string) => void;

  isReturnModalOpen: boolean;
  onCloseReturnModal: () => void;
  onReturnSuccess: () => void;
  isDrawerModalOpen: boolean;
  onCloseDrawerModal: () => void;
  onShiftChange: (shift: ShiftSummary | null) => void;
}

export function AppModals({
  isCheckoutOpen,
  grandTotal,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onCloseCheckout,
  onFinalizeBill,
  checkoutError,
  isSubmittingBill,
  completedInvoice,
  onCloseReceipt,
  onNewSale,
  isHeldCartsOpen,
  onCloseHeldCarts,
  heldCarts,
  onResumeCart,
  onDiscardCart,
  isReturnModalOpen,
  onCloseReturnModal,
  onReturnSuccess,
  isDrawerModalOpen,
  onCloseDrawerModal,
  onShiftChange,
}: AppModalsProps) {
  return (
    <>
      {isCheckoutOpen && (
        <CheckoutModal
          grandTotal={grandTotal}
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={onSelectCustomer}
          onClose={onCloseCheckout}
          onFinalize={onFinalizeBill}
          error={checkoutError}
          isSubmitting={isSubmittingBill}
        />
      )}

      {completedInvoice && (
        <ThermalReceiptModal
          invoice={completedInvoice}
          onClose={onCloseReceipt}
          onNewSale={onNewSale}
        />
      )}

      <HeldCartsModal
        isOpen={isHeldCartsOpen}
        onClose={onCloseHeldCarts}
        heldCarts={heldCarts}
        onResumeCart={onResumeCart}
        onDiscardCart={onDiscardCart}
      />

      {isReturnModalOpen && (
        <SalesReturnModal onClose={onCloseReturnModal} onReturnSuccess={onReturnSuccess} />
      )}

      <CashDrawerModal
        isOpen={isDrawerModalOpen}
        onClose={onCloseDrawerModal}
        onShiftChange={onShiftChange}
      />
    </>
  );
}
