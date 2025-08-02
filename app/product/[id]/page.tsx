'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/app/providers'
import { supabase } from '@/app/providers'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Calendar, Tag, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
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
  user_email?: string
}

export default function ProductDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setError('')
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:user_id(email)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        setError('Product not found or has been removed')
        return
      }

      setProduct({
        ...data,
        user_email: data.profiles?.email
      })
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSold = async () => {
    if (!product) return

    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_sold: !product.is_sold })
        .eq('id', product.id)

      if (error) {
        throw error
      }

      setProduct({ ...product, is_sold: !product.is_sold })
      setSuccess(`Product ${!product.is_sold ? 'marked as sold' : 'marked as available'}!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating product:', error)
      setError('Failed to update product status')
    }
  }

  const handleContactSeller = () => {
    if (product?.user_email) {
      window.open(`mailto:${product.user_email}?subject=Inquiry about ${product.title}`, '_blank')
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
              <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The product you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src={product.image_url || '/placeholder.jpg'}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {product.is_sold && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    SOLD
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.title}
              </h1>
              <div className="text-2xl font-semibold text-primary-600 mb-4">
                {formatPrice(product.price)}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Posted</p>
                      <p className="font-medium">{formatDate(product.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Seller</p>
                    <p className="font-medium">{product.user_email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!product.is_sold && (
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContactSeller}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
                
                {user && user.id === product.user_id && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleToggleSold}
                    >
                      Mark as Sold
                    </Button>
                    <Link href={`/product/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Edit Listing
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {product.is_sold && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      This item has been sold
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 