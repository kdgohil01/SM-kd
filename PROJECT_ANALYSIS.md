# Project Analysis - Logical and Functional Issues

## Critical Stock Management Issues

### 1. **Incorrect Stock Calculation in Movement Tracking**
**Location:** `src/contexts/InventoryContext.tsx`

**Issue:** All validation functions (`validateReceipt`, `validateDelivery`, `validateTransfer`, `validateAdjustment`) use `getTotalStock()` which returns stock across ALL warehouses, but then use this value to calculate warehouse-specific `previousStock` and `newStock` in movements.

**Impact:** Stock movement history will show incorrect stock levels. The `previousStock` and `newStock` values in movements will be wrong because they're using total stock instead of warehouse-specific stock.

**Example in `validateReceipt` (lines 167-180):**
```typescript
const currentStock = getTotalStock(line.productId); // Gets total across ALL warehouses
addMovement({
  // ...
  previousStock: currentStock - line.quantity, // WRONG: should be warehouse-specific
  newStock: currentStock, // WRONG: should be warehouse-specific
});
```

**Fix Required:** Need to get warehouse-specific stock before and after the update.

---

### 2. **Missing Stock Availability Validation**
**Location:** `src/screens/deliveries/CreateDelivery.tsx`, `src/screens/transfers/CreateTransfer.tsx`

**Issue:** No validation to check if sufficient stock exists before creating deliveries or transfers. Users can create documents that would result in negative stock.

**Impact:** 
- Deliveries can be created even when stock is insufficient
- Transfers can be created from warehouses with insufficient stock
- No warning to users about stock availability

**Fix Required:** Add stock validation before allowing document creation.

---

### 3. **No Prevention of Negative Stock**
**Location:** `src/contexts/InventoryContext.tsx` - `validateDelivery`, `validateTransfer`

**Issue:** The `updateStock` function allows negative quantities. When validating deliveries or transfers, there's no check to ensure stock doesn't go negative.

**Impact:** Stock levels can become negative, which is logically incorrect for inventory management.

**Fix Required:** Add validation in `updateStock` or before calling it to prevent negative stock.

---

## Missing Routes and Pages

### 4. **Missing Transfer Detail Page**
**Location:** `src/App.tsx`, `src/screens/transfers/`

**Issue:** 
- Route for `/transfers/:id` is missing
- No `TransferDetail.tsx` component exists
- Transfer list doesn't have "View" buttons to navigate to details

**Impact:** Users cannot view transfer details or validate transfers from the UI.

---

### 5. **Missing Adjustment Create and Detail Pages**
**Location:** `src/App.tsx`, `src/screens/adjustments/`

**Issue:**
- Route for `/adjustments/create` is missing (referenced in `AdjustmentList.tsx` line 18)
- Route for `/adjustments/:id` is missing
- No `CreateAdjustment.tsx` component exists
- No `AdjustmentDetail.tsx` component exists
- Adjustment list doesn't have "View" buttons

**Impact:** Users cannot create adjustments or view adjustment details from the UI.

---

