import { Edit, Trash2, Eye, Package } from 'lucide-react';
import Link from 'next/link';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="aspect-w-16 aspect-h-9 bg-secondary-100">
        {product.image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${product.image}`}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <Package className="w-12 h-12 text-secondary-400" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-secondary-900 truncate">
            {product.name}
          </h3>
          <Badge variant="success" size="xs">Active</Badge>
        </div>
        
        <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
          {product.specs}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-secondary-500">MOQ:</span>
            <span className="ml-1 font-medium">{product.moq}</span>
          </div>
          <div>
            <span className="text-secondary-500">Lead Time:</span>
            <span className="ml-1 font-medium">{product.leadTime}</span>
          </div>
          <div>
            <span className="text-secondary-500">Price:</span>
            <span className="ml-1 font-medium text-primary-600">{product.price}</span>
          </div>
          <div>
            <span className="text-secondary-500">HS Code:</span>
            <span className="ml-1 font-medium">{product.hsCode}</span>
          </div>
        </div>
        
        {product.variants && product.variants.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-secondary-500">Variants:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {product.variants.map((variant, index) => (
                <Badge key={index} variant="default" size="xs">
                  {variant}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
          <div className="flex items-center text-sm text-secondary-500">
            <Eye className="w-4 h-4 mr-1" />
            <span>245 views</span>
          </div>
          
          <div className="flex space-x-2">
            <Link href={`/products/edit/${product.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="danger" 
              size="sm"
              onClick={() => onDelete && onDelete(product.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
