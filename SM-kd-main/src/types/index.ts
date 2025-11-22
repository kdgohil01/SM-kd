// Data Models for Inventory Management System

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  racks: Rack[];
}

export interface Rack {
  id: string;
  warehouseId: string;
  name: string;
  sections: Section[];
}

export interface Section {
  id: string;
  rackId: string;
  name: string;
  bins: Bin[];
}

export interface Bin {
  id: string;
  sectionId: string;
  name: string;
}

export type ProductCategory = 'Electronics' | 'Furniture' | 'Clothing' | 'Food' | 'Books' | 'Tools' | 'Other';
export type UOM = 'pcs' | 'kg' | 'lbs' | 'box' | 'carton' | 'dozen';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  uom: UOM;
  reorderLevel: number;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockLocation {
  productId: string;
  warehouseId: string;
  rackId?: string;
  sectionId?: string;
  binId?: string;
  quantity: number;
}

export type DocumentStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
export type DocumentType = 'Receipt' | 'Delivery' | 'Internal' | 'Adjustment';

export interface DocumentLine {
  id: string;
  productId: string;
  quantity: number;
  locationId?: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  documentNumber: string;
  vendorName: string;
  vendorContact?: string;
  warehouseId: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  createdAt: Date;
  validatedAt?: Date;
  notes?: string;
}

export interface Delivery {
  id: string;
  documentNumber: string;
  customerName: string;
  customerContact?: string;
  warehouseId: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  createdAt: Date;
  validatedAt?: Date;
  notes?: string;
}

export interface InternalTransfer {
  id: string;
  documentNumber: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  createdAt: Date;
  validatedAt?: Date;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  documentNumber: string;
  warehouseId: string;
  status: DocumentStatus;
  adjustmentType: 'Physical Count' | 'Damage' | 'Loss' | 'Other';
  lines: AdjustmentLine[];
  createdAt: Date;
  validatedAt?: Date;
  notes?: string;
}

export interface AdjustmentLine extends DocumentLine {
  recordedQuantity: number;
  physicalQuantity: number;
  difference: number;
}

export type MovementType = 'Receipt' | 'Delivery' | 'Transfer In' | 'Transfer Out' | 'Adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: MovementType;
  documentType: DocumentType;
  documentId: string;
  documentNumber: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  timestamp: Date;
  userId: string;
  notes?: string;
}

export interface DashboardKPIs {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}

export interface DashboardFilters {
  documentType?: DocumentType;
  status?: DocumentStatus;
  warehouseId?: string;
  category?: ProductCategory;
  dateFrom?: Date;
  dateTo?: Date;
}
