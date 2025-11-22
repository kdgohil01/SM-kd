import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Truck, Eye } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { StatusChip } from '../../components/common/StatusChip';
import { useInventory } from '../../contexts/InventoryContext';
import { DocumentStatus } from '../../types';

export function DeliveryList() {
  const { deliveries, warehouses } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'All'>('All');

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      const matchesSearch = 
        delivery.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || delivery.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [deliveries, searchTerm, statusFilter]);

  return (
    <div>
      <Header title="Delivery Orders" />
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by document number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <Link to="/deliveries/create">
            <Button>
              <Plus className="mr-2 size-4" />
              Create Delivery
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm">Status</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DocumentStatus | 'All')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Results</label>
                <div className="flex h-10 items-center rounded-lg border bg-muted px-3">
                  {filteredDeliveries.length} delivery{filteredDeliveries.length !== 1 ? ' orders' : ' order'} found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredDeliveries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No delivery orders found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first delivery order'}
              </p>
              {!searchTerm && (
                <Link to="/deliveries/create">
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Create Delivery
                  </Button>
                </Link>
              )}
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
                      <th className="p-4 text-left">Customer</th>
                      <th className="p-4 text-left">Warehouse</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Created Date</th>
                      <th className="p-4 text-left">Items</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.map((delivery) => {
                      const warehouse = warehouses.find(w => w.id === delivery.warehouseId);
                      
                      return (
                        <tr key={delivery.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <span className="text-primary">{delivery.documentNumber}</span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm">{delivery.customerName}</p>
                              {delivery.customerContact && (
                                <p className="text-xs text-muted-foreground">{delivery.customerContact}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm">{warehouse?.name}</td>
                          <td className="p-4">
                            <StatusChip status={delivery.status} />
                          </td>
                          <td className="p-4 text-sm">{delivery.createdAt.toLocaleDateString()}</td>
                          <td className="p-4 text-sm">{delivery.lines.length}</td>
                          <td className="p-4 text-right">
                            <Link to={`/deliveries/${delivery.id}`}>
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
