import { CheckoutModal } from './CheckoutModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { PasswordResetModal } from './PasswordResetModal';
import { HeldCartsModal } from './cart/HeldCartsModal';
import { SalesReturnModal } from './orders/SalesReturnModal';
import { CashDrawerModal } from './orders/CashDrawerModal';
import type { InvoiceData, CustomerItem, AuthUser } from '../types/pos.types';
import type { ShiftSummary, HeldCart } from '../types/shift-return.types';

interface AppModalsProps {
  isCheckoutOpen: boolean;
  grandTotal: number;
  customers: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  onSelectCustomer: (c: CustomerItem | null) => void;
  onCloseCheckout: () => void;
  onFinalizeBill: (mode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT', cashTendered: number, customer?: CustomerItem | null) => void;

  completedInvoice: InvoiceData | null;
  onCloseReceipt: () => void;
  onNewSale: () => void;

  mustChangePassword?: boolean;
  newPassword?: string;
  setNewPassword?: (val: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (val: string) => void;
  passwordError?: string;
  isUpdatingPassword?: boolean;
  onChangePassword?: (e: React.FormEvent) => void;

  isHeldCartsOpen: boolean;
  onCloseHeldCarts: () => void;
  heldCarts: HeldCart[];
  onResumeCart: (session: HeldCart) => void;
  onDiscardCart: (id: string) => void;

  currentUser: AuthUser | null;
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
  completedInvoice,
  onCloseReceipt,
  onNewSale,
  mustChangePassword,
  newPassword = '',
  setNewPassword = () => {},
  confirmPassword = '',
  setConfirmPassword = () => {},
  passwordError = '',
  isUpdatingPassword = false,
  onChangePassword = () => {},
  isHeldCartsOpen,
  onCloseHeldCarts,
  heldCarts,
  onResumeCart,
  onDiscardCart,
  currentUser,
  isReturnModalOpen,
  onCloseReturnModal,
  onReturnSuccess,
  isDrawerModalOpen,
  onCloseDrawerModal,
  onShiftChange,
}: AppModalsProps) {
  return (
    <>
      <CheckoutModal
        grandTotal={grandTotal}
        isOpen={isCheckoutOpen}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={onSelectCustomer}
        onClose={onCloseCheckout}
        onFinalize={onFinalizeBill}
      />

      {completedInvoice && (
        <ThermalReceiptModal
          invoice={completedInvoice}
          onClose={onCloseReceipt}
          onNewSale={onNewSale}
        />
      )}

      {mustChangePassword && (
        <PasswordResetModal
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordError={passwordError}
          isUpdatingPassword={isUpdatingPassword}
          onSubmit={onChangePassword}
        />
      )}

      <HeldCartsModal
        isOpen={isHeldCartsOpen}
        onClose={onCloseHeldCarts}
        heldCarts={heldCarts}
        onResumeCart={onResumeCart}
        onDiscardCart={onDiscardCart}
      />

      {currentUser?.tenantId && (
        <>
          <SalesReturnModal
            isOpen={isReturnModalOpen}
            onClose={onCloseReturnModal}
            tenantId={currentUser.tenantId}
            cashierName={currentUser.fullName || currentUser.username || 'Cashier'}
            onReturnSuccess={onReturnSuccess}
          />

          <CashDrawerModal
            isOpen={isDrawerModalOpen}
            onClose={onCloseDrawerModal}
            tenantId={currentUser.tenantId}
            cashierName={currentUser.fullName || currentUser.username || 'Cashier'}
            onShiftChange={onShiftChange}
          />
        </>
      )}
    </>
  );
}
