import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ArrowRightLeft } from 'lucide-react';
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

export function TransferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTransfer, validateTransfer, warehouses, products } = useInventory();

  const transfer = getTransfer(id!);

  if (!transfer) {
    return (
      <div>
        <Header title="Transfer Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowRightLeft className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Transfer not found</p>
              <Button onClick={() => navigate('/transfers')}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Transfers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sourceWarehouse = warehouses.find(w => w.id === transfer.sourceWarehouseId);
  const destWarehouse = warehouses.find(w => w.id === transfer.destinationWarehouseId);
  const canValidate = transfer.status === 'Draft' || transfer.status === 'Waiting';

  const handleValidate = () => {
    try {
      validateTransfer(transfer.id);
      
      const totalItems = transfer.lines.reduce((sum, line) => sum + line.quantity, 0);
      
      toast.success('Transfer validated successfully!', {
        description: `${totalItems} units transferred from ${sourceWarehouse?.name} to ${destWarehouse?.name}. Movement recorded in ledger.`,
      });

      // Redirect after short delay
      setTimeout(() => navigate('/transfers'), 1500);
    } catch (error) {
      toast.error('Validation failed', {
        description: error instanceof Error ? error.message : 'Insufficient stock in source warehouse',
      });
    }
  };

  return (
    <div>
      <Header title="Transfer Details" />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/transfers')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Transfers
          </Button>
          
          {canValidate && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Check className="mr-2 size-4" />
                  Validate Transfer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Validate Transfer</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will move stock from {sourceWarehouse?.name} to {destWarehouse?.name} and mark the transfer as Done. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleValidate}>
                    Validate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Transfer Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{transfer.documentNumber}</CardTitle>
                <CardDescription>Transfer Information</CardDescription>
              </div>
              <StatusChip status={transfer.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Source Warehouse</p>
                <p className="mt-1">{sourceWarehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination Warehouse</p>
                <p className="mt-1">{destWarehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="mt-1">{transfer.createdAt.toLocaleDateString()}</p>
              </div>
              {transfer.validatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Validated Date</p>
                  <p className="mt-1">{transfer.validatedAt.toLocaleDateString()}</p>
                </div>
              )}
              {transfer.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{transfer.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>{transfer.lines.length} item(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left">Product</th>
                    <th className="pb-3 text-left">SKU</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {transfer.lines.map((line) => {
                    const product = products.find(p => p.id === line.productId);
                    
                    return (
                      <tr key={line.id} className="border-b">
                        <td className="py-3">{product?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{product?.sku}</td>
                        <td className="py-3 text-right">{line.quantity}</td>
                        <td className="py-3 text-right text-sm text-muted-foreground">{product?.uom}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td className="pt-3" colSpan={2}></td>
                    <td className="pt-3 text-right">
                      <span className="text-sm text-muted-foreground mr-2">Total:</span>
                      {transfer.lines.reduce((sum, line) => sum + line.quantity, 0)}
                    </td>
                    <td className="pt-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

