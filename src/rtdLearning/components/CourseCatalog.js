import React, { useState, useEffect } from 'react';
import { shopifyAPI, shopifyUtils } from '../../utils/shopifyClient';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  BookOpen, 
  ShoppingCart, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Tag,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CourseCard = ({ product, onAddToCart, onViewDetails }) => {
  const price = shopifyUtils.getPriceDisplay(product);
  const imageUrl = shopifyUtils.getFirstImageUrl(product);
  const isAvailable = shopifyUtils.isProductAvailable(product);
  const firstVariant = product.variants?.edges?.[0]?.node;

  const handleAddToCart = () => {
    if (firstVariant && onAddToCart) {
      onAddToCart({
        variantId: firstVariant.id,
        quantity: 1,
        product: product
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col">
      {/* Course Image */}
      <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <BookOpen className="h-16 w-16 text-emerald-500" />
        )}
      </div>

      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Course Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
          {product.description || 'No description available.'}
        </p>

        {/* Course Info */}
        <div className="space-y-2 mb-4">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-emerald-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="font-bold">{price}</span>
            </div>
            <div className="flex items-center">
              {isAvailable ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Available
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  Unavailable
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Tag className="h-3 w-3 mr-1" />
              <span className="truncate">{product.tags.slice(0, 3).join(', ')}</span>
            </div>
          )}

          {/* Product Type */}
          {product.productType && (
            <div className="text-xs text-gray-500">
              Category: {product.productType}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => onViewDetails && onViewDetails(product)}
            variant="outline"
            className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          <Button
            onClick={handleAddToCart}
            disabled={!isAvailable || !firstVariant}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAvailable ? 'Add to Cart' : 'Not Available'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CourseCatalog = ({ maxItems = 12 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadProducts();
  }, [maxItems]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const productsData = await shopifyAPI.getAllProducts();
      // Limit to maxItems for display
      const limitedProducts = productsData?.edges?.slice(0, maxItems) || [];
      setProducts(limitedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.variantId === item.variantId);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.variantId === item.variantId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, item];
      }
    });
  };

  const handleViewDetails = (product) => {
    // For now, just log the product. In a real app, this would navigate to a details page
    console.log('View product details:', product);
    alert(`Product Details:\n\nTitle: ${product.title}\nHandle: ${product.handle}\nID: ${product.id}`);
  };

  const createCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const checkout = await shopifyAPI.createCheckout(cart);
      if (checkout?.webUrl) {
        // Redirect to Shopify checkout
        window.open(checkout.webUrl, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      alert('Failed to create checkout: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-700">Loading courses...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching latest courses from Shopify</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Alert variant="destructive" className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <div className="font-medium">Failed to load courses</div>
              <div className="mt-1 text-sm">{error}</div>
              <Button
                onClick={loadProducts}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Course Catalog
              </h2>
              <p className="text-emerald-100 mt-1">
                Discover and enroll in RTD Learning courses
              </p>
            </div>
            {cart.length > 0 && (
              <div className="text-right">
                <div className="text-sm text-emerald-100">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </div>
                <Button
                  onClick={createCheckout}
                  className="mt-2 bg-white text-emerald-600 hover:bg-gray-100"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((edge) => (
            <CourseCard
              key={edge.node.id}
              product={edge.node}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-700 mb-2">No courses available</div>
            <div className="text-sm text-gray-500 mb-4">
              No courses are currently available in the store.
            </div>
            <Button
              onClick={loadProducts}
              variant="outline"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shopping Cart Summary */}
      {cart.length > 0 && (
        <Card className="border-0 shadow-lg border-emerald-200">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-800 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shopping Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={`${item.variantId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{item.product.title}</div>
                    <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium text-emerald-600">
                    {shopifyUtils.getPriceDisplay(item.product)}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <Button
                  onClick={createCheckout}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Proceed to Shopify Checkout
                </Button>
                <div className="text-xs text-gray-500 text-center mt-2">
                  You'll be redirected to Shopify to complete your purchase
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseCatalog;