import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Hook to manage Shopify purchases and link pending purchases
 * @returns {Object} Purchase status and methods
 */
export const useShopifyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [pendingLink, setPendingLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const auth = getAuth();
  const db = getDatabase();
  const functions = getFunctions();
  
  // Link pending purchases for current user
  const linkPendingPurchases = async () => {
    if (!auth.currentUser) {
      setError('User not authenticated');
      return { success: false };
    }
    
    setPendingLink(true);
    setError(null);
    
    try {
      const linkFunction = httpsCallable(functions, 'linkPendingShopifyPurchases');
      const result = await linkFunction({
        email: auth.currentUser.email,
        uid: auth.currentUser.uid
      });
      
      console.log('Link result:', result.data);
      
      // Refresh user token to get updated claims
      if (result.data.purchasesLinked > 0) {
        await auth.currentUser.getIdToken(true);
      }
      
      setPendingLink(false);
      return result.data;
    } catch (err) {
      console.error('Error linking purchases:', err);
      setError(err.message);
      setPendingLink(false);
      return { success: false, error: err.message };
    }
  };
  
  // Check if user has specific product access
  const hasProductAccess = async (productId) => {
    if (!auth.currentUser) return false;
    
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult();
      const purchasedProducts = tokenResult.claims.purchasedProducts || [];
      return purchasedProducts.includes(productId.toString());
    } catch (err) {
      console.error('Error checking product access:', err);
      return false;
    }
  };
  
  // Get all active purchases
  const getActivePurchases = async () => {
    if (!auth.currentUser) return {};
    
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult();
      return tokenResult.claims.activePurchases || {};
    } catch (err) {
      console.error('Error getting active purchases:', err);
      return {};
    }
  };
  
  // Listen to user's purchases in real-time
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    
    const purchasesRef = ref(db, `users/${auth.currentUser.uid}/shopifyPurchases`);
    
    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const purchasesList = Object.entries(data).map(([id, purchase]) => ({
        id,
        ...purchase
      }));
      
      setPurchases(purchasesList);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching purchases:', err);
      setError(err.message);
      setLoading(false);
    });
    
    return () => off(purchasesRef, 'value', unsubscribe);
  }, [auth.currentUser, db]);
  
  return {
    purchases,
    loading,
    error,
    pendingLink,
    linkPendingPurchases,
    hasProductAccess,
    getActivePurchases
  };
};