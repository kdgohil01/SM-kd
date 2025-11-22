import { useState, useMemo } from 'react';
import { Header } from '../../components/layout/Header';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, History } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

export function LedgerList() {
  const { movements, products, warehouses } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('All');

  const filteredMovements = useMemo(() => {
    return movements.filter(mov => {
      const product = products.find(p => p.id === mov.productId);
      const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mov.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesWarehouse = warehouseFilter === 'All' || mov.warehouseId === warehouseFilter;
      
      return matchesSearch && matchesWarehouse;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [movements, searchTerm, warehouseFilter, products]);

  return (
    <div>
      <Header title="Move History (Stock Ledger)" />
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product or document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-64">
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Warehouses</SelectItem>
                {warehouses.map(wh => (
                  <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredMovements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No movements found</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="p-4 text-left">Date & Time</th>
                      <th className="p-4 text-left">Product</th>
                      <th className="p-4 text-left">Movement Type</th>
                      <th className="p-4 text-left">Document</th>
                      <th className="p-4 text-left">Warehouse</th>
                      <th className="p-4 text-right">Quantity</th>
                      <th className="p-4 text-right">New Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map(mov => {
                      const product = products.find(p => p.id === mov.productId);
                      const warehouse = warehouses.find(w => w.id === mov.warehouseId);
                      return (
                        <tr key={mov.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 text-sm">
                            {mov.timestamp.toLocaleDateString()} {mov.timestamp.toLocaleTimeString()}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm">{product?.name}</p>
                              <p className="text-xs text-muted-foreground">{product?.sku}</p>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{mov.movementType}</td>
                          <td className="p-4 text-sm text-primary">{mov.documentNumber}</td>
                          <td className="p-4 text-sm">{warehouse?.name}</td>
                          <td className={`p-4 text-sm text-right ${mov.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.quantity >= 0 ? '+' : ''}{mov.quantity}
                          </td>
                          <td className="p-4 text-sm text-right">{mov.newStock}</td>
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
