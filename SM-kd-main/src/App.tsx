import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { Sidebar } from './components/layout/Sidebar';

// Auth screens
import { Login } from './screens/auth/Login';
import { ForgotPassword } from './screens/auth/ForgotPassword';
import { OtpVerify } from './screens/auth/OtpVerify';
import { ResetPassword } from './screens/auth/ResetPassword';

// Main screens
import { Dashboard } from './screens/Dashboard';

// Products
import { ProductList } from './screens/products/ProductList';
import { AddProduct } from './screens/products/AddProduct';
import { ProductDetail } from './screens/products/ProductDetail';

// Receipts
import { ReceiptList } from './screens/receipts/ReceiptList';
import { CreateReceipt } from './screens/receipts/CreateReceipt';
import { ReceiptDetail } from './screens/receipts/ReceiptDetail';

// Deliveries
import { DeliveryList } from './screens/deliveries/DeliveryList';
import { CreateDelivery } from './screens/deliveries/CreateDelivery';
import { DeliveryDetail } from './screens/deliveries/DeliveryDetail';

// Transfers
import { TransferList } from './screens/transfers/TransferList';
import { CreateTransfer } from './screens/transfers/CreateTransfer';
import { TransferDetail } from './screens/transfers/TransferDetail';

// Adjustments
import { AdjustmentList } from './screens/adjustments/AdjustmentList';
import { CreateAdjustment } from './screens/adjustments/CreateAdjustment';
import { AdjustmentDetail } from './screens/adjustments/AdjustmentDetail';

// Ledger
import { LedgerList } from './screens/ledger/LedgerList';

// Settings
import { WarehouseManagement } from './screens/settings/WarehouseManagement';

// Profile
import { UserProfile } from './screens/profile/UserProfile';

// Notifications
import { Notifications } from './screens/notifications/Notifications';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:ml-72">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/signup" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/forgot-password" element={
        <AuthRoute>
          <ForgotPassword />
        </AuthRoute>
      } />
      <Route path="/verify-otp" element={
        <AuthRoute>
          <OtpVerify />
        </AuthRoute>
      } />
      <Route path="/reset-password" element={
        <AuthRoute>
          <ResetPassword />
        </AuthRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Products */}
      <Route path="/products" element={
        <ProtectedRoute>
          <AppLayout>
            <ProductList />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/products/add" element={
        <ProtectedRoute>
          <AppLayout>
            <AddProduct />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/products/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <ProductDetail />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Receipts */}
      <Route path="/receipts" element={
        <ProtectedRoute>
          <AppLayout>
            <ReceiptList />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/receipts/create" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateReceipt />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/receipts/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <ReceiptDetail />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Deliveries */}
      <Route path="/deliveries" element={
        <ProtectedRoute>
          <AppLayout>
            <DeliveryList />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/deliveries/create" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateDelivery />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/deliveries/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <DeliveryDetail />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Transfers */}
      <Route path="/transfers" element={
        <ProtectedRoute>
          <AppLayout>
            <TransferList />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/transfers/create" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateTransfer />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/transfers/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <TransferDetail />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Adjustments */}
      <Route path="/adjustments" element={
        <ProtectedRoute>
          <AppLayout>
            <AdjustmentList />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/adjustments/create" element={
        <ProtectedRoute>
          <AppLayout>
            <CreateAdjustment />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/adjustments/:id" element={
        <ProtectedRoute>
          <AppLayout>
            <AdjustmentDetail />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Ledger */}
      <Route path="/ledger" element={
        <ProtectedRoute>
          <AppLayout>
            <LedgerList />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Settings */}
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <WarehouseManagement />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Profile */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <UserProfile />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Notifications */}
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout>
            <Notifications />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
