import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { CSVLink } from "react-csv";

const ContractorInvoiceSummary = () => {
  const [invoicesData, setInvoicesData] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState("all");
  const [summaryData, setSummaryData] = useState({
    contractors: {},
    totalUnpaid: 0,
  });

  useEffect(() => {
    const fetchInvoicesData = async () => {
      const db = getDatabase();
      const invoicesRef = ref(db, 'invoices');
      try {
        const snapshot = await get(invoicesRef);
        if (snapshot.exists()) {
          setInvoicesData(snapshot.val());
        } else {
          console.log('No invoices data available');
        }
      } catch (error) {
        console.error('Error fetching invoices data:', error);
      }
    };

    fetchInvoicesData();
  }, []);

  useEffect(() => {
    if (invoicesData) {
      calculateSummaryData();
    }
  }, [invoicesData, selectedContractor]);

  const calculateSummaryData = () => {
    const contractors = {};
    let totalUnpaid = 0;

    Object.entries(invoicesData).forEach(([contractorName, contractorInvoices]) => {
      contractors[contractorName] = { invoices: [] };

      Object.entries(contractorInvoices).forEach(([date, invoices]) => {
        Object.entries(invoices).forEach(([invoiceId, invoice]) => {
          const invoiceTotal = parseFloat(invoice.total);
          const isPaid = invoice.isPaid || false;

          // Include the Firebase-generated ID in the invoice object
          contractors[contractorName].invoices.push({
            firebaseId: invoiceId, // Store the Firebase-generated ID
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.invoiceDate,
            dueDate: invoice.dueDate,
            total: invoiceTotal,
            isPaid: isPaid,
            fileUrl: invoice.fileUrl,
            pdfUrl: invoice.pdfUrl,
          });

          if (!isPaid) {
            totalUnpaid += invoiceTotal;
          }
        });
      });
    });

    setSummaryData({ contractors, totalUnpaid });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handlePaymentToggle = async (contractorName, invoiceDate, firebaseId, currentStatus) => {
    const db = getDatabase();
    const invoiceRef = ref(db, `invoices/${contractorName}/${invoiceDate}/${firebaseId}`);
    
    try {
      await update(invoiceRef, { isPaid: !currentStatus });
      // Update local state
      setInvoicesData(prevData => ({
        ...prevData,
        [contractorName]: {
          ...prevData[contractorName],
          [invoiceDate]: {
            ...prevData[contractorName][invoiceDate],
            [firebaseId]: {
              ...prevData[contractorName][invoiceDate][firebaseId],
              isPaid: !currentStatus
            }
          }
        }
      }));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const prepareCSVData = () => {
    if (selectedContractor === "all") {
      const contractorData = Object.entries(summaryData.contractors).flatMap(([contractor, data]) =>
        data.invoices.map(invoice => [
          contractor.replace(/_/g, ' '),
          invoice.invoiceNumber,
          formatDate(invoice.date),
          formatDate(invoice.dueDate),
          invoice.total.toFixed(2),
          invoice.isPaid ? 'Paid' : 'Unpaid',
          invoice.fileUrl ? 'Yes' : 'No',
          invoice.pdfUrl ? 'Yes' : 'No'
        ])
      );

      return [
        ['Contractor Invoice Summary'],
        ['Contractor', 'Invoice Number', 'Submission Date', 'Due Date', 'Total', 'Status', 'Original Invoice', 'Generated Invoice'],
        ...contractorData,
        [],
        ['Total Unpaid', summaryData.totalUnpaid.toFixed(2)]
      ];
    } else {
      const contractorData = summaryData.contractors[selectedContractor].invoices.map(invoice => [
        invoice.invoiceNumber,
        formatDate(invoice.date),
        formatDate(invoice.dueDate),
        invoice.total.toFixed(2),
        invoice.isPaid ? 'Paid' : 'Unpaid',
        invoice.fileUrl ? 'Yes' : 'No',
        invoice.pdfUrl ? 'Yes' : 'No'
      ]);

      return [
        [`Invoice Summary for ${selectedContractor.replace(/_/g, ' ')}`],
        ['Invoice Number', 'Submission Date', 'Due Date', 'Total', 'Status', 'Original Invoice', 'Generated Invoice'],
        ...contractorData
      ];
    }
  };

  if (!invoicesData) {
    return (
      <Card className="max-w-4xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Contractor Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading invoice data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Contractor Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Select 
            onValueChange={(value) => setSelectedContractor(value)} 
            value={selectedContractor}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a contractor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contractors</SelectItem>
              {Object.keys(summaryData.contractors).map((contractor) => (
                <SelectItem key={contractor} value={contractor}>
                  {contractor.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CSVLink 
            data={prepareCSVData()} 
            filename={`contractor_invoice_summary_${selectedContractor}.csv`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Export CSV
          </CSVLink>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {selectedContractor === "all" && <TableHead>Contractor</TableHead>}
              <TableHead>Invoice Number</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Files</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(summaryData.contractors)
              .filter(([contractor]) => selectedContractor === "all" || contractor === selectedContractor)
              .flatMap(([contractor, data]) =>
                data.invoices.map((invoice) => (
                  // Use the Firebase-generated ID in the key
                  <TableRow 
                    key={`${contractor}-${invoice.firebaseId}`} 
                    className={!invoice.isPaid ? "bg-red-100" : ""}
                  >
                    {selectedContractor === "all" && <TableCell>{contractor.replace(/_/g, ' ')}</TableCell>}
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Checkbox
                        checked={invoice.isPaid}
                        onCheckedChange={() => handlePaymentToggle(
                          contractor, 
                          invoice.date, 
                          invoice.firebaseId,  // Use Firebase ID here
                          invoice.isPaid
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.fileUrl && (
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => window.open(invoice.fileUrl, '_blank')}
                        >
                          Original Invoice
                        </Button>
                      )}
                      {invoice.fileUrl && invoice.pdfUrl && " | "}
                      {invoice.pdfUrl && (
                        <Button
                          variant="link"
                          className="p-0 h-auto font-normal"
                          onClick={() => window.open(invoice.pdfUrl, '_blank')}
                        >
                          Generated Invoice
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
          </TableBody>
        </Table>

        <div className="mt-6">
          <p className="text-lg">
            <strong>Total Unpaid:</strong> {formatCurrency(summaryData.totalUnpaid)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractorInvoiceSummary;
