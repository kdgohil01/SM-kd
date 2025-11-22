import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ClipboardList, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../contexts/InventoryContext';
import { StatusChip } from '../../components/common/StatusChip';

export function AdjustmentList() {
  const { adjustments, warehouses } = useInventory();

  return (
    <div>
      <Header title="Inventory Adjustments" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <h2>Adjustment List</h2>
          <Link to="/adjustments/create">
            <Button>
              <Plus className="mr-2 size-4" />
              Create Adjustment
            </Button>
          </Link>
        </div>

        {adjustments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No adjustments found</p>
              <Link to="/adjustments/create">
                <Button>
                  <Plus className="mr-2 size-4" />
                  Create Adjustment
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="p-4 text-left">Document #</th>
                      <th className="p-4 text-left">Type</th>
                      <th className="p-4 text-left">Warehouse</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Created</th>
                      <th className="p-4 text-left">Items</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map(adj => {
                      const warehouse = warehouses.find(w => w.id === adj.warehouseId);
                      return (
                        <tr key={adj.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 text-primary">{adj.documentNumber}</td>
                          <td className="p-4 text-sm">{adj.adjustmentType}</td>
                          <td className="p-4 text-sm">{warehouse?.name}</td>
                          <td className="p-4"><StatusChip status={adj.status} /></td>
                          <td className="p-4 text-sm">{adj.createdAt.toLocaleDateString()}</td>
                          <td className="p-4 text-sm">{adj.lines.length}</td>
                          <td className="p-4 text-right">
                            <Link to={`/adjustments/${adj.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 size-4" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
