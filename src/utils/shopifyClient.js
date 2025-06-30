import { createStorefrontApiClient } from '@shopify/storefront-api-client';

// Shopify Storefront API configuration
const SHOPIFY_CONFIG = {
  // Replace with actual RTD Learning Shopify store domain
  storeDomain: process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || 'rtdlearning.myshopify.com',
  apiVersion: '2025-01',
  // Replace with actual public storefront token
  publicAccessToken: process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN || 'your-storefront-token-here',
};

// Create Shopify Storefront API client
export const shopifyClient = createStorefrontApiClient({
  storeDomain: SHOPIFY_CONFIG.storeDomain,
  apiVersion: SHOPIFY_CONFIG.apiVersion,
  publicAccessToken: SHOPIFY_CONFIG.publicAccessToken,
});

// GraphQL query to fetch products (courses)
export const PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          createdAt
          updatedAt
          productType
          vendor
          tags
          availableForSale
          totalInventory
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// GraphQL query to fetch a single product by handle
export const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      createdAt
      updatedAt
      productType
      vendor
      tags
      availableForSale
      totalInventory
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to create a checkout
export const CREATE_CHECKOUT_QUERY = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        totalPriceV2 {
          amount
          currencyCode
        }
        subtotalPriceV2 {
          amount
          currencyCode
        }
        totalTaxV2 {
          amount
          currencyCode
        }
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                }
              }
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
      }
    }
  }
`;

// API helper functions
export const shopifyAPI = {
  // Fetch all products (courses)
  async getProducts(first = 100) {
    try {
      const response = await shopifyClient.request(PRODUCTS_QUERY, {
        variables: { first }
      });
      return response.data?.products || null;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Fetch a single product by handle
  async getProductByHandle(handle) {
    try {
      const response = await shopifyClient.request(PRODUCT_BY_HANDLE_QUERY, {
        variables: { handle }
      });
      return response.data?.productByHandle || null;
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      throw error;
    }
  },

  // Create a checkout with line items
  async createCheckout(lineItems) {
    try {
      const response = await shopifyClient.request(CREATE_CHECKOUT_QUERY, {
        variables: {
          input: {
            lineItems: lineItems.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity || 1
            }))
          }
        }
      });
      
      if (response.data?.checkoutCreate?.checkoutUserErrors?.length > 0) {
        throw new Error(response.data.checkoutCreate.checkoutUserErrors[0].message);
      }
      
      return response.data?.checkoutCreate?.checkout || null;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  },

  // Test API connection
  async testConnection() {
    try {
      const response = await shopifyClient.request(`
        query {
          shop {
            name
            description
            primaryDomain {
              host
            }
          }
        }
      `);
      return response.data?.shop || null;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }
};

// Utility functions for working with Shopify data
export const shopifyUtils = {
  // Format price for display
  formatPrice(price, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(price));
  },

  // Get the first available image URL
  getFirstImageUrl(product) {
    const firstImage = product?.images?.edges?.[0]?.node;
    return firstImage ? firstImage.url : null;
  },

  // Check if product is available
  isProductAvailable(product) {
    return product?.availableForSale && product?.totalInventory > 0;
  },

  // Get minimum price from product
  getMinPrice(product) {
    return product?.priceRange?.minVariantPrice;
  },

  // Get maximum price from product
  getMaxPrice(product) {
    return product?.priceRange?.maxVariantPrice;
  },

  // Get display price range
  getPriceDisplay(product) {
    const minPrice = this.getMinPrice(product);
    const maxPrice = this.getMaxPrice(product);
    
    if (!minPrice) return 'Price not available';
    
    const minAmount = parseFloat(minPrice.amount);
    const maxAmount = parseFloat(maxPrice.amount);
    
    if (minAmount === maxAmount) {
      return this.formatPrice(minAmount, minPrice.currencyCode);
    } else {
      return `${this.formatPrice(minAmount, minPrice.currencyCode)} - ${this.formatPrice(maxAmount, maxPrice.currencyCode)}`;
    }
  }
};

export default shopifyClient;