import { useState } from 'react'
import { 
  CheckSquare, Truck, ChefHat, Bell, 
  AlertTriangle, FileSpreadsheet, Printer,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import ConfirmDialog from './ConfirmDialog'
import { supabase, Order, OrderItem } from '@/lib/supabase'
import { formatCurrency, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderWithDetails extends Order {
  tables?: { table_number: number } | null
  order_items?: (OrderItem & {
    menu_items?: { name: string; image_url: string | null } | null
  })[]
}

interface BatchOperationsProps {
  restaurantId: string
  orders: OrderWithDetails[]
  onOrdersUpdated: () => void
}

export default function BatchOperations({ orders, onOrdersUpdated }: BatchOperationsProps) {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updating, setUpdating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    action: string
    status?: string
    count: number
  } | null>(null)

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const selectAllVisible = () => {
    const visibleOrderIds = filteredOrders.map(o => o.id)
    setSelectedOrders(new Set(visibleOrderIds))
  }

  const deselectAll = () => {
    setSelectedOrders(new Set())
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default">New</Badge>
      case 'preparing':
        return <Badge variant="secondary">Preparing</Badge>
      case 'ready':
        return <Badge className="bg-blue-500">Ready</Badge>
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleBatchUpdate = async (newStatus: string) => {
    if (selectedOrders.size === 0) {
      toast.error('No orders selected')
      return
    }

    setUpdating(true)
    try {
      const orderIds = Array.from(selectedOrders)
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .in('id', orderIds)

      if (error) throw error

      toast.success(`Updated ${orderIds.length} order(s) to ${newStatus}`)
      setSelectedOrders(new Set())
      onOrdersUpdated()
    } catch (error: any) {
      console.error('Failed to update orders:', error)
      toast.error(error.message || 'Failed to update orders')
    } finally {
      setUpdating(false)
      setShowConfirmDialog(false)
      setConfirmAction(null)
    }
  }

  const confirmBatchAction = (action: string, status: string) => {
    setConfirmAction({
      action,
      status,
      count: selectedOrders.size
    })
    setShowConfirmDialog(true)
  }

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No orders to export')
      return
    }

    const headers = ['Order #', 'Table', 'Status', 'Total', 'Created At', 'Items']
    const rows = filteredOrders.map(order => {
      const items = order.order_items?.map(item => 
        `${item.quantity}x ${item.menu_items?.name || 'Unknown'}`
      ).join('; ') || ''

      return [
        order.order_number,
        `Table ${order.tables?.table_number || 'N/A'}`,
        order.status,
        order.total.toFixed(2),
        new Date(order.created_at).toLocaleString(),
        items
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${filteredOrders.length} order(s) to CSV`)
  }

  const printOrderList = () => {
    // Use selected orders if any, otherwise use filtered orders
    const ordersToPrint = selectedOrders.size > 0 
      ? orders.filter(order => selectedOrders.has(order.id))
      : filteredOrders
    
    if (ordersToPrint.length === 0) {
      toast.error('No orders to print')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orders - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .status-new { color: #3b82f6; }
          .status-preparing { color: #f59e0b; }
          .status-ready { color: #10b981; }
          .status-delivered { color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>Orders Report - ${new Date().toLocaleDateString()}</h1>
        <p>Total Orders: ${ordersToPrint.length}${selectedOrders.size > 0 ? ' (Selected)' : ''}</p>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Table</th>
              <th>Status</th>
              <th>Total</th>
              <th>Time</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            ${ordersToPrint.map(order => `
              <tr>
                <td>${order.order_number}</td>
                <td>Table ${order.tables?.table_number || 'N/A'}</td>
                <td class="status-${order.status}">${order.status.toUpperCase()}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>${new Date(order.created_at).toLocaleString()}</td>
                <td>${order.order_items?.map(item => 
                  `${item.quantity}x ${item.menu_items?.name || 'Unknown'}`
                ).join(', ') || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  const stats = {
    total: filteredOrders.length,
    selected: selectedOrders.size,
    new: filteredOrders.filter(o => o.status === 'new').length,
    preparing: filteredOrders.filter(o => o.status === 'preparing').length,
    ready: filteredOrders.filter(o => o.status === 'ready').length,
  }

  return (
    <div className="space-y-4">
      {/* Stats and Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              {selectedOrders.size > 0 && (
                <div className="bg-primary/10 px-4 py-2 rounded-lg">
                  <p className="text-sm text-primary">Selected</p>
                  <p className="text-2xl font-bold text-primary">{stats.selected}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAllVisible}
                disabled={filteredOrders.length === 0}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={deselectAll}
                disabled={selectedOrders.size === 0}
              >
                Deselect All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportToCSV}
                disabled={filteredOrders.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={printOrderList}
                disabled={filteredOrders.length === 0}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Action Buttons */}
      {selectedOrders.size > 0 && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Batch Actions ({selectedOrders.size} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirmBatchAction('Start Preparing', 'preparing')}
                disabled={updating}
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Start Preparing
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirmBatchAction('Mark Ready', 'ready')}
                disabled={updating}
              >
                <Bell className="w-4 h-4 mr-2" />
                Mark Ready
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => confirmBatchAction('Mark Delivered', 'delivered')}
                disabled={updating}
              >
                <Truck className="w-4 h-4 mr-2" />
                Mark Delivered
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Button
          size="sm"
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
        >
          All ({orders.length})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === 'new' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('new')}
        >
          New ({stats.new})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === 'preparing' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('preparing')}
        >
          Preparing ({stats.preparing})
        </Button>
        <Button
          size="sm"
          variant={filterStatus === 'ready' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('ready')}
        >
          Ready ({stats.ready})
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedOrders.has(order.id)
            
            return (
              <Card 
                key={order.id} 
                className={`cursor-pointer transition-all hover:border-primary ${
                  isSelected ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => toggleOrderSelection(order.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{order.order_number}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Table {order.tables?.table_number || 'N/A'} • 
                          {' '}{formatTime(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.order_items?.length || 0} item(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          setShowConfirmDialog(open)
          if (!open) setConfirmAction(null)
        }}
        title={`Batch Update Orders`}
        description={`Are you sure you want to mark ${confirmAction?.count} order(s) as "${confirmAction?.action}"? This will update all selected orders.`}
        onConfirm={() => confirmAction?.status && handleBatchUpdate(confirmAction.status)}
        confirmText={confirmAction?.action || 'Confirm'}
        loading={updating}
      />
    </div>
  )
}
