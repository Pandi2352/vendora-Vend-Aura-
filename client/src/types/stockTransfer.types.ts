export type TransferStatus = 'PENDING' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';

export interface StockTransferItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StockTransferRecord {
  id: string;
  transferNumber: string;
  sourceOutletId: string;
  sourceOutletName: string;
  destinationOutletId: string;
  destinationOutletName: string;
  status: TransferStatus;
  items: StockTransferItem[];
  totalQuantity: number;
  totalValue: number;
  dispatchedAt?: string;
  receivedAt?: string;
  dispatchedBy?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface StockTransferSummary {
  total: number;
  pending: number;
  dispatched: number;
  received: number;
  cancelled: number;
}

export interface StockTransferResponse {
  data: StockTransferRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: StockTransferSummary;
}

