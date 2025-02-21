import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { getDatabase, ref, get, set } from 'firebase/database';
import { toast, Toaster } from "sonner";
import { Loader2 } from 'lucide-react';

const PricingComponent = () => {
  // Updated state to include lockoutAfterDays for all pricing types
  const [adultPricing, setAdultPricing] = useState({
    trialPeriodDays: '',
    oneTimePrice: '',
    subscriptionTotal: '',
    subscriptionLengthMonths: '',
    monthlyPayment: '',
    rejoinFee: '',
    lockoutAfterDays: '' // Added lockoutAfterDays
  });

  const [internationalPricing, setInternationalPricing] = useState({
    trialPeriodDays: '',
    oneTimePrice: '',
    subscriptionTotal: '',
    subscriptionLengthMonths: '',
    monthlyPayment: '',
    rejoinFee: '',
    lockoutAfterDays: '' // Added lockoutAfterDays
  });

  const [nonPrimaryPricing, setNonPrimaryPricing] = useState({
    rejoinFee: '',
    lockoutAfterDays: '' // Added lockoutAfterDays
  });

  const [homeEducationPricing, setHomeEducationPricing] = useState({
    rejoinFee: '',
    lockoutAfterDays: '' // Added lockoutAfterDays
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPricingData = async () => {
      const db = getDatabase();
      try {
        const [
          adultSnapshot,
          internationalSnapshot,
          nonPrimarySnapshot,
          homeEdSnapshot
        ] = await Promise.all([
          get(ref(db, 'pricing/adultStudents')),
          get(ref(db, 'pricing/internationalStudents')),
          get(ref(db, 'pricing/nonPrimaryStudents')),
          get(ref(db, 'pricing/homeEducationStudents'))
        ]);

        if (adultSnapshot.exists()) {
          setAdultPricing(prev => ({
            ...prev,
            ...adultSnapshot.val()
          }));
        }

        if (internationalSnapshot.exists()) {
          setInternationalPricing(prev => ({
            ...prev,
            ...internationalSnapshot.val()
          }));
        }

        if (nonPrimarySnapshot.exists()) {
          setNonPrimaryPricing(prev => ({
            ...prev,
            ...nonPrimarySnapshot.val()
          }));
        }

        if (homeEdSnapshot.exists()) {
          setHomeEducationPricing(prev => ({
            ...prev,
            ...homeEdSnapshot.val()
          }));
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        toast.error("Failed to fetch pricing data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  // Updated handlePaidStudentSave to include lockoutAfterDays
  const handlePaidStudentSave = async (type) => {
    const pricing = type === 'adult' ? adultPricing : internationalPricing;
    
    // Added 'rejoinFee' and 'lockoutAfterDays' to required fields
    const requiredFields = [
      'trialPeriodDays', 
      'oneTimePrice', 
      'subscriptionTotal', 
      'subscriptionLengthMonths',
      'rejoinFee',
      'lockoutAfterDays' // Added lockoutAfterDays
    ];
    const missingFields = requiredFields.filter(field => !pricing[field]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

    setIsSaving(true);
    const db = getDatabase();
    const pricingRef = ref(db, `pricing/${type}Students`);

    try {
      await set(pricingRef, {
        ...pricing,
        lastUpdated: Date.now()
      });
      
      toast.success("Pricing information has been updated.");
    } catch (error) {
      console.error('Error saving pricing data:', error);
      toast.error("Failed to save pricing data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFreeStudentSave = async (type) => {
    const pricing = type === 'nonPrimary' ? nonPrimaryPricing : homeEducationPricing;
    
    // Added 'lockoutAfterDays' to required fields
    const requiredFields = [
      'rejoinFee',
      'lockoutAfterDays' // Added lockoutAfterDays
    ];
    const missingFields = requiredFields.filter(field => !pricing[field]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields before saving.");
      return;
    }

    setIsSaving(true);
    const db = getDatabase();
    const path = type === 'nonPrimary' ? 'nonPrimaryStudents' : 'homeEducationStudents';
    const pricingRef = ref(db, `pricing/${path}`);
    
    try {
      await set(pricingRef, {
        ...pricing,
        lastUpdated: Date.now()
      });
      
      toast.success("Pricing information has been updated.");
    } catch (error) {
      console.error('Error saving pricing data:', error);
      toast.error("Failed to save pricing data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateMonthlyPayment = (type, total, months) => {
    if (total && months) {
      const monthly = parseFloat((total / months).toFixed(2));
      const setState = type === 'adult' ? setAdultPricing : setInternationalPricing;
      setState(prev => ({
        ...prev,
        monthlyPayment: monthly
      }));
    }
  };

  // Updated to handle rejoinFee and lockoutAfterDays input
  const handlePaidStudentInputChange = (type, field, value) => {
    let parsedValue = value;
    const setState = type === 'adult' ? setAdultPricing : setInternationalPricing;
    const currentState = type === 'adult' ? adultPricing : internationalPricing;
    
    if (['trialPeriodDays', 'subscriptionLengthMonths', 'lockoutAfterDays'].includes(field)) {
      parsedValue = value ? parseInt(value) : '';
    } else if (['oneTimePrice', 'subscriptionTotal', 'rejoinFee'].includes(field)) {
      parsedValue = value ? parseFloat(value) : '';
    }

    setState(prev => ({
      ...prev,
      [field]: parsedValue
    }));

    if (field === 'subscriptionTotal' || field === 'subscriptionLengthMonths') {
      const total = field === 'subscriptionTotal' ? parsedValue : currentState.subscriptionTotal;
      const months = field === 'subscriptionLengthMonths' ? parsedValue : currentState.subscriptionLengthMonths;
      updateMonthlyPayment(type, total, months);
    }
  };

  const handleFreeStudentInputChange = (type, field, value) => {
    let parsedValue = value;
    if (field === 'lockoutAfterDays') {
      parsedValue = value ? parseInt(value) : '';
    } else {
      parsedValue = value ? parseFloat(value) : '';
    }
    const setState = type === 'nonPrimary' ? setNonPrimaryPricing : setHomeEducationPricing;
    
    setState(prev => ({
      ...prev,
      [field]: parsedValue
    }));
  };

  // Updated form to include rejoinFee and lockoutAfterDays
  const renderPaidStudentPricingForm = (type, pricing) => (
    <Card>
      <CardHeader>
        <CardTitle>{type === 'adult' ? 'Adult' : 'International'} Student Pricing</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set and manage pricing information for {type === 'adult' ? 'adult' : 'international'} students
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor={`${type}TrialPeriod`}>
              Trial Period (Days) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${type}TrialPeriod`}
              type="number"
              value={pricing.trialPeriodDays}
              onChange={(e) => handlePaidStudentInputChange(type, 'trialPeriodDays', e.target.value)}
              placeholder="Enter trial period in days"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${type}OneTimePrice`}>
              One-Time Payment (CAD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${type}OneTimePrice`}
              type="number"
              value={pricing.oneTimePrice}
              onChange={(e) => handlePaidStudentInputChange(type, 'oneTimePrice', e.target.value)}
              placeholder="Enter one-time payment amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${type}SubscriptionTotal`}>
              Subscription Total (CAD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${type}SubscriptionTotal`}
              type="number"
              value={pricing.subscriptionTotal}
              onChange={(e) => handlePaidStudentInputChange(type, 'subscriptionTotal', e.target.value)}
              placeholder="Enter total subscription amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${type}SubscriptionLength`}>
              Subscription Length (Months) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${type}SubscriptionLength`}
              type="number"
              value={pricing.subscriptionLengthMonths}
              onChange={(e) => handlePaidStudentInputChange(type, 'subscriptionLengthMonths', e.target.value)}
              placeholder="Enter subscription length"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${type}MonthlyPayment`}>Monthly Payment (CAD)</Label>
            <Input
              id={`${type}MonthlyPayment`}
              type="number"
              value={pricing.monthlyPayment}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${type}RejoinFee`}>
              Course Rejoin Fee (CAD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${type}RejoinFee`}
              type="number"
              value={pricing.rejoinFee}
              onChange={(e) => handlePaidStudentInputChange(type, 'rejoinFee', e.target.value)}
              placeholder="Enter rejoin fee amount"
              min="0"
              step="0.01"
            />
            <p className="text-sm text-muted-foreground mt-2">
              This fee will be charged when students need to regain access to their course after falling behind.
            </p>
          </div>

          {/* New Lockout After Days Field */}
          <div className="space-y-2">
            <Label htmlFor={`${type}LockoutAfterDays`}>
              Lockout After (Days) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${type}LockoutAfterDays`}
              type="number"
              value={pricing.lockoutAfterDays}
              onChange={(e) => handlePaidStudentInputChange(type, 'lockoutAfterDays', e.target.value)}
              placeholder="Enter number of days after which lockout occurs"
              min="0"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Specifies the number of days after which a student will be locked out.
            </p>
          </div>
        </div>

        <Button 
          onClick={() => handlePaidStudentSave(type)}
          className="mt-6 w-full md:w-auto"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderFreeStudentPricingForm = (type, pricing) => (
    <Card>
      <CardHeader>
        <CardTitle>{type === 'nonPrimary' ? 'Non-Primary' : 'Home Education'} Student Pricing</CardTitle>
        <p className="text-sm text-muted-foreground">
          Set rejoin fee and lockout settings for {type === 'nonPrimary' ? 'non-primary' : 'home education'} students who need to regain access
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 max-w-md">
          <Label htmlFor={`${type}RejoinFee`}>
            Course Rejoin Fee (CAD) <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${type}RejoinFee`}
            type="number"
            value={pricing.rejoinFee}
            onChange={(e) => handleFreeStudentInputChange(type, 'rejoinFee', e.target.value)}
            placeholder="Enter rejoin fee amount"
            min="0"
            step="0.01"
          />
          <p className="text-sm text-muted-foreground mt-2">
            This fee will be charged when students need to regain access to their course after falling behind.
          </p>
        </div>

        {/* New Lockout After Days Field */}
        <div className="space-y-2 max-w-md">
          <Label htmlFor={`${type}LockoutAfterDays`}>
            Lockout After (Days) <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${type}LockoutAfterDays`}
            type="number"
            value={pricing.lockoutAfterDays}
            onChange={(e) => handleFreeStudentInputChange(type, 'lockoutAfterDays', e.target.value)}
            placeholder="Enter number of days after which lockout occurs"
            min="0"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Specifies the number of days after which a student will be locked out.
          </p>
        </div>

        <Button 
          onClick={() => handleFreeStudentSave(type)}
          className="mt-6 w-full md:w-auto"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">Loading pricing information...</div>;
  }

  return (
    <>
     
      <div className="container mx-auto p-4">
        <Tabs defaultValue="adult" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="adult">Adult</TabsTrigger>
            <TabsTrigger value="international">International</TabsTrigger>
            <TabsTrigger value="non-primary">Non-Primary</TabsTrigger>
            <TabsTrigger value="home-education">Home Education</TabsTrigger>
          </TabsList>
          
          <TabsContent value="adult">
            {renderPaidStudentPricingForm('adult', adultPricing)}
          </TabsContent>
          
          <TabsContent value="international">
            {renderPaidStudentPricingForm('international', internationalPricing)}
          </TabsContent>

          <TabsContent value="non-primary">
            {renderFreeStudentPricingForm('nonPrimary', nonPrimaryPricing)}
          </TabsContent>

          <TabsContent value="home-education">
            {renderFreeStudentPricingForm('homeEducation', homeEducationPricing)}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default PricingComponent;
