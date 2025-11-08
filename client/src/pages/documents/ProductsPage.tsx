import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Package } from "lucide-react"
import { productsApi } from "@/lib/api"

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    salesPrice: "",
    salesTaxes: "",
    cost: "",
    forSales: true,
    forPurchase: false,
    forExpenses: false,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await productsApi.getAll()
      console.log('Products - Raw API response:', response)
      
      if (response.error) throw new Error(response.error)
      
      let productsData: any[] = []
      if (response.data?.data?.products && Array.isArray(response.data.data.products)) {
        productsData = response.data.data.products
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        productsData = response.data.products
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      }
      
      console.log('Products - Parsed:', productsData.length)
      setProducts(productsData)
    } catch (err: any) {
      console.error('Products - Failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Product name is required')
      return
    }

    const payload = {
      name: formData.name,
      salesPrice: formData.salesPrice ? Number(formData.salesPrice) : undefined,
      salesTaxes: formData.salesTaxes ? Number(formData.salesTaxes) : undefined,
      cost: formData.cost ? Number(formData.cost) : undefined,
      canBeSold: formData.forSales,
      canBePurchased: formData.forPurchase,
      canBeExpensed: formData.forExpenses,
    }

    setCreateLoading(true)
    try {
      const response = await productsApi.create(payload)
      if (response.error) throw new Error(response.error)
      setIsDialogOpen(false)
      resetForm()
      fetchProducts()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create product')
    } finally {
      setCreateLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      salesPrice: "",
      salesTaxes: "",
      cost: "",
      forSales: true,
      forPurchase: false,
      forExpenses: false,
    })
    setFormError(null)
  }

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button icon={<Plus className="h-4 w-4" />}>New Product</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create Product</DialogTitle>
                  <DialogDescription>Add a new product to your catalog</DialogDescription>
                </DialogHeader>

                {formError && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Product Type</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sales"
                          checked={formData.forSales}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, forSales: e.target.checked }))
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="sales" className="font-normal">Sales</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="purchase"
                          checked={formData.forPurchase}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, forPurchase: e.target.checked }))
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="purchase" className="font-normal">Purchase</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="expenses"
                          checked={formData.forExpenses}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, forExpenses: e.target.checked }))
                          }
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="expenses" className="font-normal">Expenses</Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sales-price">Sales Price (₹)</Label>
                      <Input
                        id="sales-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.salesPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, salesPrice: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sales-taxes">Sales Taxes (%)</Label>
                      <Input
                        id="sales-taxes"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.salesTaxes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, salesTaxes: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost (₹)</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) => setFormData((prev) => ({ ...prev, cost: e.target.value }))}
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={createLoading}>
                    Create Product
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No products found. Create your first product to get started.</p>
              </CardContent>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>{product.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sales Price:</span>
                      <span className="font-medium">₹{product.salesPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost:</span>
                      <span className="font-medium">₹{product.cost}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
