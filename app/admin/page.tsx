'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/app/providers'
import { supabase } from '@/app/providers'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Users, Package, Shield, Search, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'
import { AuthGuard } from '@/components/auth-guard'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string
  created_at: string
  user_id: string
  is_sold: boolean
  user_email?: string
}

interface User {
  id: string
  email: string
  role: string
  created_at: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setError('')

      // Fetch products with user emails
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          profiles:user_id(email)
        `)
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error fetching products:', productsError)
        setError('Failed to load products')
      } else {
        setProducts(productsData?.map(p => ({
          ...p,
          user_email: p.profiles?.email
        })) || [])
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Error fetching users:', usersError)
        setError('Failed to load users')
      } else {
        setUsers(usersData || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
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
      setError('Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const handleBanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user? They will not be able to access the platform.')) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' })
        .eq('id', userId)

      if (error) {
        throw error
      }

      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: 'banned' } : u
      ))
      setSuccess('User banned successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error banning user:', error)
      setError('Failed to ban user')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Sports',
    'Furniture',
    'Other'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireAdmin={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Shield className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage products and users
              </p>
            </div>
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
                      Total Products
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
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {users.length}
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
                      Active Listings
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {products.filter(p => !p.is_sold).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'products' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('products')}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Products ({products.length})
            </Button>
            <Button
              variant={activeTab === 'users' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('users')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Users ({users.length})
            </Button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products, descriptions, or users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products List */}
              {filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm || selectedCategory !== 'all'
                        ? 'No products match your search criteria.'
                        : 'No products available.'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
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

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-semibold text-primary-600">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {product.category}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 mb-4">
                          <div>Posted {formatDate(product.created_at)}</div>
                          <div>By: {product.user_email}</div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={deletingId === product.id}
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deletingId === product.id ? 'Deleting...' : 'Delete Product'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-medium">Email</th>
                            <th className="text-left py-3 px-4 font-medium">Role</th>
                            <th className="text-left py-3 px-4 font-medium">Joined</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                              <td className="py-3 px-4">{user.email}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                    user.role === 'banned' ? 'bg-red-100 text-red-800' :
                                      'bg-green-100 text-green-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500">
                                {formatDate(user.created_at)}
                              </td>
                              <td className="py-3 px-4">
                                {user.role !== 'admin' && user.role !== 'banned' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBanUser(user.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Ban User
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
