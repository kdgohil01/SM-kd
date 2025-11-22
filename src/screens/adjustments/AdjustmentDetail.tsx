import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardList } from 'lucide-react';
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

export function AdjustmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAdjustment, validateAdjustment, warehouses, products } = useInventory();

  const adjustment = getAdjustment(id!);

  if (!adjustment) {
    return (
      <div>
        <Header title="Adjustment Not Found" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Adjustment not found</p>
              <Button onClick={() => navigate('/adjustments')}>
                <ArrowLeft className="mr-2 size-4" />
                Back to Adjustments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const warehouse = warehouses.find(w => w.id === adjustment.warehouseId);
  const canValidate = adjustment.status === 'Draft' || adjustment.status === 'Waiting';

  const handleValidate = () => {
    try {
      validateAdjustment(adjustment.id);
      
      const totalDifference = adjustment.lines.reduce((sum, line) => sum + line.difference, 0);
      
      toast.success('Adjustment validated successfully!', {
        description: `Stock adjusted by ${totalDifference >= 0 ? '+' : ''}${totalDifference} units. Movement recorded in ledger.`,
      });

      // Redirect after short delay
      setTimeout(() => navigate('/adjustments'), 1500);
    } catch (error) {
      toast.error('Validation failed', {
        description: error instanceof Error ? error.message : 'Insufficient stock for adjustment',
      });
    }
  };

  return (
    <div>
      <Header title="Adjustment Details" />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/adjustments')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Adjustments
          </Button>
          
          {canValidate && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  <Check className="mr-2 size-4" />
                  Validate Adjustment
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Validate Adjustment</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will adjust stock levels based on the recorded vs physical quantities and mark this adjustment as Done. This action cannot be undone.
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

        {/* Adjustment Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{adjustment.documentNumber}</CardTitle>
                <CardDescription>Adjustment Information</CardDescription>
              </div>
              <StatusChip status={adjustment.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Warehouse</p>
                <p className="mt-1">{warehouse?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adjustment Type</p>
                <p className="mt-1">{adjustment.adjustmentType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="mt-1">{adjustment.createdAt.toLocaleDateString()}</p>
              </div>
              {adjustment.validatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Validated Date</p>
                  <p className="mt-1">{adjustment.validatedAt.toLocaleDateString()}</p>
                </div>
              )}
              {adjustment.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{adjustment.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>{adjustment.lines.length} item(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-left">Product</th>
                    <th className="pb-3 text-left">SKU</th>
                    <th className="pb-3 text-right">Recorded Qty</th>
                    <th className="pb-3 text-right">Physical Qty</th>
                    <th className="pb-3 text-right">Difference</th>
                    <th className="pb-3 text-right">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustment.lines.map((line) => {
                    const product = products.find(p => p.id === line.productId);
                    
                    return (
                      <tr key={line.id} className="border-b">
                        <td className="py-3">{product?.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{product?.sku}</td>
                        <td className="py-3 text-right">{line.recordedQuantity}</td>
                        <td className="py-3 text-right">{line.physicalQuantity}</td>
                        <td className={`py-3 text-right ${line.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {line.difference >= 0 ? '+' : ''}{line.difference}
                        </td>
                        <td className="py-3 text-right text-sm text-muted-foreground">{product?.uom}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td className="pt-3" colSpan={3}></td>
                    <td className="pt-3 text-right">
                      <span className="text-sm text-muted-foreground mr-2">Total Difference:</span>
                    </td>
                    <td className={`pt-3 text-right ${adjustment.lines.reduce((sum, line) => sum + line.difference, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adjustment.lines.reduce((sum, line) => sum + line.difference, 0) >= 0 ? '+' : ''}
                      {adjustment.lines.reduce((sum, line) => sum + line.difference, 0)}
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

