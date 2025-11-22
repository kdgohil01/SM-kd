import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  XCircle, 
  Package, 
  FileInput, 
  Truck, 
  ArrowRightLeft,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useInventory } from '../../contexts/InventoryContext';
import { StatusChip } from '../../components/common/StatusChip';

export type NotificationType = 
  | 'out_of_stock' 
  | 'low_stock' 
  | 'pending_receipt' 
  | 'pending_delivery' 
  | 'pending_transfer'
  | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: Date;
  link?: string;
  productId?: string;
  documentId?: string;
}

export function Notifications() {
  const { products, stockLocations, receipts, deliveries, transfers, warehouses, getTotalStock } = useInventory();

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];

    // Check for out of stock products
    products.forEach(product => {
      const totalStock = getTotalStock(product.id);
      if (totalStock === 0) {
        notifs.push({
          id: `out-${product.id}`,
          type: 'out_of_stock',
          title: 'Out of Stock',
          message: `${product.name} (${product.sku}) is out of stock`,
          severity: 'error',
          timestamp: new Date(),
          link: `/products/${product.id}`,
          productId: product.id,
        });
      } else if (totalStock < product.reorderLevel && product.reorderLevel > 0) {
        notifs.push({
          id: `low-${product.id}`,
          type: 'low_stock',
          title: 'Low Stock Warning',
          message: `${product.name} (${product.sku}) is below reorder level. Current: ${totalStock}, Reorder: ${product.reorderLevel}`,
          severity: 'warning',
          timestamp: new Date(),
          link: `/products/${product.id}`,
          productId: product.id,
        });
      }
    });

    // Check for pending receipts
    receipts
      .filter(r => r.status === 'Draft' || r.status === 'Waiting')
      .forEach(receipt => {
        notifs.push({
          id: `rec-${receipt.id}`,
          type: 'pending_receipt',
          title: 'Pending Receipt',
          message: `Receipt ${receipt.documentNumber} from ${receipt.vendorName} is pending validation`,
          severity: 'info',
          timestamp: receipt.createdAt,
          link: `/receipts/${receipt.id}`,
          documentId: receipt.id,
        });
      });

    // Check for pending deliveries
    deliveries
      .filter(d => d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready')
      .forEach(delivery => {
        notifs.push({
          id: `del-${delivery.id}`,
          type: 'pending_delivery',
          title: 'Pending Delivery',
          message: `Delivery ${delivery.documentNumber} to ${delivery.customerName} is pending validation`,
          severity: 'info',
          timestamp: delivery.createdAt,
          link: `/deliveries/${delivery.id}`,
          documentId: delivery.id,
        });
      });

    // Check for pending transfers
    transfers
      .filter(t => t.status === 'Draft' || t.status === 'Waiting')
      .forEach(transfer => {
        const source = warehouses.find(w => w.id === transfer.sourceWarehouseId);
        const dest = warehouses.find(w => w.id === transfer.destinationWarehouseId);
        notifs.push({
          id: `trans-${transfer.id}`,
          type: 'pending_transfer',
          title: 'Pending Transfer',
          message: `Transfer ${transfer.documentNumber} from ${source?.name} to ${dest?.name} is pending validation`,
          severity: 'info',
          timestamp: transfer.createdAt,
          link: `/transfers/${transfer.id}`,
          documentId: transfer.id,
        });
      });

    // Sort by timestamp (newest first)
    return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [products, stockLocations, receipts, deliveries, transfers, warehouses, getTotalStock]);

  const notificationsByType = useMemo(() => {
    return {
      errors: notifications.filter(n => n.severity === 'error'),
      warnings: notifications.filter(n => n.severity === 'warning'),
      info: notifications.filter(n => n.severity === 'info'),
    };
  }, [notifications]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'out_of_stock':
        return <XCircle className="size-5 text-red-500" />;
      case 'low_stock':
        return <AlertTriangle className="size-5 text-yellow-500" />;
      case 'pending_receipt':
        return <FileInput className="size-5 text-blue-500" />;
      case 'pending_delivery':
        return <Truck className="size-5 text-blue-500" />;
      case 'pending_transfer':
        return <ArrowRightLeft className="size-5 text-blue-500" />;
      default:
        return <Info className="size-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: Notification['severity']) => {
    switch (severity) {
      case 'error':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">Warning</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div>
      <Header title="Notifications" />
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{notificationsByType.errors.length}</p>
                </div>
                <XCircle className="size-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{notificationsByType.warnings.length}</p>
                </div>
                <AlertTriangle className="size-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Items</p>
                  <p className="text-2xl font-bold text-blue-600">{notificationsByType.info.length}</p>
                </div>
                <Info className="size-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="size-12 text-green-500 mb-4" />
              <p className="text-muted-foreground mb-2">All clear!</p>
              <p className="text-sm text-muted-foreground">No notifications at this time</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Critical Alerts */}
            {notificationsByType.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Critical Alerts</CardTitle>
                  <CardDescription>Items requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notificationsByType.errors.map(notif => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        getIcon={getIcon}
                        getSeverityBadge={getSeverityBadge}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {notificationsByType.warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Warnings</CardTitle>
                  <CardDescription>Items that need attention soon</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notificationsByType.warnings.map(notif => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        getIcon={getIcon}
                        getSeverityBadge={getSeverityBadge}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Notifications */}
            {notificationsByType.info.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Items</CardTitle>
                  <CardDescription>Documents awaiting validation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notificationsByType.info.map(notif => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        getIcon={getIcon}
                        getSeverityBadge={getSeverityBadge}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  getIcon,
  getSeverityBadge,
}: {
  notification: Notification;
  getIcon: (type: NotificationType) => React.ReactNode;
  getSeverityBadge: (severity: Notification['severity']) => React.ReactNode;
}) {
  const content = (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
      notification.severity === 'error' 
        ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900' 
        : notification.severity === 'warning'
        ? 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900'
        : 'border-border bg-card hover:bg-accent'
    }`}>
      <div className="mt-0.5">
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          {getSeverityBadge(notification.severity)}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link to={notification.link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