### 6. **Missing Transfer Validation UI**
**Location:** `src/screens/transfers/TransferList.tsx`, `src/screens/transfers/TransferDetail.tsx` (doesn't exist)

**Issue:** No UI to validate transfers. The `validateTransfer` function exists in context but cannot be called from the UI.

**Impact:** Transfers cannot be validated, so stock is never updated for transfers.

---

### 7. **Missing Adjustment Validation UI**
**Location:** `src/screens/adjustments/AdjustmentList.tsx`, `src/screens/adjustments/AdjustmentDetail.tsx` (doesn't exist)

**Issue:** No UI to validate adjustments. The `validateAdjustment` function exists in context but cannot be called from the UI.

**Impact:** Adjustments cannot be validated, so stock adjustments are never applied.

---

## Logic Errors in Validation Functions

### 8. **Incorrect Delivery Validation Status Check**
**Location:** `src/screens/deliveries/DeliveryDetail.tsx` line 49

**Issue:** 
```typescript
const canValidate = delivery.status === 'Ready';
```

But receipts allow validation for 'Draft' or 'Waiting' status (line 49 in `ReceiptDetail.tsx`). This inconsistency means deliveries in 'Draft' or 'Waiting' status cannot be validated.

**Impact:** Deliveries must be manually changed to 'Ready' status before validation, but there's no UI to change status.

---

### 9. **Missing Dependency in useCallback**
**Location:** `src/contexts/InventoryContext.tsx`

**Issue:** 
- `validateTransfer` (line 245) and `validateAdjustment` (line 309) are missing `addMovement` in their dependency arrays, but they call `addMovement`.

**Impact:** Could cause stale closure issues, though it works because `addMovement` is stable. Still, it's a React best practice violation.

---

### 10. **Transfer Stock Calculation Logic Error**
**Location:** `src/contexts/InventoryContext.tsx` - `validateTransfer` (lines 263-290)

**Issue:** When calculating movements for transfers:
- For source warehouse: Uses `getTotalStock` (total across all warehouses) instead of source warehouse stock
- For destination warehouse: Uses `getTotalStock` instead of destination warehouse stock
- The `previousStock` and `newStock` values are incorrect for both warehouses

**Impact:** Transfer movements show incorrect stock levels in the ledger.

---

### 11. **Adjustment Stock Calculation Logic Error**
**Location:** `src/contexts/InventoryContext.tsx` - `validateAdjustment` (lines 323-336)

**Issue:** Similar to other validations, uses `getTotalStock` instead of warehouse-specific stock when calculating movement history.

**Impact:** Adjustment movements show incorrect stock levels.

---

### 26. **Missing Warehouse-Specific Stock Getter**
**Location:** `src/contexts/InventoryContext.tsx`

**Issue:** There's no function to get stock for a specific product in a specific warehouse. The context only provides:
- `getStockByProduct(productId)` - returns all stock locations for a product across all warehouses
- `getTotalStock(productId)` - returns total stock across all warehouses

But there's no `getStockByProductAndWarehouse(productId, warehouseId)` function.

**Impact:** This makes it difficult to:
- Validate stock availability for a specific warehouse
- Display warehouse-specific stock in forms
- Calculate correct previous/new stock in movements

**Fix Required:** Add a helper function to get stock for a product in a specific warehouse.

---

## Dashboard Issues

### 12. **Unused Filters in Dashboard**
**Location:** `src/screens/Dashboard.tsx`

**Issue:** 
- `warehouseFilter` (line 18) and `categoryFilter` (line 19) are defined but never used in any calculations
- Filters are displayed in UI but don't actually filter the data

**Impact:** Users can select filters but they have no effect on the displayed data.

---

### 13. **Document Type Filter Mismatch**
**Location:** `src/screens/Dashboard.tsx` lines 89-93

**Issue:** The filter compares `doc.type` (which is 'Receipt', 'Delivery', 'Transfer') with `documentTypeFilter` (which expects 'Receipt', 'Delivery', 'Internal', 'Adjustment'). The type 'Transfer' doesn't match 'Internal'.

**Impact:** Transfer documents won't show up when filtering by 'Internal' type.

---

## Data Consistency Issues

### 14. **Missing Stock Location Creation**
**Location:** `src/contexts/InventoryContext.tsx` - `updateStock` (lines 127-140)

**Issue:** When `updateStock` is called with a new product-warehouse combination, it creates a new `StockLocation` entry. However, when creating a product with initial stock in `AddProduct.tsx`, if the stock location doesn't exist, it will be created. But there's no validation that the warehouse exists or that the location structure (rack/section/bin) is valid.

**Impact:** Stock locations can be created without proper warehouse structure validation.

---

### 15. **Hardcoded User ID in Movements**
**Location:** `src/contexts/InventoryContext.tsx` - All validation functions

**Issue:** All movement records use hardcoded `userId: 'user-1'` instead of getting the actual logged-in user from AuthContext.

**Impact:** Movement history doesn't track which user actually performed the action.

**Fix Required:** Import `useAuth` and use `user?.id` instead of hardcoded value.

---

## UI/UX Issues

### 16. **Missing View Buttons in Transfer List**
**Location:** `src/screens/transfers/TransferList.tsx`

**Issue:** The transfer list table doesn't have an "Actions" column with "View" buttons, unlike ReceiptList and DeliveryList.

**Impact:** Users cannot navigate to transfer details (even if the page existed).

---

### 17. **Missing View Buttons in Adjustment List**
**Location:** `src/screens/adjustments/AdjustmentList.tsx`

**Issue:** The adjustment list table doesn't have an "Actions" column with "View" buttons.

**Impact:** Users cannot navigate to adjustment details (even if the page existed).

---

### 18. **No Stock Availability Display in Create Forms**
**Location:** `src/screens/deliveries/CreateDelivery.tsx`, `src/screens/transfers/CreateTransfer.tsx`

**Issue:** When selecting products in delivery or transfer creation forms, there's no display of available stock for the selected warehouse.

**Impact:** Users don't know how much stock is available when creating documents.

---

### 19. **Missing Warehouse Filter in Dashboard Document Stats**
**Location:** `src/screens/Dashboard.tsx` - `documentStats` calculation (lines 82-111)

**Issue:** The `warehouseFilter` is defined but not used when filtering documents for the status distribution chart.

**Impact:** Warehouse filter doesn't affect the document status chart.

---

## Type Safety Issues

### 20. **Missing Routes for Transfer Create and Detail**
**Location:** `src/App.tsx`

**Issue:** 
- The route `/transfers/create` is referenced in `TransferList.tsx` (line 18) but doesn't exist in `App.tsx`
- The route `/transfers/:id` for transfer details is missing
- The `CreateTransfer.tsx` component exists but has no route defined

**Impact:** Clicking "Create Transfer" button will result in a 404 error. Users cannot view transfer details.

---

### 21. **Incorrect Import Path for Toast**
**Location:** Multiple files

**Issue:** Using `import { toast } from 'sonner@2.0.3';` instead of `import { toast } from 'sonner';`

**Impact:** This is a workaround for the vite alias configuration, but it's not standard and could break if dependencies change.

---

## Functional Gaps

### 22. **No Status Transition Workflow**
**Location:** Throughout the application

**Issue:** Documents can only be validated, but there's no way to:
- Change status from 'Draft' to 'Waiting' to 'Ready'
- Cancel documents
- No status workflow management

**Impact:** Users cannot properly manage document lifecycle.

---

### 23. **No Duplicate SKU Validation**
**Location:** `src/screens/products/AddProduct.tsx`

**Issue:** When adding a product, there's no check to ensure the SKU is unique.

**Impact:** Multiple products can have the same SKU, causing confusion.

---

### 24. **No Stock Location Selection in Document Creation**
**Location:** `src/screens/receipts/CreateReceipt.tsx`, `src/screens/deliveries/CreateDelivery.tsx`

**Issue:** When creating receipts or deliveries, users cannot specify rack/section/bin locations. The `DocumentLine` type has an optional `locationId` field, but it's never used in the UI.

**Impact:** Stock location tracking (rack/section/bin) is not utilized even though the data model supports it.

---

### 25. **Missing Stock Availability Check Before Validation**
**Location:** `src/contexts/InventoryContext.tsx` - `validateDelivery`, `validateTransfer`

**Issue:** Before validating a delivery or transfer, there's no check to ensure sufficient stock exists. The validation will proceed even if it would result in negative stock.

**Impact:** Stock can become negative after validation.

---

## Summary

**Critical Issues (Must Fix):**
1. Incorrect stock calculations in all validation functions
2. Missing stock availability validation
3. Missing routes for transfers and adjustments
4. No prevention of negative stock
5. Hardcoded user ID in movements

**High Priority Issues:**
6. Missing UI for transfer and adjustment validation
7. Incorrect delivery validation status check
8. Unused dashboard filters
9. Missing view buttons in transfer and adjustment lists

**Medium Priority Issues:**
10. Missing stock availability display in forms
11. No duplicate SKU validation
12. No status workflow management
13. Missing stock location selection in document creation

**Low Priority Issues:**
14. Incorrect import paths for toast
15. Missing dependency in useCallback (works but not best practice)

