'use client'

import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/app/providers'
import { supabase } from '@/app/providers'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Sparkles, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { AuthGuard } from '@/components/auth-guard'

interface AISuggestion {
  title: string
  category: string
}

export default function PostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null)

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Sports',
    'Furniture',
    'Other'
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setImage(file)
      setError('')
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateAISuggestion = async () => {
    if (!description.trim()) {
      setError('Please enter a description first')
      return
    }

    setAiLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestion')
      }

      const data = await response.json()
      setAiSuggestion(data)
      setTitle(data.title)
      setCategory(data.category)
      setSuccess('AI suggestion applied successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError('Failed to generate AI suggestion: ' + error.message)
    } finally {
      setAiLoading(false)
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      setError('Please enter a title')
      return false
    }
    if (!description.trim()) {
      setError('Please enter a description')
      return false
    }
    if (!category) {
      setError('Please select a category')
      return false
    }
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!validateForm()) {
        setLoading(false)
        return
      }

      let imageUrl = ''

      // Upload image if selected
      if (image) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, image)

        if (uploadError) {
          throw new Error('Failed to upload image: ' + uploadError.message)
        }

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        imageUrl = urlData.publicUrl
      }

      // Create product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          title: title.trim(),
          description: description.trim(),
          category,
          price: parseFloat(price),
          image_url: imageUrl,
          user_id: user?.id,
          is_sold: false,
        })

      if (insertError) {
        throw new Error('Failed to create product: ' + insertError.message)
      }

      setSuccess('Product posted successfully! Redirecting to dashboard...')
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      console.error('Error posting product:', error)
      setError(error.message || 'An error occurred while posting the product')
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post New Item</CardTitle>
            <CardDescription>
              Sell your items to the DIU campus community
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title"
                  required
                  disabled={loading}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                  rows={4}
                  required
                  disabled={loading}
                  maxLength={500}
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAISuggestion}
                      disabled={aiLoading || !description.trim() || loading}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {aiLoading ? 'Generating...' : 'AI Suggestions'}
                    </Button>
                    {aiSuggestion && (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        AI suggestion applied!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{description.length}/500 characters</p>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (BDT) *
                </label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="flex items-center gap-2 text-red-600"
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <div className="relative w-48 h-48">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Post Item
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </AuthGuard>
  )
} 