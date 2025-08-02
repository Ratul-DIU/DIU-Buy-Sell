'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/providers'
import { supabase } from '@/app/providers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Eye, Plus, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth-guard'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string
  created_at: string
  is_sold: boolean
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserProducts()
  }, [user])

  const fetchUserProducts = async () => {
    try {
      setError('')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load your products. Please try again.')
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    setDeletingId(productId)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        throw error
      }

      setProducts(products.filter(p => p.id !== productId))
      setSuccess('Product deleted successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting product:', error)
      setError('Failed to delete product. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleSold = async (productId: string, currentStatus: boolean) => {
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_sold: !currentStatus })
        .eq('id', productId)

      if (error) {
        throw error
      }

      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_sold: !currentStatus } : p
      ))
      
      setSuccess(`Product ${!currentStatus ? 'marked as sold' : 'marked as available'}!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating product:', error)
      setError('Failed to update product status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your listings and track your sales
            </p>
          </div>
          
          <Link href="/post">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post New Item
            </Button>
          </Link>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {products.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Listings
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {products.filter(p => !p.is_sold).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sold Items
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {products.filter(p => p.is_sold).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start selling by posting your first item
              </p>
              <Link href="/post">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className={`relative ${product.is_sold ? 'opacity-75' : ''}`}>
                {product.is_sold && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      SOLD
                    </span>
                  </div>
                )}
                
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={product.image_url || '/placeholder.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 line-clamp-2">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="mb-2 line-clamp-2">
                    {product.description}
                  </CardDescription>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-primary-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-4">
                    Posted {formatDate(product.created_at)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/product/${product.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSold(product.id, product.is_sold)}
                      className="flex-1"
                      disabled={deletingId === product.id}
                    >
                      {product.is_sold ? 'Mark Available' : 'Mark Sold'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  )
} 