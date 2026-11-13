export type DeliveryStatus = 'PENDING_DISPATCH' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryItem {
  productId: string;
  name: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent?: number;
  taxAmount?: number;
  total: number;
}

export interface DeliveryOrder {
  id: string;
  _id?: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryStatus: DeliveryStatus;
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  paymentMode: string;
  grandTotal: number;
  itemsCount: number;
  items?: DeliveryItem[];
  createdAt: string;
}

export interface DeliverySummary {
  total: number;
  pendingDispatch: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
}

export interface UpdateDeliveryPayload {
  deliveryStatus?: DeliveryStatus;
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  deliveryAddress?: string;
}

