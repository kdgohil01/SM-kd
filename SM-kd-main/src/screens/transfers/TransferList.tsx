import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ArrowRightLeft, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../../contexts/InventoryContext';
import { StatusChip } from '../../components/common/StatusChip';

export function TransferList() {
  const { transfers, warehouses } = useInventory();

  return (
    <div>
      <Header title="Internal Transfers" />
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <h2>Transfer List</h2>
          <Link to="/transfers/create">
            <Button>
              <Plus className="mr-2 size-4" />
              Create Transfer
            </Button>
          </Link>
        </div>

        {transfers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowRightLeft className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No transfers found</p>
              <Link to="/transfers/create">
                <Button>
                  <Plus className="mr-2 size-4" />
                  Create Transfer
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
                      <th className="p-4 text-left">From</th>
                      <th className="p-4 text-left">To</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Created</th>
                      <th className="p-4 text-left">Items</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map(transfer => {
                      const source = warehouses.find(w => w.id === transfer.sourceWarehouseId);
                      const dest = warehouses.find(w => w.id === transfer.destinationWarehouseId);
                      return (
                        <tr key={transfer.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 text-primary">{transfer.documentNumber}</td>
                          <td className="p-4 text-sm">{source?.name}</td>
                          <td className="p-4 text-sm">{dest?.name}</td>
                          <td className="p-4"><StatusChip status={transfer.status} /></td>
                          <td className="p-4 text-sm">{transfer.createdAt.toLocaleDateString()}</td>
                          <td className="p-4 text-sm">{transfer.lines.length}</td>
                          <td className="p-4 text-right">
                            <Link to={`/transfers/${transfer.id}`}>
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
