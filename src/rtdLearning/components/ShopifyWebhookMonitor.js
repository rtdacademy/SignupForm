import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  User, 
  Mail, 
  Package,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  ExternalLink
} from 'lucide-react';
import { useShopifyWebhooks, useWebhookStats } from '../hooks/useShopifyWebhooks';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const ShopifyWebhookMonitor = ({ onClose }) => {
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [expandedPayload, setExpandedPayload] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('logs');
  
  const { 
    webhooks, 
    alerts, 
    stats, 
    loading, 
    error,
    resolveAlert,
    getWebhookDetails,
    alertCount,
    criticalAlertCount
  } = useShopifyWebhooks({ filterStatus, filterSeverity });
  
  const { dailyStats } = useWebhookStats(7);

  // Filter webhooks based on search term
  const filteredWebhooks = webhooks.filter(webhook => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      webhook.orderId?.includes(search) ||
      webhook.orderNumber?.toString().includes(search) ||
      webhook.userEmail?.toLowerCase().includes(search) ||
      webhook.recipientEmail?.toLowerCase().includes(search) ||
      webhook.purchaserEmail?.toLowerCase().includes(search)
    );
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      success: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      error: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      warning: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      no_user: { bg: 'bg-orange-100', text: 'text-orange-800', icon: User },
      no_email: { bg: 'bg-red-100', text: 'text-red-800', icon: Mail },
      partial_failure: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Info },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw }
    };
    
    const config = statusConfig[status] || statusConfig.processing;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Severity badge component
  const SeverityBadge = ({ severity }) => {
    const severityConfig = {
      critical: 'bg-red-100 text-red-800',
      error: 'bg-orange-100 text-orange-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  // View webhook details
  const viewWebhookDetails = async (webhook) => {
    const details = await getWebhookDetails(webhook.id);
    setSelectedWebhook(details);
  };

  // Handle alert resolution
  const handleResolveAlert = async (alertId) => {
    const notes = prompt('Add resolution notes (optional):');
    if (notes !== null) {
      await resolveAlert(alertId, notes);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Shopify Webhook Monitor</h2>
              <p className="text-emerald-100 mt-1">Track orders, monitor processing, and resolve issues</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-white/20 rounded p-3">
              <div className="text-emerald-100 text-sm">Today's Webhooks</div>
              <div className="text-2xl font-bold">{stats?.totalWebhooks || 0}</div>
            </div>
            <div className="bg-white/20 rounded p-3">
              <div className="text-emerald-100 text-sm">Successful</div>
              <div className="text-2xl font-bold">{stats?.successfulOrders || 0}</div>
            </div>
            <div className="bg-white/20 rounded p-3">
              <div className="text-emerald-100 text-sm">Users Created</div>
              <div className="text-2xl font-bold">{stats?.usersCreated || 0}</div>
            </div>
            <div className="bg-white/20 rounded p-3">
              <div className="text-emerald-100 text-sm">Active Alerts</div>
              <div className="text-2xl font-bold">
                {alertCount}
                {criticalAlertCount > 0 && (
                  <span className="text-sm ml-2 text-red-200">({criticalAlertCount} critical)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 border-b-2 ${activeTab === 'logs' ? 'border-emerald-500 text-emerald-600' : 'border-transparent'}`}
            >
              Webhook Logs
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`py-3 border-b-2 relative ${activeTab === 'alerts' ? 'border-emerald-500 text-emerald-600' : 'border-transparent'}`}
            >
              Alerts
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-6 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {alertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-3 border-b-2 ${activeTab === 'stats' ? 'border-emerald-500 text-emerald-600' : 'border-transparent'}`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'logs' && (
            <div>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search by order ID, email, or order number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="no_user">No User</option>
                  <option value="no_email">No Email</option>
                </select>
              </div>

              {/* Webhook List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">Loading webhooks...</div>
                ) : filteredWebhooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No webhooks found</div>
                ) : (
                  filteredWebhooks.map(webhook => (
                    <Card key={webhook.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => viewWebhookDetails(webhook)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <div className="font-medium">Order #{webhook.orderNumber || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{formatDate(webhook.createdAt)}</div>
                              </div>
                              <StatusBadge status={webhook.status} />
                              {webhook.userCreated && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  NEW USER
                                </span>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Email Used:</span>{' '}
                                <span className="font-medium">
                                  {webhook.emailUsed === 'recipient' ? '📧 Recipient' : 
                                   webhook.emailUsed === 'purchaser' ? '💳 Purchaser' : '❌ None'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">User:</span>{' '}
                                {webhook.userId ? (
                                  <span className="text-emerald-600">{webhook.userId.substring(0, 8)}...</span>
                                ) : (
                                  <span className="text-gray-400">None</span>
                                )}
                              </div>
                              <div>
                                <span className="text-gray-500">Total:</span>{' '}
                                <span className="font-medium">${webhook.totalPrice} {webhook.currency}</span>
                              </div>
                            </div>
                            {webhook.processingResult?.warnings?.length > 0 && (
                              <div className="mt-2 text-sm text-yellow-600">
                                ⚠️ {webhook.processingResult.warnings.join(', ')}
                              </div>
                            )}
                            {webhook.processingResult?.errors?.length > 0 && (
                              <div className="mt-2 text-sm text-red-600">
                                ❌ {webhook.processingResult.errors.join(', ')}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              {/* Alert Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              {/* Alert List */}
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No active alerts</div>
                ) : (
                  alerts.map(alert => (
                    <Card key={alert.id} className={`border-l-4 ${
                      alert.severity === 'critical' ? 'border-red-500' :
                      alert.severity === 'error' ? 'border-orange-500' : 'border-yellow-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <SeverityBadge severity={alert.severity} />
                              <span className="font-medium">{alert.type.replace(/_/g, ' ').toUpperCase()}</span>
                              <span className="text-sm text-gray-500">{formatDate(alert.createdAt)}</span>
                            </div>
                            <p className="mt-2 text-gray-700">{alert.details.message}</p>
                            <div className="mt-2 text-sm text-gray-600">
                              Order #{alert.details.orderNumber} • {alert.details.orderId}
                            </div>
                            {alert.details.products && (
                              <div className="mt-2 text-sm">
                                Products: {alert.details.products.map(p => p.title).join(', ')}
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            Resolve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div className="grid grid-cols-2 gap-6">
                {/* Daily Stats Chart */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">7-Day Overview</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dailyStats.map(day => (
                        <div key={day.date} className="flex items-center justify-between">
                          <span className="text-sm">{day.date}</span>
                          <div className="flex space-x-4 text-sm">
                            <span className="text-green-600">✓ {day.successfulOrders || 0}</span>
                            <span className="text-red-600">✗ {day.failedOrders || 0}</span>
                            <span className="text-blue-600">👤 {day.usersCreated || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Processing Summary</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="font-medium">
                          {stats?.totalWebhooks > 0 
                            ? Math.round((stats.successfulOrders / stats.totalWebhooks) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orders Without Users</span>
                        <span className="font-medium">{stats?.ordersWithoutUsers || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed Webhooks</span>
                        <span className="font-medium">{stats?.failedWebhooks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Alerts Created Today</span>
                        <span className="font-medium">{stats?.alertsCreated || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Webhook Details Modal */}
        {selectedWebhook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Webhook Details - Order #{selectedWebhook.orderNumber}</h3>
                  <button onClick={() => setSelectedWebhook(null)} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {/* Processing Summary */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Processing Summary</h4>
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <StatusBadge status={selectedWebhook.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Processing Time</span>
                      <span className="font-medium">{selectedWebhook.processingTimeMs}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>User Action</span>
                      <span className="font-medium">
                        {selectedWebhook.userCreated ? '🆕 Created New User' :
                         selectedWebhook.userFound ? '✅ Found Existing User' :
                         '❌ No User Action'}
                      </span>
                    </div>
                    {selectedWebhook.userId && (
                      <div className="flex items-center justify-between">
                        <span>User ID</span>
                        <span className="font-mono text-sm">{selectedWebhook.userId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Information */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Email Information</h4>
                  <div className="bg-gray-50 rounded p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Recipient Email</span>
                      <span className={selectedWebhook.recipientEmail ? 'font-medium' : 'text-gray-400'}>
                        {selectedWebhook.recipientEmail || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Purchaser Email</span>
                      <span className={selectedWebhook.purchaserEmail ? 'font-medium' : 'text-gray-400'}>
                        {selectedWebhook.purchaserEmail || 'Not Provided'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email Used</span>
                      <span className="font-medium">
                        {selectedWebhook.emailUsed === 'recipient' ? '📧 Recipient Email' :
                         selectedWebhook.emailUsed === 'purchaser' ? '💳 Purchaser Email' :
                         '❌ No Valid Email'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Note Attributes */}
                {selectedWebhook.noteAttributes && selectedWebhook.noteAttributes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Checkout Form Data</h4>
                    <div className="bg-gray-50 rounded p-4 space-y-2">
                      {selectedWebhook.noteAttributes.map((attr, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                          <span className="font-medium">{attr.name}:</span>
                          <span className="text-right ml-4">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors and Warnings */}
                {(selectedWebhook.errors.length > 0 || selectedWebhook.warnings.length > 0) && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Issues</h4>
                    <div className="space-y-2">
                      {selectedWebhook.errors.map((error, idx) => (
                        <div key={idx} className="bg-red-50 text-red-700 p-3 rounded">
                          ❌ {error}
                        </div>
                      ))}
                      {selectedWebhook.warnings.map((warning, idx) => (
                        <div key={idx} className="bg-yellow-50 text-yellow-700 p-3 rounded">
                          ⚠️ {warning}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Payload */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Full Webhook Payload</h4>
                    <button
                      onClick={() => setExpandedPayload(!expandedPayload)}
                      className="text-emerald-600 hover:text-emerald-700 flex items-center"
                    >
                      {expandedPayload ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                      {expandedPayload ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  {expandedPayload && (
                    <div className="bg-gray-900 text-gray-100 rounded p-4 overflow-auto max-h-96">
                      <pre className="text-xs">
                        {JSON.stringify(selectedWebhook.fullPayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyWebhookMonitor;