import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  Product,
  Warehouse,
  StockLocation,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockMovement,
  DocumentLine,
  AdjustmentLine,
} from '../types';
import {
  mockProducts,
  mockWarehouses,
  mockStockLocations,
  mockReceipts,
  mockDeliveries,
  mockTransfers,
  mockAdjustments,
  mockMovements,
} from '../lib/mockData';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  getProduct: (id: string) => Product | undefined;
  
  // Warehouses
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'racks'>) => Warehouse;
  updateWarehouse: (id: string, updates: Partial<Pick<Warehouse, 'name' | 'address'>>) => void;
  
  // Stock Locations
  stockLocations: StockLocation[];
  getStockByProduct: (productId: string) => StockLocation[];
  getTotalStock: (productId: string) => number;
  getStockByProductAndWarehouse: (productId: string, warehouseId: string) => number;
  updateStock: (productId: string, warehouseId: string, quantity: number) => void;
  checkStockAvailability: (productId: string, warehouseId: string, quantity: number) => boolean;
  
  // Receipts
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>) => Receipt;
  validateReceipt: (id: string) => void;
  getReceipt: (id: string) => Receipt | undefined;
  
  // Deliveries
  deliveries: Delivery[];
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => Delivery;
  validateDelivery: (id: string) => void;
  getDelivery: (id: string) => Delivery | undefined;
  
  // Transfers
  transfers: InternalTransfer[];
  addTransfer: (transfer: Omit<InternalTransfer, 'id' | 'createdAt'>) => InternalTransfer;
  validateTransfer: (id: string) => void;
  getTransfer: (id: string) => InternalTransfer | undefined;
  
  // Adjustments
  adjustments: StockAdjustment[];
  addAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'createdAt'>) => StockAdjustment;
  validateAdjustment: (id: string) => void;
  getAdjustment: (id: string) => StockAdjustment | undefined;
  
  // Movements
  movements: StockMovement[];
  addMovement: (movement: Omit<StockMovement, 'id'>) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Helper function to load from localStorage or use defaults
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects for specific fields
        if (key === 'inventory_products') {
          return parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
        }
        if (key === 'inventory_receipts' || key === 'inventory_deliveries' || 
            key === 'inventory_transfers' || key === 'inventory_adjustments') {
          return parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            validatedAt: item.validatedAt ? new Date(item.validatedAt) : undefined,
          }));
        }
        if (key === 'inventory_movements') {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }));
        }
        return parsed;
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  };
  
  const [products, setProducts] = useState<Product[]>(() => 
    loadFromStorage('inventory_products', mockProducts)
  );
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => 
    loadFromStorage('inventory_warehouses', mockWarehouses)
  );
  const [stockLocations, setStockLocations] = useState<StockLocation[]>(() => 
    loadFromStorage('inventory_stock_locations', mockStockLocations)
  );
  const [receipts, setReceipts] = useState<Receipt[]>(() => 
    loadFromStorage('inventory_receipts', mockReceipts)
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => 
    loadFromStorage('inventory_deliveries', mockDeliveries)
  );
  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => 
    loadFromStorage('inventory_transfers', mockTransfers)
  );
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => 
    loadFromStorage('inventory_adjustments', mockAdjustments)
  );
  const [movements, setMovements] = useState<StockMovement[]>(() => 
    loadFromStorage('inventory_movements', mockMovements)
  );
  
  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('inventory_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);
  
  useEffect(() => {
    localStorage.setItem('inventory_stock_locations', JSON.stringify(stockLocations));
  }, [stockLocations]);
  
  useEffect(() => {
    localStorage.setItem('inventory_receipts', JSON.stringify(receipts));
  }, [receipts]);
  
  useEffect(() => {
    localStorage.setItem('inventory_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);
  
  useEffect(() => {
    localStorage.setItem('inventory_transfers', JSON.stringify(transfers));
  }, [transfers]);
  
  useEffect(() => {
    localStorage.setItem('inventory_adjustments', JSON.stringify(adjustments));
  }, [adjustments]);
  
  useEffect(() => {
    localStorage.setItem('inventory_movements', JSON.stringify(movements));
  }, [movements]);

  // Products
  const addProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    ));
  }, []);

  const getProduct = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  // Warehouses
  const addWarehouse = useCallback((warehouseData: Omit<Warehouse, 'id' | 'racks'>) => {
    // light safeguard: prevent duplicate codes (case-insensitive, trimmed)
    const normalizedCode = warehouseData.code.trim().toUpperCase();
    const exists = warehouses.some(w => w.code.trim().toUpperCase() === normalizedCode);
    if (exists) {
      throw new Error(`Warehouse code "${warehouseData.code}" already exists`);
    }

    const newWarehouse: Warehouse = {
      ...warehouseData,
      code: warehouseData.code.trim(),
      id: `wh-${Date.now()}`,
      racks: [],
    };
    setWarehouses(prev => [...prev, newWarehouse]);
    return newWarehouse;
  }, [warehouses]);

  const updateWarehouse = useCallback((id: string, updates: Partial<Pick<Warehouse, 'name' | 'address'>>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  // Stock Locations
  const getStockByProduct = useCallback((productId: string) => {
    return stockLocations.filter(sl => sl.productId === productId);
  }, [stockLocations]);

  const getTotalStock = useCallback((productId: string) => {
    return stockLocations
      .filter(sl => sl.productId === productId)
      .reduce((sum, sl) => sum + sl.quantity, 0);
  }, [stockLocations]);

  const getStockByProductAndWarehouse = useCallback((productId: string, warehouseId: string) => {
    const location = stockLocations.find(
      sl => sl.productId === productId && sl.warehouseId === warehouseId
    );
    return location ? location.quantity : 0;
  }, [stockLocations]);

  const checkStockAvailability = useCallback((productId: string, warehouseId: string, quantity: number) => {
    const availableStock = getStockByProductAndWarehouse(productId, warehouseId);
    return availableStock >= quantity;
  }, [getStockByProductAndWarehouse]);

  const updateStock = useCallback((productId: string, warehouseId: string, quantityChange: number) => {
    setStockLocations(prev => {
      const existing = prev.find(sl => sl.productId === productId && sl.warehouseId === warehouseId);
      if (existing) {
        const newQuantity = existing.quantity + quantityChange;
        // Prevent negative stock
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock. Available: ${existing.quantity}, Requested: ${Math.abs(quantityChange)}`);
        }
        return prev.map(sl => 
          sl.productId === productId && sl.warehouseId === warehouseId
            ? { ...sl, quantity: newQuantity }
            : sl
        );
      } else {
        // Prevent negative stock for new locations
        if (quantityChange < 0) {
          throw new Error(`Insufficient stock. Available: 0, Requested: ${Math.abs(quantityChange)}`);
        }
        return [...prev, { productId, warehouseId, quantity: quantityChange }];
      }
    });
  }, []);

  // Receipts
  const addReceipt = useCallback((receiptData: Omit<Receipt, 'id' | 'createdAt'>) => {
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      createdAt: new Date(),
    };
    setReceipts(prev => [...prev, newReceipt]);
    return newReceipt;
  }, []);

  const validateReceipt = useCallback((id: string) => {
    const receipt = receipts.find(r => r.id === id);
    if (!receipt) return;

    // Update receipt status
    setReceipts(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Done', validatedAt: new Date() } : r
    ));

    // Update stock
    receipt.lines.forEach(line => {
      // Get warehouse-specific stock before update
      const previousStock = getStockByProductAndWarehouse(line.productId, receipt.warehouseId);
      
      updateStock(line.productId, receipt.warehouseId, line.quantity);
      
      // Get warehouse-specific stock after update
      const newStock = previousStock + line.quantity;
      
      // Add movement
      addMovement({
        productId: line.productId,
        warehouseId: receipt.warehouseId,
        movementType: 'Receipt',
        documentType: 'Receipt',
        documentId: id,
        documentNumber: receipt.documentNumber,
        quantity: line.quantity,
        previousStock: previousStock,
        newStock: newStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [receipts, updateStock, getStockByProductAndWarehouse, user?.id]);

  const getReceipt = useCallback((id: string) => {
    return receipts.find(r => r.id === id);
  }, [receipts]);

  // Deliveries
  const addDelivery = useCallback((deliveryData: Omit<Delivery, 'id' | 'createdAt'>) => {
    const newDelivery: Delivery = {
      ...deliveryData,
      id: `del-${Date.now()}`,
      createdAt: new Date(),
    };
    setDeliveries(prev => [...prev, newDelivery]);
    return newDelivery;
  }, []);

  const validateDelivery = useCallback((id: string) => {
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) return;

    // Check stock availability before validation
    for (const line of delivery.lines) {
      const availableStock = getStockByProductAndWarehouse(line.productId, delivery.warehouseId);
      if (availableStock < line.quantity) {
        throw new Error(`Insufficient stock for product. Available: ${availableStock}, Required: ${line.quantity}`);
      }
    }

    // Update delivery status
    setDeliveries(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'Done', validatedAt: new Date() } : d
    ));

    // Update stock
    delivery.lines.forEach(line => {
      // Get warehouse-specific stock before update
      const previousStock = getStockByProductAndWarehouse(line.productId, delivery.warehouseId);
      
      updateStock(line.productId, delivery.warehouseId, -line.quantity);
      
      // Get warehouse-specific stock after update
      const newStock = previousStock - line.quantity;
      
      // Add movement
      addMovement({
        productId: line.productId,
        warehouseId: delivery.warehouseId,
        movementType: 'Delivery',
        documentType: 'Delivery',
        documentId: id,
        documentNumber: delivery.documentNumber,
        quantity: -line.quantity,
        previousStock: previousStock,
        newStock: newStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [deliveries, updateStock, getStockByProductAndWarehouse, user?.id]);

  const getDelivery = useCallback((id: string) => {
    return deliveries.find(d => d.id === id);
  }, [deliveries]);

  // Transfers
  const addTransfer = useCallback((transferData: Omit<InternalTransfer, 'id' | 'createdAt'>) => {
    const newTransfer: InternalTransfer = {
      ...transferData,
      id: `trans-${Date.now()}`,
      createdAt: new Date(),
    };
    setTransfers(prev => [...prev, newTransfer]);
    return newTransfer;
  }, []);

  const validateTransfer = useCallback((id: string) => {
    const transfer = transfers.find(t => t.id === id);
    if (!transfer) return;

    // Check stock availability in source warehouse before validation
    for (const line of transfer.lines) {
      const availableStock = getStockByProductAndWarehouse(line.productId, transfer.sourceWarehouseId);
      if (availableStock < line.quantity) {
        throw new Error(`Insufficient stock in source warehouse. Available: ${availableStock}, Required: ${line.quantity}`);
      }
    }

    // Update transfer status
    setTransfers(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'Done', validatedAt: new Date() } : t
    ));

    // Update stock
    transfer.lines.forEach(line => {
      // Get warehouse-specific stock before update
      const sourcePreviousStock = getStockByProductAndWarehouse(line.productId, transfer.sourceWarehouseId);
      const destPreviousStock = getStockByProductAndWarehouse(line.productId, transfer.destinationWarehouseId);
      
      // Remove from source
      updateStock(line.productId, transfer.sourceWarehouseId, -line.quantity);
      
      // Add to destination
      updateStock(line.productId, transfer.destinationWarehouseId, line.quantity);
      
      // Calculate new stock after updates
      const sourceNewStock = sourcePreviousStock - line.quantity;
      const destNewStock = destPreviousStock + line.quantity;
      
      // Add movements
      addMovement({
        productId: line.productId,
        warehouseId: transfer.sourceWarehouseId,
        movementType: 'Transfer Out',
        documentType: 'Internal',
        documentId: id,
        documentNumber: transfer.documentNumber,
        quantity: -line.quantity,
        previousStock: sourcePreviousStock,
        newStock: sourceNewStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
      
      addMovement({
        productId: line.productId,
        warehouseId: transfer.destinationWarehouseId,
        movementType: 'Transfer In',
        documentType: 'Internal',
        documentId: id,
        documentNumber: transfer.documentNumber,
        quantity: line.quantity,
        previousStock: destPreviousStock,
        newStock: destNewStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [transfers, updateStock, getStockByProductAndWarehouse, user?.id]);

  const getTransfer = useCallback((id: string) => {
    return transfers.find(t => t.id === id);
  }, [transfers]);

  // Adjustments
  const addAdjustment = useCallback((adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt'>) => {
    const newAdjustment: StockAdjustment = {
      ...adjustmentData,
      id: `adj-${Date.now()}`,
      createdAt: new Date(),
    };
    setAdjustments(prev => [...prev, newAdjustment]);
    return newAdjustment;
  }, []);

  const validateAdjustment = useCallback((id: string) => {
    const adjustment = adjustments.find(a => a.id === id);
    if (!adjustment) return;

    // Check stock availability for negative adjustments
    for (const line of adjustment.lines) {
      if (line.difference < 0) {
        const availableStock = getStockByProductAndWarehouse(line.productId, adjustment.warehouseId);
        const requiredStock = Math.abs(line.difference);
        if (availableStock < requiredStock) {
          throw new Error(`Insufficient stock for adjustment. Available: ${availableStock}, Required: ${requiredStock}`);
        }
      }
    }

    // Update adjustment status
    setAdjustments(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'Done', validatedAt: new Date() } : a
    ));

    // Update stock
    adjustment.lines.forEach((line: AdjustmentLine) => {
      // Get warehouse-specific stock before update
      const previousStock = getStockByProductAndWarehouse(line.productId, adjustment.warehouseId);
      
      updateStock(line.productId, adjustment.warehouseId, line.difference);
      
      // Get warehouse-specific stock after update
      const newStock = previousStock + line.difference;
      
      // Add movement
      addMovement({
        productId: line.productId,
        warehouseId: adjustment.warehouseId,
        movementType: 'Adjustment',
        documentType: 'Adjustment',
        documentId: id,
        documentNumber: adjustment.documentNumber,
        quantity: line.difference,
        previousStock: previousStock,
        newStock: newStock,
        timestamp: new Date(),
        userId: user?.id || 'unknown',
      });
    });
  }, [adjustments, updateStock, getStockByProductAndWarehouse, user?.id]);

  const getAdjustment = useCallback((id: string) => {
    return adjustments.find(a => a.id === id);
  }, [adjustments]);

  // Movements
  const addMovement = useCallback((movementData: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `mov-${Date.now()}`,
    };
    setMovements(prev => [...prev, newMovement]);
  }, []);

  const value: InventoryContextType = {
    products,
    addProduct,
    updateProduct,
    getProduct,
    warehouses,
    addWarehouse,
    updateWarehouse,
    stockLocations,
    getStockByProduct,
    getTotalStock,
    getStockByProductAndWarehouse,
    updateStock,
    checkStockAvailability,
    receipts,
    addReceipt,
    validateReceipt,
    getReceipt,
    deliveries,
    addDelivery,
    validateDelivery,
    getDelivery,
    transfers,
    addTransfer,
    validateTransfer,
    getTransfer,
    adjustments,
    addAdjustment,
    validateAdjustment,
    getAdjustment,
    movements,
    addMovement,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}