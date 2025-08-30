import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc,
  updateDoc,
  where,
  getDocs,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { firestore as db } from '../../firebase';

/**
 * Hook for managing Shopify webhook data from Firestore
 */
export const useShopifyWebhooks = (options = {}) => {
  const { 
    maxResults = 50, 
    filterStatus = 'all',
    filterSeverity = 'all',
    autoRefresh = true 
  } = options;
  
  const [webhooks, setWebhooks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch purchase logs
  useEffect(() => {
    if (!autoRefresh) return;

    setLoading(true);
    
    try {
      // Query for purchase records from the new structure
      let purchaseQuery = query(
        collection(db, 'shopifyWebhooks', 'purchases', 'orders'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
      
      if (filterStatus !== 'all') {
        purchaseQuery = query(purchaseQuery, where('processingResult.status', '==', filterStatus));
      }

      const unsubscribePurchases = onSnapshot(
        purchaseQuery,
        (snapshot) => {
          const purchaseData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Extract key fields for display
              orderId: data.order?.id || data.orderId,
              orderNumber: data.order?.orderNumber || data.orderNumber,
              userEmail: data.user?.email || data.userEmail,
              productTitle: data.product?.title || 'Unknown Product',
              status: data.processingResult?.status || 'unknown',
              topic: data.webhookTopic || 'unknown',
              // Convert Firestore timestamp to JS Date
              createdAt: data.createdAt?.toDate() || new Date(data.timestamp || Date.now())
            };
          });
          setWebhooks(purchaseData);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching purchases:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribePurchases();
    } catch (err) {
      console.error('Error setting up purchase listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [maxResults, filterStatus, autoRefresh]);

  // Fetch active alerts
  useEffect(() => {
    if (!autoRefresh) return;

    try {
      let alertQuery = query(
        collection(db, 'shopifyWebhooks', 'alerts', 'active'),
        where('resolved', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      if (filterSeverity !== 'all') {
        alertQuery = query(alertQuery, where('severity', '==', filterSeverity));
      }

      const unsubscribeAlerts = onSnapshot(
        alertQuery,
        (snapshot) => {
          const alertData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }));
          setAlerts(alertData);
        },
        (err) => {
          console.error('Error fetching alerts:', err);
        }
      );

      return () => unsubscribeAlerts();
    } catch (err) {
      console.error('Error setting up alert listener:', err);
    }
  }, [filterSeverity, autoRefresh]);

  // Fetch daily stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const statsDoc = await getDoc(
          doc(db, 'shopifyWebhooks', 'stats', 'daily', today)
        );
        
        if (statsDoc.exists()) {
          setStats(statsDoc.data());
        } else {
          setStats({
            totalWebhooks: 0,
            successfulOrders: 0,
            failedOrders: 0,
            usersCreated: 0,
            ordersWithoutUsers: 0,
            alertsCreated: 0
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();
    
    // Refresh stats every minute if autoRefresh is enabled
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Resolve an alert
  const resolveAlert = async (alertId, notes = '') => {
    try {
      const alertRef = doc(db, 'shopifyWebhooks', 'alerts', 'active', alertId);
      await updateDoc(alertRef, {
        resolved: true,
        resolvedAt: serverTimestamp(),
        resolvedBy: 'admin', // You might want to pass the actual user
        notes: notes,
        updatedAt: serverTimestamp()
      });
      
      // Remove from local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      return true;
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  };

  // Get purchase details
  const getWebhookDetails = async (purchaseId) => {
    try {
      const purchaseDoc = await getDoc(
        doc(db, 'shopifyWebhooks', 'purchases', 'orders', purchaseId)
      );
      
      if (purchaseDoc.exists()) {
        const data = purchaseDoc.data();
        return {
          id: purchaseDoc.id,
          ...data,
          // Ensure dates are converted
          createdAt: data.createdAt?.toDate() || new Date(data.timestamp || Date.now())
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      throw err;
    }
  };

  // Get alert history
  const getAlertHistory = async (limit = 100) => {
    try {
      const historyQuery = query(
        collection(db, 'shopifyWebhooks', 'alerts', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    } catch (err) {
      console.error('Error fetching alert history:', err);
      throw err;
    }
  };

  return {
    webhooks,
    alerts,
    stats,
    loading,
    error,
    resolveAlert,
    getWebhookDetails,
    getAlertHistory,
    alertCount: alerts.filter(a => !a.resolved).length,
    criticalAlertCount: alerts.filter(a => a.severity === 'critical' && !a.resolved).length
  };
};

/**
 * Hook for getting webhook statistics over time
 */
export const useWebhookStats = (days = 7) => {
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMultiDayStats = async () => {
      try {
        const stats = [];
        const endDate = new Date();
        
        for (let i = 0; i < days; i++) {
          const date = new Date(endDate);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const statsDoc = await getDoc(
            doc(db, 'shopifyWebhooks', 'stats', 'daily', dateStr)
          );
          
          stats.push({
            date: dateStr,
            ...(statsDoc.exists() ? statsDoc.data() : {
              totalWebhooks: 0,
              successfulOrders: 0,
              failedOrders: 0,
              usersCreated: 0
            })
          });
        }
        
        setDailyStats(stats.reverse());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching multi-day stats:', err);
        setLoading(false);
      }
    };

    fetchMultiDayStats();
  }, [days]);

  return { dailyStats, loading };
};