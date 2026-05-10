import { useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { uploadMenuImage } from '@/lib/supabase'
import { toast } from 'sonner'

interface ImageUploadProps {
  restaurantId: string
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
}

export default function ImageUpload({ restaurantId, currentImageUrl, onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload to Supabase
    setUploading(true)
    try {
      const publicUrl = await uploadMenuImage(file, restaurantId)
      onImageUploaded(publicUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload image')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onImageUploaded('')
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="w-10 h-10 text-muted-foreground animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB)</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {!previewUrl && !uploading && (
        <Button variant="outline" className="w-full" asChild>
          <label className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Choose Image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </label>
        </Button>
      )}
    </div>
  )
}
