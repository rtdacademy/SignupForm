import React, { useState, useEffect } from 'react';
import { getDatabase, ref as dbRef, push, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaFileInvoiceDollar, FaFilePdf, FaUpload, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";

const ContractorInvoiceForm = () => {
  const [formData, setFormData] = useState({
    contractorOrCompanyName: '',
    address: '',
    invoiceDate: '',
    dueDate: '',
    invoiceNumber: '',
    lineItems: [{ description: '', rate: '', quantity: '', amount: '' }],
    gstPercent: '5',
    gstAmount: '',
    includeGst: false,
    includeTerms: false,
    currency: 'CAD',
    terms: '',
    fileUrl: '',
    uploadedFileTotal: ''
  });
  const [existingNames, setExistingNames] = useState([]);
  const [isFileUpload, setIsFileUpload] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    generateInvoiceNumber();
    fetchExistingNames();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [formData.lineItems, formData.includeGst, formData.gstPercent, formData.uploadedFileTotal]);

  const calculateTotal = () => {
    if (isFileUpload) {
      setTotal(parseFloat(formData.uploadedFileTotal) || 0);
    } else {
      const subtotal = formData.lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const gstAmount = formData.includeGst ? subtotal * (parseFloat(formData.gstPercent) / 100) : 0;
      const newTotal = subtotal + gstAmount;
      setTotal(newTotal);
      setFormData(prev => ({ ...prev, gstAmount: gstAmount.toFixed(2) }));
    }
  };

  const fetchExistingNames = async () => {
    const db = getDatabase();
    const namesRef = dbRef(db, 'invoices');
    const snapshot = await get(namesRef);
    if (snapshot.exists()) {
      const names = Object.keys(snapshot.val()).map(name => name.replace(/_/g, ' '));
      setExistingNames(names);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index][field] = value;
    if (field === 'rate' || field === 'quantity') {
      const rate = parseFloat(newLineItems[index].rate) || 0;
      const quantity = parseFloat(newLineItems[index].quantity) || 0;
      newLineItems[index].amount = (rate * quantity).toFixed(2);
    }
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', rate: '', quantity: '', amount: '' }]
    }));
  };

  const removeLineItem = (index) => {
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lineItems: newLineItems }));
  };

  const handleFileUpload = async (file) => {
    const storage = getStorage();
    const fileRef = storageRef(storage, `invoices/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);
    setFormData(prevState => ({
      ...prevState,
      fileUrl: downloadUrl
    }));
  };

  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prevState => ({
      ...prevState,
      invoiceNumber: `${prefix}-${timestamp}-${random}`
    }));
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Invoice', 105, 15, null, null, 'center');
    
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${formData.invoiceNumber}`, 20, 30);
    doc.text(`Date: ${formData.invoiceDate}`, 20, 40);
    doc.text(`Due Date: ${formData.dueDate}`, 20, 50);
    doc.text(`From: ${formData.contractorOrCompanyName.replace(/_/g, ' ')}`, 20, 60);
    doc.text(`Address: ${formData.address}`, 20, 70);
    
    // Add RTD Academy information
    doc.setFontSize(12);
    doc.text('Invoice To:', 120, 30);
    doc.text('RTD Academy', 120, 40);
    doc.text('5 Crawford Street', 120, 50);
    doc.text('Red Deer, AB T4P2G4', 120, 60);
    doc.text('kyle@rtdacademy.com', 120, 70);
    
    const tableData = isFileUpload 
      ? [['Uploaded Invoice', `${formData.currency} ${formData.uploadedFileTotal}`]]
      : formData.lineItems.map(item => [item.description, item.rate, item.quantity, `${formData.currency} ${item.amount}`]);

    if (formData.includeGst && !isFileUpload) {
      tableData.push(['GST', '', '', `${formData.currency} ${formData.gstAmount}`]);
    }
    tableData.push(['Total', '', '', `${formData.currency} ${total.toFixed(2)}`]);
    
    doc.autoTable({
      startY: 80,
      head: [['Description', 'Rate', 'Quantity', 'Amount']],
      body: tableData,
    });
    
    if (formData.includeTerms) {
      doc.text(`Terms: ${formData.terms}`, 20, doc.lastAutoTable.finalY + 10);
    }
    
    const pdfBlob = doc.output('blob');
    const storage = getStorage();
    const pdfRef = storageRef(storage, `invoices/${formData.invoiceNumber}.pdf`);
    await uploadBytes(pdfRef, pdfBlob);
    const pdfDownloadUrl = await getDownloadURL(pdfRef);
    setPdfUrl(pdfDownloadUrl);
    return pdfDownloadUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getDatabase();
    const storedName = formData.contractorOrCompanyName.replace(/ /g, '_');
    
    const pdfDownloadUrl = await generatePDF();

    const invoiceData = {
      ...formData,
      contractorOrCompanyName: storedName,
      pdfUrl: pdfDownloadUrl,
      total: total.toFixed(2)
    };

    try {
      const invoicesRef = dbRef(db, `invoices/${storedName}/${formData.invoiceDate}`);
      await push(invoicesRef, invoiceData);
      setIsSubmitted(true);

      setFormData({
        contractorOrCompanyName: '',
        address: '',
        invoiceDate: '',
        dueDate: '',
        invoiceNumber: '',
        lineItems: [{ description: '', rate: '', quantity: '', amount: '' }],
        gstPercent: '5',
        gstAmount: '',
        includeGst: false,
        includeTerms: false,
        currency: 'CAD',
        terms: '',
        fileUrl: '',
        uploadedFileTotal: ''
      });
      generateInvoiceNumber();
      setIsAddingNew(false);
      setIsFileUpload(false);
      setTotal(0);
    } catch (error) {
      console.error('Error submitting invoice:', error);
      alert('Error submitting invoice. Please try again.');
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setPdfUrl('');
    generateInvoiceNumber();
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-4xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center text-green-600">
            <FaCheckCircle className="mr-2" /> Invoice Submitted Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Your invoice has been submitted successfully.</p>
          <p>Invoice Number: {formData.invoiceNumber}</p>
          <div className="flex space-x-4">
            <Button onClick={() => window.open(pdfUrl, '_blank')}>
              <FaFilePdf className="mr-2" /> View PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <FaFileInvoiceDollar className="mr-2" /> Submit Contractor Invoice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          defaultValue="form"
          className="mb-6" 
          onValueChange={(value) => setIsFileUpload(value === 'upload')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="form" id="form" />
            <Label htmlFor="form">Fill out form</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload">Upload invoice file</Label>
          </div>
        </RadioGroup>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="contractorOrCompanyName">Contractor or Company Name</Label>
            <Select
              onValueChange={(value) => {
                if (value === 'add_new') {
                  setIsAddingNew(true);
                  handleChange('contractorOrCompanyName', '');
                } else {
                  setIsAddingNew(false);
                  handleChange('contractorOrCompanyName', value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a name" />
              </SelectTrigger>
              <SelectContent>
                {existingNames.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
                <SelectItem value="add_new">Add New</SelectItem>
              </SelectContent>
            </Select>
            {isAddingNew && (
              <>
                <Input
                  type="text"
                  placeholder="Enter new name"
                  value={formData.contractorOrCompanyName}
                  onChange={(e) => handleChange('contractorOrCompanyName', e.target.value)}
                  className="mt-2"
                />
                <Input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="mt-2"
                />
              </>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Invoice To:</h3>
            <p>RTD Academy</p>
            <p>5 Crawford Street</p>
            <p>Red Deer, AB T4P2G4</p>
            <p>kyle@rtdacademy.com</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                type="date"
                id="invoiceDate"
                value={formData.invoiceDate}
                onChange={(e) => handleChange('invoiceDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              type="text"
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              required
            />
          </div>

          {isFileUpload ? (
            <div>
              <Label htmlFor="fileUpload">Upload Invoice File</Label>
              <Input
                id="fileUpload"
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="mt-1"
              />
              <Label htmlFor="uploadedFileTotal" className="mt-4">Total Amount</Label>
              <Input
               type="number"
               id="uploadedFileTotal"
               value={formData.uploadedFileTotal}
               onChange={(e) => handleChange('uploadedFileTotal', e.target.value)}
               placeholder="Enter total amount"
               step="0.01"
               required
               />
             </div>
           ) : (
             <div>
               <Label>Line Items</Label>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-1/2">Description</TableHead>
                     <TableHead>Rate</TableHead>
                     <TableHead>Quantity</TableHead>
                     <TableHead>Amount</TableHead>
                     <TableHead></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {formData.lineItems.map((item, index) => (
                     <TableRow key={index}>
                       <TableCell className="w-1/2">
                         <Textarea
                           value={item.description}
                           onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                           placeholder="Description"
                           rows={3}
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={item.rate}
                           onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                           placeholder="Rate"
                           step="0.01"
                           className="w-20"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={item.quantity}
                           onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                           placeholder="Qty"
                           step="1"
                           className="w-16"
                         />
                       </TableCell>
                       <TableCell>
                         <Input
                           type="number"
                           value={item.amount}
                           readOnly
                           placeholder="Amount"
                           className="w-24"
                         />
                       </TableCell>
                       <TableCell>
                         {index > 0 && (
                           <Button type="button" variant="ghost" onClick={() => removeLineItem(index)}>
                             <FaTrash />
                           </Button>
                         )}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
               <Button type="button" variant="outline" onClick={addLineItem} className="mt-2">
                 <FaPlus className="mr-2" /> Add Line Item
               </Button>
             </div>
           )}
  
           <div>
             <Label htmlFor="currency">Currency</Label>
             <Select onValueChange={(value) => handleChange('currency', value)}>
               <SelectTrigger>
                 <SelectValue placeholder="Select currency" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="CAD">CAD</SelectItem>
                 <SelectItem value="USD">USD</SelectItem>
               </SelectContent>
             </Select>
           </div>
  
           {!isFileUpload && (
             <div className="flex items-center space-x-2">
               <Checkbox
                 id="includeGst"
                 checked={formData.includeGst}
                 onCheckedChange={(checked) => handleChange('includeGst', checked)}
               />
               <Label htmlFor="includeGst">Include GST</Label>
             </div>
           )}
  
           {formData.includeGst && !isFileUpload && (
             <div>
               <Label htmlFor="gstPercent">GST Percentage</Label>
               <Input
                 type="number"
                 id="gstPercent"
                 value={formData.gstPercent}
                 onChange={(e) => handleChange('gstPercent', e.target.value)}
                 step="0.1"
                 min="0"
                 max="100"
               />
             </div>
           )}
  
           <div className="flex items-center space-x-2">
             <Checkbox
               id="includeTerms"
               checked={formData.includeTerms}
               onCheckedChange={(checked) => handleChange('includeTerms', checked)}
             />
             <Label htmlFor="includeTerms">Include Terms and Conditions</Label>
           </div>
  
           {formData.includeTerms && (
             <div>
               <Label htmlFor="terms">Terms and Conditions</Label>
               <Textarea
                 id="terms"
                 value={formData.terms}
                 onChange={(e) => handleChange('terms', e.target.value)}
               />
             </div>
           )}
  
           <div className="text-right">
             <p className="text-lg font-semibold">Total: {formData.currency} {total.toFixed(2)}</p>
             {formData.includeGst && !isFileUpload && (
               <p className="text-sm text-gray-600">
                 (Includes GST: {formData.currency} {formData.gstAmount})
               </p>
             )}
           </div>
  
           <div>
             <Button type="submit">Submit Invoice</Button>
           </div>
         </form>
       </CardContent>
     </Card>
   );
  };
  
  export default ContractorInvoiceForm;