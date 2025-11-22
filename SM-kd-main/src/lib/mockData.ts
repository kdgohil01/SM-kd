// Mock Data for Development

import {
  Warehouse,
  Product,
  StockLocation,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockMovement,
  User,
} from '../types';

export const mockUser: User = {
  id: 'user-1',
  email: 'admin@inventory.com',
  name: 'John Doe',
};

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Main Warehouse',
    code: 'WH-001',
    address: '123 Industrial Blvd, City, State 12345',
    racks: [
      {
        id: 'rack-1',
        warehouseId: 'wh-1',
        name: 'A',
        sections: [
          {
            id: 'section-1',
            rackId: 'rack-1',
            name: 'A1',
            bins: [
              { id: 'bin-1', sectionId: 'section-1', name: 'A1-01' },
              { id: 'bin-2', sectionId: 'section-1', name: 'A1-02' },
            ],
          },
        ],
      },
      {
        id: 'rack-2',
        warehouseId: 'wh-1',
        name: 'B',
        sections: [
          {
            id: 'section-2',
            rackId: 'rack-2',
            name: 'B1',
            bins: [
              { id: 'bin-3', sectionId: 'section-2', name: 'B1-01' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'wh-2',
    name: 'Secondary Warehouse',
    code: 'WH-002',
    address: '456 Commerce St, City, State 12346',
    racks: [
      {
        id: 'rack-3',
        warehouseId: 'wh-2',
        name: 'C',
        sections: [
          {
            id: 'section-3',
            rackId: 'rack-3',
            name: 'C1',
            bins: [
              { id: 'bin-4', sectionId: 'section-3', name: 'C1-01' },
            ],
          },
        ],
      },
    ],
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'ELC-001',
    name: 'Wireless Mouse',
    category: 'Electronics',
    uom: 'pcs',
    reorderLevel: 20,
    description: 'Ergonomic wireless mouse with USB receiver',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'prod-2',
    sku: 'ELC-002',
    name: 'USB Cable',
    category: 'Electronics',
    uom: 'pcs',
    reorderLevel: 50,
    description: 'USB-C to USB-A cable, 2 meters',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'prod-3',
    sku: 'FUR-001',
    name: 'Office Chair',
    category: 'Furniture',
    uom: 'pcs',
    reorderLevel: 5,
    description: 'Ergonomic office chair with lumbar support',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'prod-4',
    sku: 'CLO-001',
    name: 'Cotton T-Shirt',
    category: 'Clothing',
    uom: 'pcs',
    reorderLevel: 100,
    description: '100% cotton crew neck t-shirt',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'prod-5',
    sku: 'TOOL-001',
    name: 'Screwdriver Set',
    category: 'Tools',
    uom: 'box',
    reorderLevel: 10,
    description: '10-piece precision screwdriver set',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
];

export const mockStockLocations: StockLocation[] = [
  { productId: 'prod-1', warehouseId: 'wh-1', quantity: 150 },
  { productId: 'prod-1', warehouseId: 'wh-2', quantity: 50 },
  { productId: 'prod-2', warehouseId: 'wh-1', quantity: 15 }, // Low stock
  { productId: 'prod-3', warehouseId: 'wh-1', quantity: 25 },
  { productId: 'prod-4', warehouseId: 'wh-1', quantity: 0 }, // Out of stock
  { productId: 'prod-5', warehouseId: 'wh-1', quantity: 8 }, // Low stock
];

export const mockReceipts: Receipt[] = [
  {
    id: 'rec-1',
    documentNumber: 'REC-001',
    vendorName: 'Tech Supplies Inc.',
    vendorContact: 'vendor@techsupplies.com',
    warehouseId: 'wh-1',
    status: 'Done',
    lines: [
      { id: 'line-1', productId: 'prod-1', quantity: 100 },
      { id: 'line-2', productId: 'prod-2', quantity: 200 },
    ],
    createdAt: new Date('2024-11-01'),
    validatedAt: new Date('2024-11-01'),
  },
  {
    id: 'rec-2',
    documentNumber: 'REC-002',
    vendorName: 'Office Furniture Co.',
    warehouseId: 'wh-1',
    status: 'Draft',
    lines: [
      { id: 'line-3', productId: 'prod-3', quantity: 10 },
    ],
    createdAt: new Date('2024-11-20'),
  },
  {
    id: 'rec-3',
    documentNumber: 'REC-003',
    vendorName: 'Tool Distributors',
    warehouseId: 'wh-1',
    status: 'Waiting',
    lines: [
      { id: 'line-4', productId: 'prod-5', quantity: 25 },
    ],
    createdAt: new Date('2024-11-21'),
  },
];

export const mockDeliveries: Delivery[] = [
  {
    id: 'del-1',
    documentNumber: 'DEL-001',
    customerName: 'ABC Corporation',
    customerContact: 'orders@abc.com',
    warehouseId: 'wh-1',
    status: 'Done',
    lines: [
      { id: 'line-5', productId: 'prod-1', quantity: 50 },
    ],
    createdAt: new Date('2024-11-10'),
    validatedAt: new Date('2024-11-10'),
  },
  {
    id: 'del-2',
    documentNumber: 'DEL-002',
    customerName: 'XYZ Retail',
    warehouseId: 'wh-1',
    status: 'Ready',
    lines: [
      { id: 'line-6', productId: 'prod-2', quantity: 30 },
    ],
    createdAt: new Date('2024-11-22'),
  },
];

export const mockTransfers: InternalTransfer[] = [
  {
    id: 'trans-1',
    documentNumber: 'TRF-001',
    sourceWarehouseId: 'wh-1',
    destinationWarehouseId: 'wh-2',
    status: 'Done',
    lines: [
      { id: 'line-7', productId: 'prod-1', quantity: 50 },
    ],
    createdAt: new Date('2024-11-15'),
    validatedAt: new Date('2024-11-15'),
  },
  {
    id: 'trans-2',
    documentNumber: 'TRF-002',
    sourceWarehouseId: 'wh-1',
    destinationWarehouseId: 'wh-2',
    status: 'Waiting',
    lines: [
      { id: 'line-8', productId: 'prod-3', quantity: 5 },
    ],
    createdAt: new Date('2024-11-22'),
  },
];

export const mockAdjustments: StockAdjustment[] = [
  {
    id: 'adj-1',
    documentNumber: 'ADJ-001',
    warehouseId: 'wh-1',
    status: 'Done',
    adjustmentType: 'Physical Count',
    lines: [
      {
        id: 'line-9',
        productId: 'prod-2',
        quantity: -5,
        recordedQuantity: 20,
        physicalQuantity: 15,
        difference: -5,
      },
    ],
    createdAt: new Date('2024-11-18'),
    validatedAt: new Date('2024-11-18'),
  },
];

export const mockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    movementType: 'Receipt',
    documentType: 'Receipt',
    documentId: 'rec-1',
    documentNumber: 'REC-001',
    quantity: 100,
    previousStock: 50,
    newStock: 150,
    timestamp: new Date('2024-11-01T10:00:00'),
    userId: 'user-1',
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    movementType: 'Delivery',
    documentType: 'Delivery',
    documentId: 'del-1',
    documentNumber: 'DEL-001',
    quantity: -50,
    previousStock: 150,
    newStock: 100,
    timestamp: new Date('2024-11-10T14:30:00'),
    userId: 'user-1',
  },
  {
    id: 'mov-3',
    productId: 'prod-1',
    warehouseId: 'wh-1',
    movementType: 'Transfer Out',
    documentType: 'Internal',
    documentId: 'trans-1',
    documentNumber: 'TRF-001',
    quantity: -50,
    previousStock: 100,
    newStock: 50,
    timestamp: new Date('2024-11-15T09:00:00'),
    userId: 'user-1',
  },
  {
    id: 'mov-4',
    productId: 'prod-1',
    warehouseId: 'wh-2',
    movementType: 'Transfer In',
    documentType: 'Internal',
    documentId: 'trans-1',
    documentNumber: 'TRF-001',
    quantity: 50,
    previousStock: 0,
    newStock: 50,
    timestamp: new Date('2024-11-15T09:00:00'),
    userId: 'user-1',
  },
  {
    id: 'mov-5',
    productId: 'prod-2',
    warehouseId: 'wh-1',
    movementType: 'Adjustment',
    documentType: 'Adjustment',
    documentId: 'adj-1',
    documentNumber: 'ADJ-001',
    quantity: -5,
    previousStock: 20,
    newStock: 15,
    timestamp: new Date('2024-11-18T16:00:00'),
    userId: 'user-1',
  },
];
