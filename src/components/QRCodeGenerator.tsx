import { useRef } from 'react'
import { Download } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
  tableNumber: number
  tableId: string
  restaurantId: string
}

export default function QRCodeGenerator({ tableNumber, tableId, restaurantId }: QRCodeGeneratorProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Generate the URL for this table's QR code
  const qrUrl = `${window.location.origin}/menu?table=${tableId}&restaurant=${restaurantId}`

  const downloadQR = () => {
    if (!svgRef.current) return

    try {
      // Create a canvas to render the QR code
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      
      // Create image from SVG
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width * 2 // Higher resolution
        canvas.height = img.height * 2
        ctx?.scale(2, 2)
        ctx?.drawImage(img, 0, 0)
        
        // Download as PNG
        const pngUrl = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.href = pngUrl
        downloadLink.download = `table-${tableNumber}-qr.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        
        toast.success('QR code downloaded!')
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download QR code')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* QR Code Display */}
          <div className="bg-white p-4 rounded-lg border border-border">
            <QRCodeSVG
              ref={svgRef}
              value={qrUrl}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          
          {/* Table Info */}
          <div className="text-center">
            <p className="font-semibold text-lg">Table {tableNumber}</p>
            <p className="text-xs text-muted-foreground mt-1 break-all max-w-[200px]">
              {qrUrl}
            </p>
          </div>
          
          {/* Download Button */}
          <Button onClick={downloadQR} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
