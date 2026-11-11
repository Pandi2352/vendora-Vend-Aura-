import { AppModals } from '../AppModals';
import { usePosSession } from '../../hooks/usePosSession';

/** Renders the POS modals (checkout, receipt, held bills, returns, cash drawer) once for the whole app. */
export function PosModalsHost() {
  const pos = usePosSession();
  const { checkout } = pos;

  return (
    <AppModals
      isCheckoutOpen={pos.openModal === 'checkout'}
      grandTotal={pos.grandTotal}
      customers={pos.customers}
      selectedCustomer={pos.selectedCustomer}
      onSelectCustomer={pos.setSelectedCustomer}
      onCloseCheckout={pos.closeModal}
      onFinalizeBill={checkout.finalizeBill}
      checkoutError={checkout.error}
      isSubmittingBill={checkout.isSubmitting}
      completedInvoice={checkout.completedInvoice}
      onCloseReceipt={() => checkout.showInvoice(null)}
      onNewSale={() => checkout.showInvoice(null)}
      isHeldCartsOpen={pos.openModal === 'heldCarts'}
      onCloseHeldCarts={pos.closeModal}
      heldCarts={pos.heldCarts}
      onResumeCart={pos.resumeHeldCart}
      onDiscardCart={pos.discardHeldCart}
      isReturnModalOpen={pos.openModal === 'returns'}
      onCloseReturnModal={pos.closeModal}
      onReturnSuccess={pos.refreshAfterSale}
      isDrawerModalOpen={pos.openModal === 'drawer'}
      onCloseDrawerModal={pos.closeModal}
      onShiftChange={pos.setActiveShift}
    />
  );
}
