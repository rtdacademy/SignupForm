import React, { useState } from 'react';
import { shopifyAPI, shopifyUtils } from '../../utils/shopifyClient';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ShoppingBag, 
  ExternalLink,
  RefreshCw 
} from 'lucide-react';

const ShopifyConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus(null);
    setShopInfo(null);
    setProducts(null);

    try {
      // Test basic connection
      console.log('Testing Shopify connection...');
      const shop = await shopifyAPI.testConnection();
      
      if (shop) {
        setShopInfo(shop);
        setConnectionStatus('connected');
        
        // Try to fetch a few products
        try {
          const productsData = await shopifyAPI.getAllProducts();
          setProducts(productsData);
        } catch (productError) {
          console.warn('Products fetch failed:', productError);
          // Connection successful but products might not be available
        }
      } else {
        setConnectionStatus('failed');
        setError('No shop data returned from API');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('failed');
      setError(err.message || 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    }
    if (connectionStatus === 'connected') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (connectionStatus === 'failed') {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    return <ShoppingBag className="h-5 w-5 text-gray-400" />;
  };

  const getStatusMessage = () => {
    if (isLoading) return 'Testing connection...';
    if (connectionStatus === 'connected') return 'Connected successfully!';
    if (connectionStatus === 'failed') return 'Connection failed';
    return 'Ready to test';
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-600';
    if (connectionStatus === 'connected') return 'text-green-600';
    if (connectionStatus === 'failed') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 py-4 border-b border-emerald-100">
        <h3 className="text-xl font-bold flex items-center text-emerald-800">
          <ShoppingBag className="h-6 w-6 mr-2 text-emerald-600" />
          Shopify Integration Test
        </h3>
        <p className="text-sm text-emerald-700 mt-1">
          Verify connection to RTD Learning Shopify store
        </p>
      </CardHeader>
      
      <CardContent className="p-6 bg-white">
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <div className={`font-medium ${getStatusColor()}`}>
                  {getStatusMessage()}
                </div>
                {shopInfo && (
                  <div className="text-sm text-gray-600">
                    Store: {shopInfo.name} ({shopInfo.primaryDomain?.host})
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={testConnection}
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                <div className="font-medium">Connection Error:</div>
                <div className="mt-1 text-sm">{error}</div>
                <div className="mt-2 text-xs">
                  Check that your REACT_APP_SHOPIFY_STORE_DOMAIN and REACT_APP_SHOPIFY_STOREFRONT_TOKEN environment variables are set correctly.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Shop Information */}
          {shopInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Shop Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-green-700">Name:</span>
                  <span className="ml-2 text-green-800">{shopInfo.name}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Domain:</span>
                  <span className="ml-2 text-green-800">{shopInfo.primaryDomain?.host}</span>
                </div>
                {shopInfo.description && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-green-700">Description:</span>
                    <span className="ml-2 text-green-800">{shopInfo.description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Information */}
          {products && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Products Available</h4>
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-700">
                    Total Products Found: {products.edges?.length || 0}
                  </span>
                  <span className="text-xs text-blue-600">
                    {products.pageInfo?.hasNextPage ? 'More available' : 'All shown'}
                  </span>
                </div>
                
                {products.edges && products.edges.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-blue-700 font-medium">Sample Products:</div>
                    {products.edges.slice(0, 3).map((edge, index) => {
                      const product = edge.node;
                      const price = shopifyUtils.getPriceDisplay(product);
                      const available = shopifyUtils.isProductAvailable(product);
                      
                      return (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <div className="font-medium text-gray-800">{product.title}</div>
                            <div className="text-xs text-gray-600">
                              {available ? '✅ Available' : '❌ Unavailable'} • {price}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {product.id.split('/').pop()}
                          </div>
                        </div>
                      );
                    })}
                    
                    {products.edges.length > 3 && (
                      <div className="text-xs text-blue-600 text-center">
                        ... and {products.edges.length - 3} more products
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuration Help */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Configuration Required</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>1. Set up your environment variables:</div>
              <div className="font-mono text-xs bg-yellow-100 p-2 rounded">
                REACT_APP_SHOPIFY_STORE_DOMAIN="rtdlearning.myshopify.com"<br/>
                REACT_APP_SHOPIFY_STOREFRONT_TOKEN="your-storefront-token"
              </div>
              <div className="mt-2">
                2. Get your Storefront API token from Shopify Admin → Apps → Headless channel
              </div>
              <div className="flex items-center mt-2">
                <ExternalLink className="h-4 w-4 mr-1" />
                <a 
                  href="https://shopify.dev/docs/api/storefront/getting-started" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-700 hover:text-yellow-800 underline"
                >
                  Shopify Storefront API Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopifyConnectionTest;