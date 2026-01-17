"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { patentLookupApi, sellerSignupApi } from "@/utils/api";

const SellerSignupWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Patent Status
  const [hasPatent, setHasPatent] = useState(null);
  const [patentNumber, setPatentNumber] = useState("");
  
  // Step 2: Patent Data
  const [patentData, setPatentData] = useState(null);
  const [manualPatentData, setManualPatentData] = useState({
    title: "",
    inventor: "",
    assignee: "",
    filingDate: "",
    issueDate: "",
    abstract: "",
    claims: "",
    description: "",
  });
  
  // Step 3: Images
  const [patentImages, setPatentImages] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  
  // Step 4: Membership Plan
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Step 5: Additional Services
  const [selectedServices, setSelectedServices] = useState({
    drawing2D3D: false,
    evaluation: null, // 'good', 'better', 'best'
    pitchDeck: false,
  });
  
  // Step 6: Cart Summary
  const [cartTotal, setCartTotal] = useState(0);

  const handlePatentLookup = async () => {
    if (!patentNumber.trim()) {
      toast.error("Please enter a patent number");
      return;
    }
    setLoading(true);
    try {
      const response = await patentLookupApi.lookup({ patent_number: patentNumber });
      if (response.data.error === false && response.data.data) {
        setPatentData(response.data.data);
        setCurrentStep(3);
        toast.success("Patent found! Data auto-populated.");
      } else {
        toast.info("Patent not found. Please enter manually.");
        setCurrentStep(2); // Manual entry
      }
    } catch (error) {
      console.error("Patent lookup error:", error);
      toast.error("Failed to lookup patent. Please enter manually.");
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (files, type) => {
    const fileArray = Array.from(files);
    if (type === "patent") {
      setPatentImages([...patentImages, ...fileArray]);
    } else {
      setAdditionalImages([...additionalImages, ...fileArray]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedPlan === "monthly") total += 29;
    if (selectedPlan === "yearly") total += 199;
    if (selectedServices.drawing2D3D) total += 20;
    if (selectedServices.evaluation === "good") total += 250;
    if (selectedServices.evaluation === "better") total += 500;
    if (selectedServices.evaluation === "best") total += 1999;
    if (selectedServices.pitchDeck) total += 0; // Price TBD
    return total;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (hasPatent === null) {
        toast.error("Please select if you have a patent");
        return;
      }
      if (hasPatent && !patentNumber.trim()) {
        toast.error("Please enter your patent number");
        return;
      }
      if (hasPatent) {
        handlePatentLookup();
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Validate manual entry
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (patentImages.length === 0) {
        toast.error("Please upload at least one patent image");
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!selectedPlan) {
        toast.error("Please select a membership plan");
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCartTotal(calculateTotal());
      setCurrentStep(6);
    } else if (currentStep === 6) {
      // Submit all data
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append patent data
      if (patentData) {
        formData.append("has_patent", "true");
        formData.append("patent_number", patentNumber);
        formData.append("patent_data", JSON.stringify(patentData));
      } else {
        formData.append("has_patent", "false");
        formData.append("patent_data", JSON.stringify(manualPatentData));
      }
      
      // Append images
      patentImages.forEach((img, idx) => {
        formData.append(`patent_images[${idx}]`, img);
      });
      additionalImages.forEach((img, idx) => {
        formData.append(`additional_images[${idx}]`, img);
      });
      
      // Append membership plan
      formData.append("membership_plan", selectedPlan);
      
      // Append services
      formData.append("selected_services", JSON.stringify(selectedServices));
      
      const response = await sellerSignupApi.submit(formData);
      
      if (response.data.error === false) {
        toast.success("Account created successfully! Redirecting to dashboard...");
        if (onComplete) onComplete();
      } else {
        toast.error(response.data.message || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seller Signup</h1>
        <p className="text-muted-foreground">List your patent and connect with buyers</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= step
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step ? <CheckCircle2 size={20} /> : step}
            </div>
            {step < 6 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  currentStep > step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Do you already have a patent?"}
            {currentStep === 2 && "Patent Information"}
            {currentStep === 3 && "Upload Images"}
            {currentStep === 4 && "Choose Membership Plan"}
            {currentStep === 5 && "Additional Services"}
            {currentStep === 6 && "Review & Complete"}
          </CardTitle>
          <CardDescription>
            Step {currentStep} of 6
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Patent Status */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={hasPatent === true ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setHasPatent(true)}
                >
                  Yes, I have a patent
                </Button>
                <Button
                  variant={hasPatent === false ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setHasPatent(false)}
                >
                  No, enter manually
                </Button>
              </div>
              {hasPatent === true && (
                <div className="space-y-2">
                  <Label htmlFor="patentNumber">USPTO Patent Number</Label>
                  <Input
                    id="patentNumber"
                    placeholder="e.g., US12345678"
                    value={patentNumber}
                    onChange={(e) => setPatentNumber(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    We'll automatically pull in patent data from our database
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Patent Data (Manual Entry or Review Auto-populated) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {patentData ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 mb-2">
                    ✓ Patent data found and auto-populated. You can edit if needed.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Please enter your patent information manually.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patent Title</Label>
                  <Input
                    value={patentData?.title || manualPatentData.title}
                    onChange={(e) => {
                      if (patentData) {
                        setPatentData({ ...patentData, title: e.target.value });
                      } else {
                        setManualPatentData({ ...manualPatentData, title: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Inventor Name</Label>
                  <Input
                    value={patentData?.inventor || manualPatentData.inventor}
                    onChange={(e) => {
                      if (patentData) {
                        setPatentData({ ...patentData, inventor: e.target.value });
                      } else {
                        setManualPatentData({ ...manualPatentData, inventor: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Input
                    value={patentData?.assignee || manualPatentData.assignee}
                    onChange={(e) => {
                      if (patentData) {
                        setPatentData({ ...patentData, assignee: e.target.value });
                      } else {
                        setManualPatentData({ ...manualPatentData, assignee: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Filing Date</Label>
                  <Input
                    type="date"
                    value={patentData?.filing_date || manualPatentData.filingDate}
                    onChange={(e) => {
                      if (patentData) {
                        setPatentData({ ...patentData, filing_date: e.target.value });
                      } else {
                        setManualPatentData({ ...manualPatentData, filingDate: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={patentData?.issue_date || manualPatentData.issueDate}
                    onChange={(e) => {
                      if (patentData) {
                        setPatentData({ ...patentData, issue_date: e.target.value });
                      } else {
                        setManualPatentData({ ...manualPatentData, issueDate: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <Label>Abstract</Label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  value={patentData?.abstract || manualPatentData.abstract}
                  onChange={(e) => {
                    if (patentData) {
                      setPatentData({ ...patentData, abstract: e.target.value });
                    } else {
                      setManualPatentData({ ...manualPatentData, abstract: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Image Upload */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Patent Images (Required)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="mb-2">Upload patent images</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, "patent")}
                    className="max-w-xs mx-auto"
                  />
                </div>
                {patentImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {patentImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Patent ${idx + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label>Additional Images (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="mb-2">Upload additional images</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, "additional")}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Membership Plans */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-all ${
                  selectedPlan === "monthly" ? "border-primary border-2" : ""
                }`}
                onClick={() => setSelectedPlan("monthly")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Monthly Plan
                    {selectedPlan === "monthly" && <CheckCircle2 className="text-primary" />}
                  </CardTitle>
                  <CardDescription>$29/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 15-day free trial</li>
                    <li>✓ Cancel anytime</li>
                    <li>✓ List your patent</li>
                    <li>✓ Access to marketplace</li>
                  </ul>
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all ${
                  selectedPlan === "yearly" ? "border-primary border-2" : ""
                }`}
                onClick={() => setSelectedPlan("yearly")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Yearly Plan <span className="text-sm text-green-600">15% OFF</span>
                    {selectedPlan === "yearly" && <CheckCircle2 className="text-primary" />}
                  </CardTitle>
                  <CardDescription>$199/year (Save $149)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✓ 15-day free trial</li>
                    <li>✓ Best value - 15% discount</li>
                    <li>✓ Recommended for serious sellers</li>
                    <li>✓ Full marketplace access</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Additional Services */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-all ${
                  selectedServices.drawing2D3D ? "border-primary border-2" : ""
                }`}
                onClick={() =>
                  setSelectedServices({ ...selectedServices, drawing2D3D: !selectedServices.drawing2D3D })
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    2D/3D Drawing of Your Idea
                    {selectedServices.drawing2D3D && <CheckCircle2 className="text-primary" />}
                  </CardTitle>
                  <CardDescription>$20</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Professional visualization of your patent idea
                  </p>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patent Evaluation by Expert</CardTitle>
                  <CardDescription>Starting at $250</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedServices.evaluation === "good" ? "border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedServices({ ...selectedServices, evaluation: "good" })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Good - Basic Evaluation</p>
                        <p className="text-sm text-muted-foreground">$250 • 2 pages</p>
                      </div>
                      {selectedServices.evaluation === "good" && (
                        <CheckCircle2 className="text-primary" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedServices.evaluation === "better" ? "border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedServices({ ...selectedServices, evaluation: "better" })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Better - Comprehensive</p>
                        <p className="text-sm text-muted-foreground">$500 • 6-20 pages</p>
                      </div>
                      {selectedServices.evaluation === "better" && (
                        <CheckCircle2 className="text-primary" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedServices.evaluation === "best" ? "border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedServices({ ...selectedServices, evaluation: "best" })
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Best - Detailed Report</p>
                        <p className="text-sm text-muted-foreground">$1,999 • 15-30 pages</p>
                      </div>
                      {selectedServices.evaluation === "best" && (
                        <CheckCircle2 className="text-primary" />
                      )}
                    </div>
                  </div>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  selectedServices.pitchDeck ? "border-primary border-2" : ""
                }`}
                onClick={() =>
                  setSelectedServices({ ...selectedServices, pitchDeck: !selectedServices.pitchDeck })
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Professional Pitch Deck
                    {selectedServices.pitchDeck && <CheckCircle2 className="text-primary" />}
                  </CardTitle>
                  <CardDescription>Price TBD</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Perfect for larger investors and partnerships
                  </p>
                  <Button variant="link" size="sm">
                    View Sample
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Review & Complete */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Membership Plan:</span>
                    <span>
                      {selectedPlan === "monthly" ? "$29/month" : "$199/year"}
                    </span>
                  </div>
                  {selectedServices.drawing2D3D && (
                    <div className="flex justify-between">
                      <span>2D/3D Drawing:</span>
                      <span>$20</span>
                    </div>
                  )}
                  {selectedServices.evaluation && (
                    <div className="flex justify-between">
                      <span>Evaluation ({selectedServices.evaluation}):</span>
                      <span>
                        $
                        {selectedServices.evaluation === "good"
                          ? "250"
                          : selectedServices.evaluation === "better"
                          ? "500"
                          : "1,999"}
                      </span>
                    </div>
                  )}
                  {selectedServices.pitchDeck && (
                    <div className="flex justify-between">
                      <span>Pitch Deck:</span>
                      <span>TBD</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${cartTotal}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>What happens next?</strong>
                </p>
                <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                  <li>An account manager will be assigned to help you</li>
                  <li>A sales person will call to confirm everything</li>
                  <li>You'll receive a welcome email with next steps</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={16} />
                  Processing...
                </>
              ) : currentStep === 6 ? (
                <>
                  Complete Signup
                  <ArrowRight className="ml-2" size={16} />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerSignupWizard;
