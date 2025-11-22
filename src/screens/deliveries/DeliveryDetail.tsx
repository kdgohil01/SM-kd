import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Truck } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { StatusChip } from '../../components/common/StatusChip';
import { useInventory } from '../../contexts/InventoryContext';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

export function DeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDelivery, validateDelivery, warehouses, products } = useInventory();

  const delivery = getDelivery(id!);

  if (!delivery) {
    return (
      <div>
        <Header title="Delivery Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Delivery order not found</p>
              <Button onClick={() => navigate('/deliveries')}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Deliveries
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const warehouse = warehouses.find(w => w.id === delivery.warehouseId);
  const canValidate = delivery.status === 'Ready';

  const handleValidate = () => {
    validateDelivery(delivery.id);
    toast.success('Delivery completed!', {
      description: 'Inventory has been updated.',
    });
    setTimeout(() => navigate('/deliveries'), 1500);
  };

  return (
    <div>
      <Header title="Delivery Details" />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/deliveries')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Deliveries
          </Button>
          
          {canValidate && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Check className="mr-2 size-4" />
                  Validate Delivery
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Validate Delivery</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will decrease stock levels and mark the delivery as Done. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleValidate}>Validate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{delivery.documentNumber}</CardTitle>
                <CardDescription>Delivery Order Information</CardDescription>
              </div>
              <StatusChip status={delivery.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="mt-1">{delivery.customerName}</p>
              </div>
              {delivery.customerContact && (
                <div>
                  <p className="text-sm text-muted-foreground">Customer Contact</p>
                  <p className="mt-1">{delivery.customerContact}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Warehouse</p>
                <p className="mt-1">{warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="mt-1">{delivery.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>{delivery.lines.length} item(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left">Product</th>
                    <th className="pb-3 text-left">SKU</th>
                    <th className="pb-3 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {delivery.lines.map((line) => {
                    const product = products.find(p => p.id === line.productId);
                    return (
                      <tr key={line.id} className="border-b">
                        <td className="py-3">{product?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{product?.sku}</td>
                        <td className="py-3 text-right">{line.quantity}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
