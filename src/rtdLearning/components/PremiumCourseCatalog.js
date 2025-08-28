import React, { useState, useEffect, useMemo } from 'react';
import { shopifyAPI, shopifyUtils } from '../../utils/shopifyClient';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { 
  BookOpen, 
  ShoppingCart, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  Calendar,
  Users,
  Clock,
  MapPin,
  Monitor,
  Star,
  Filter,
  Search,
  Grid,
  List,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Award,
  X,
  Check,
  Info,
  Timer,
  DollarSign
} from 'lucide-react';

// Enhanced Course Card with Premium Design
const PremiumCourseCard = ({ product, onAddToCart, onViewDetails, viewMode = 'grid' }) => {
  const [isQuickView, setIsQuickView] = useState(false);
  const price = shopifyUtils.getPriceDisplay(product);
  const imageUrl = shopifyUtils.getFirstImageUrl(product);
  const isAvailable = shopifyUtils.isProductAvailable(product);
  const firstVariant = product.variants?.edges?.[0]?.node;

  // Extract metadata from tags or description
  const isOnline = product.tags?.includes('online') || product.title.toLowerCase().includes('online');
  const isInPerson = product.tags?.includes('in-person') || product.title.toLowerCase().includes('in-person');
  const hasLimitedSeats = product.tags?.includes('limited') || Math.random() > 0.5; // Demo purposes
  const seatsLeft = hasLimitedSeats ? Math.floor(Math.random() * 5) + 1 : null;
  
  const handleAddToCart = () => {
    if (firstVariant && onAddToCart) {
      onAddToCart({
        variantId: firstVariant.id,
        quantity: 1,
        product: product
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="h-12 w-12 text-emerald-500" />
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col md:flex-row justify-between">
            <div className="flex-1 mb-4 md:mb-0 md:mr-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 flex-1">
                  {product.title}
                </h3>
                <div className="flex gap-2 ml-4">
                  {isOnline && (
                    <Badge className="bg-blue-100 text-blue-700">
                      <Monitor className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  )}
                  {isInPerson && (
                    <Badge className="bg-purple-100 text-purple-700">
                      <MapPin className="h-3 w-3 mr-1" />
                      In-Person
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-2">
                {product.description || 'Professional diploma preparation with expert instructors.'}
              </p>
              
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-1 text-emerald-500" />
                  <span>Flexible Schedule</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-1 text-emerald-500" />
                  <span>Small Groups</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>4.9 Rating</span>
                </div>
              </div>
            </div>
            
            {/* Action Section */}
            <div className="flex flex-col justify-between items-end">
              <div className="text-right mb-3">
                <div className="text-2xl font-bold text-emerald-600">{price}</div>
                {hasLimitedSeats && seatsLeft && (
                  <div className="text-sm text-red-600 font-medium mt-1">
                    Only {seatsLeft} seats left!
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => onViewDetails && onViewDetails(product)}
                  variant="outline"
                  size="sm"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Details
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || !firstVariant}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View (Default)
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden h-full flex flex-col group">
      {/* Urgency Badge */}
      {hasLimitedSeats && seatsLeft && (
        <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
          {seatsLeft} seats left!
        </div>
      )}
      
      {/* Course Image */}
      <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-emerald-500" />
          </div>
        )}
        
        {/* Format Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isOnline && (
            <Badge className="bg-blue-600 text-white border-0">
              <Monitor className="h-3 w-3 mr-1" />
              Online
            </Badge>
          )}
          {isInPerson && (
            <Badge className="bg-purple-600 text-white border-0">
              <MapPin className="h-3 w-3 mr-1" />
              In-Person
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Course Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">(4.9)</span>
        </div>

        {/* Course Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {product.description || 'Expert-led diploma preparation designed for your success.'}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center text-gray-600">
            <Users className="h-3 w-3 mr-1 text-emerald-500" />
            <span>Max 12 Students</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-3 w-3 mr-1 text-emerald-500" />
            <span>Flexible Times</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Award className="h-3 w-3 mr-1 text-emerald-500" />
            <span>Certified</span>
          </div>
          <div className="flex items-center text-gray-600">
            <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
            <span>95% Pass Rate</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{price}</div>
              <div className="text-xs text-gray-500">per session</div>
            </div>
            {isAvailable && (
              <div className="text-xs text-green-600 font-medium flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Available Now
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setIsQuickView(true)}
              variant="outline"
              size="sm"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              <Info className="h-3 w-3 mr-1" />
              Quick View
            </Button>
            
            <Button
              onClick={handleAddToCart}
              disabled={!isAvailable || !firstVariant}
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Quick View Modal */}
      {isQuickView && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsQuickView(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
                <button onClick={() => setIsQuickView(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">{product.description || 'Comprehensive diploma preparation program.'}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                    <BookOpen className="h-5 w-5 mr-2 text-emerald-600" />
                    Course Features
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Expert instructors</li>
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Small class sizes</li>
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Practice exams included</li>
                    <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" /> Money-back guarantee</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-gray-900">
                    <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                    Schedule Options
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-emerald-500" /> Morning sessions</li>
                    <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-emerald-500" /> Evening sessions</li>
                    <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-emerald-500" /> Weekend intensives</li>
                    <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-emerald-500" /> Holiday programs</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">{price}</div>
                  <div className="text-sm text-gray-500">Includes all materials</div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => onViewDetails && onViewDetails(product)}
                    variant="outline"
                    className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  >
                    Full Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isAvailable || !firstVariant}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({ filters, onFilterChange, productCount, isMobile = false }) => {
  const subjects = [
    'Math 30-1', 'Math 30-2', 'Physics 30', 'Chemistry 30', 
    'Biology 30', 'Science 30', 'English 30-1', 'English 30-2',
    'Social Studies 30-1', 'Social Studies 30-2'
  ];

  const formats = ['In-Person', 'Online', 'Study Materials'];
  
  return (
    <div className={`bg-white rounded-lg ${isMobile ? 'p-4' : 'p-6 shadow-lg'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-emerald-600" />
          Filters
        </h3>
        {productCount > 0 && (
          <Badge className="bg-emerald-100 text-emerald-700">
            {productCount} courses
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Format Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
        <div className="space-y-2">
          {formats.map(format => (
            <label key={format} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.formats?.includes(format) || false}
                onChange={(e) => {
                  const newFormats = e.target.checked
                    ? [...(filters.formats || []), format]
                    : (filters.formats || []).filter(f => f !== format);
                  onFilterChange({ ...filters, formats: newFormats });
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {format}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subject Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {subjects.map(subject => (
            <label key={subject} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.subjects?.includes(subject) || false}
                onChange={(e) => {
                  const newSubjects = e.target.checked
                    ? [...(filters.subjects || []), subject]
                    : (filters.subjects || []).filter(s => s !== subject);
                  onFilterChange({ ...filters, subjects: newSubjects });
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {subject}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={filters.priceRange === 'all'}
              onChange={() => onFilterChange({ ...filters, priceRange: 'all' })}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-700">All Prices</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={filters.priceRange === 'under-100'}
              onChange={() => onFilterChange({ ...filters, priceRange: 'under-100' })}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-700">Under $100</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={filters.priceRange === '100-200'}
              onChange={() => onFilterChange({ ...filters, priceRange: '100-200' })}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-700">$100 - $200</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={filters.priceRange === 'over-200'}
              onChange={() => onFilterChange({ ...filters, priceRange: 'over-200' })}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-700">Over $200</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        size="sm"
        className="w-full border-gray-300"
        onClick={() => onFilterChange({
          search: '',
          formats: [],
          subjects: [],
          priceRange: 'all',
          sortBy: 'popular'
        })}
      >
        Clear All Filters
      </Button>
    </div>
  );
};

// Main Premium Course Catalog Component
const PremiumCourseCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    formats: [],
    subjects: [],
    priceRange: 'all',
    sortBy: 'popular'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const productsData = await shopifyAPI.getAllProducts();
      setProducts(productsData?.edges || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(edge => 
        edge.node.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        edge.node.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Format filter
    if (filters.formats?.length > 0) {
      filtered = filtered.filter(edge => {
        const title = edge.node.title.toLowerCase();
        const tags = edge.node.tags?.join(' ').toLowerCase() || '';
        return filters.formats.some(format => 
          format.toLowerCase() === 'in-person' ? 
            (title.includes('in-person') || title.includes('in person') || tags.includes('in-person')) :
          format.toLowerCase() === 'online' ?
            (title.includes('online') || tags.includes('online')) :
          format.toLowerCase() === 'study materials' ?
            (title.includes('study') || title.includes('material') || tags.includes('materials')) :
          false
        );
      });
    }

    // Subject filter
    if (filters.subjects?.length > 0) {
      filtered = filtered.filter(edge => {
        const title = edge.node.title.toLowerCase();
        return filters.subjects.some(subject => 
          title.includes(subject.toLowerCase().replace(' ', '-'))
        );
      });
    }

    // Price filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(edge => {
        const minPrice = parseFloat(edge.node.priceRange?.minVariantPrice?.amount || 0);
        switch(filters.priceRange) {
          case 'under-100':
            return minPrice < 100;
          case '100-200':
            return minPrice >= 100 && minPrice <= 200;
          case 'over-200':
            return minPrice > 200;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch(filters.sortBy) {
        case 'price-low':
          return parseFloat(a.node.priceRange?.minVariantPrice?.amount || 0) - 
                 parseFloat(b.node.priceRange?.minVariantPrice?.amount || 0);
        case 'price-high':
          return parseFloat(b.node.priceRange?.minVariantPrice?.amount || 0) - 
                 parseFloat(a.node.priceRange?.minVariantPrice?.amount || 0);
        case 'name':
          return a.node.title.localeCompare(b.node.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

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
    console.log('View product details:', product);
  };

  const createCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const checkout = await shopifyAPI.createCheckout(cart);
      if (checkout?.webUrl) {
        window.open(checkout.webUrl, '_blank');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      alert('Failed to create checkout: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <div className="text-lg font-medium text-gray-700">Loading courses...</div>
          <div className="text-sm text-gray-500 mt-2">Preparing your learning journey</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="relative">
      {/* Top Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden border-emerald-500 text-emerald-600"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-bold">{filteredProducts.length}</span> of {products.length} courses
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="md:hidden mb-6 border rounded-lg">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            productCount={filteredProducts.length}
            isMobile={true}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            productCount={filteredProducts.length}
          />
        </div>

        {/* Products Grid/List */}
        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredProducts.map((edge) => (
                <PremiumCourseCard
                  key={edge.node.id}
                  product={edge.node}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">No courses found</div>
                <div className="text-sm text-gray-500 mb-4">
                  Try adjusting your filters or search terms
                </div>
                <Button
                  onClick={() => setFilters({
                    search: '',
                    formats: [],
                    subjects: [],
                    priceRange: 'all',
                    sortBy: 'popular'
                  })}
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={createCheckout}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Checkout ({cart.length})
          </Button>
        </div>
      )}
    </div>
  );
};

export default PremiumCourseCatalog;