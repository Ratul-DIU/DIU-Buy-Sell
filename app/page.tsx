'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatDate } from '@/lib/utils'
import { Search, Filter, SortAsc, SortDesc, Package, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/providers'
import Image from 'next/image'
import Link from 'next/link'

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
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'price' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Sports',
    'Furniture',
    'Other'
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder])

  const fetchProducts = async () => {
    try {
      setError('')
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
        console.log('Supabase not configured, showing demo data')
        setProducts([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
        setProducts([])
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred. Please try again later.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })

    // Sort products
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      } else {
        return sortOrder === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredProducts(filtered)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to DIU BUY & SELL
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Buy and sell items within the DIU campus community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
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
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'date')}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
              </select>
              
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="px-3"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' 
                ? 'Welcome! To get started, please configure your Supabase credentials in the .env.local file.'
                : searchTerm || selectedCategory !== 'all'
                ? 'No products match your search criteria.'
                : 'No products available at the moment.'
              }
            </p>
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Setup Required</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  1. Copy .env.local.example to .env.local<br/>
                  2. Add your Supabase URL and API keys<br/>
                  3. Set up your Supabase database tables
                </p>
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                  View Setup Guide
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.title}
                        fill
                        className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-primary-600">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Posted {formatDate(product.created_at)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 