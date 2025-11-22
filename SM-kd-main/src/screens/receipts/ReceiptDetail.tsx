import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, FileInput } from 'lucide-react';
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

export function ReceiptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReceipt, validateReceipt, warehouses, products } = useInventory();

  const receipt = getReceipt(id!);

  if (!receipt) {
    return (
      <div>
        <Header title="Receipt Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileInput className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Receipt not found</p>
              <Button onClick={() => navigate('/receipts')}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Receipts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const warehouse = warehouses.find(w => w.id === receipt.warehouseId);
  const canValidate = receipt.status === 'Draft' || receipt.status === 'Waiting';

  const handleValidate = () => {
    validateReceipt(receipt.id);
    
    const totalItems = receipt.lines.reduce((sum, line) => sum + line.quantity, 0);
    
    toast.success('Receipt validated successfully!', {
      description: `Stock increased by ${totalItems} units for ${receipt.lines.length} product(s). Movement recorded in ledger.`,
    });

    // Redirect after short delay
    setTimeout(() => navigate('/receipts'), 1500);
  };

  return (
    <div>
      <Header title="Receipt Details" />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/receipts')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Receipts
          </Button>
          
          {canValidate && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Check className="mr-2 size-4" />
                  Validate Receipt
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Validate Receipt</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will increase stock levels for all items in this receipt and mark it as Done. This action cannot be undone.
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

        {/* Receipt Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{receipt.documentNumber}</CardTitle>
                <CardDescription>Receipt Information</CardDescription>
              </div>
              <StatusChip status={receipt.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Vendor Name</p>
                <p className="mt-1">{receipt.vendorName}</p>
              </div>
              {receipt.vendorContact && (
                <div>
                  <p className="text-sm text-muted-foreground">Vendor Contact</p>
                  <p className="mt-1">{receipt.vendorContact}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Warehouse</p>
                <p className="mt-1">{warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="mt-1">{receipt.createdAt.toLocaleDateString()}</p>
              </div>
              {receipt.validatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Validated Date</p>
                  <p className="mt-1">{receipt.validatedAt.toLocaleDateString()}</p>
                </div>
              )}
              {receipt.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{receipt.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>{receipt.lines.length} item(s)</CardDescription>
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
                  {receipt.lines.map((line) => {
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
                      {receipt.lines.reduce((sum, line) => sum + line.quantity, 0)}
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
