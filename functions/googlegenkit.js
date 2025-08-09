// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { genkit, z } = require('genkit'); // Using stable genkit package with Zod
const { googleAI } = require('@genkit-ai/googleai');
const fetch = require('node-fetch'); // Add fetch import back
const AI_MODELS = require('./aiSettings');
const { ALBERTA_EDUCATION_STANDARDS, EDUCATION_COMPLIANCE_PROMPT } = require('./prompts/albertaEducationStandards');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Lazy initialization of AI instance to avoid timeouts during deployment
let aiInstance = null;

function initializeAI() {
  if (!aiInstance) {
    console.log('Initializing AI with Genkit and Google AI plugin...');
    
    // Check if Google AI API key is available
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    console.log('Google AI API key available:', !!apiKey);
    
    const ai = genkit({
      plugins: [googleAI()], // No need to pass API key - Genkit reads from environment
    });

    console.log('Genkit AI instance initialized successfully');
    aiInstance = ai;
  }
  return aiInstance;
}

/**
 * Determine content type from file extension or MIME type
 */
const getContentType = (fileType, fileName) => {
  // First, check if we already have a MIME type
  if (fileType && fileType.includes('/')) {
    return fileType;
  }
  
  // Otherwise, try to determine from file extension
  if (fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const contentTypeMap = {
      // Documents
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'rtf': 'application/rtf',
      'odt': 'application/vnd.oasis.opendocument.text',
      
      // Spreadsheets
      'csv': 'text/csv',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ods': 'application/vnd.oasis.opendocument.spreadsheet',
      
      // Presentations
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'odp': 'application/vnd.oasis.opendocument.presentation',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      
      // Video
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      
      // Code files
      'js': 'text/javascript',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'xml': 'application/xml',
    };
    
    return contentTypeMap[extension] || 'application/octet-stream';
  }
  
  return 'application/octet-stream'; // Default binary data
};

/**
 * Schema for receipt analysis results with validation
 */
const ReceiptAnalysisSchema = z.object({
  // Core data fields - nullable and optional for flexibility
  purchaseDate: z.string().nullable().optional().describe('Purchase date in YYYY-MM-DD format, null if not found'),
  totalAmount: z.number().nullable().optional().describe('Total purchase amount as a number (no currency symbols), null if not found'),
  subtotalAmount: z.number().nullable().optional().describe('Subtotal amount before tax, null if not found'),
  taxAmount: z.number().nullable().optional().describe('Tax amount charged, null if not found'),
  vendor: z.string().nullable().optional().describe('Store/vendor name, null if not found'),
  purchaseDescription: z.string().nullable().optional().describe('Description of what was purchased based on items in receipt'),
  
  // Document classification - required
  documentType: z.string().default('other').describe('Type of document detected: receipt, invoice, estimate, statement, other'),
  
  // Validation fields - required for processing
  isValid: z.boolean().default(false).describe('Whether this appears to be a valid purchase receipt (not invoice or estimate)'),
  validationScore: z.number().default(0).describe('Quality score 0-100 for receipt readability and completeness'),
  validationIssues: z.array(z.string()).optional().describe('List of issues found with the receipt'),
  requiresManualReview: z.boolean().default(true).describe('Whether this document requires manual review due to quality or type issues'),
  reviewPriority: z.string().default('medium').describe('Review priority level: high, medium, or low'),
  
  // Additional extracted data - optional
  items: z.array(z.string()).optional().describe('List of purchased items if clearly visible'),
  confidence: z.object({
    date: z.number().optional().describe('Confidence 0-1 for date extraction'),
    amount: z.number().optional().describe('Confidence 0-1 for amount extraction'),
    vendor: z.number().optional().describe('Confidence 0-1 for vendor extraction'),
    description: z.number().optional().describe('Confidence 0-1 for purchase description'),
    tax: z.number().optional().describe('Confidence 0-1 for tax amount extraction')
  }).optional().describe('Confidence scores for each extracted field'),
  
  // Alberta Education Standards Compliance - required fields
  educationComplianceScore: z.number().default(0).describe('Score 0-100 for how well the purchase aligns with Alberta Education reimbursement standards'),
  educationCategory: z.string().default('unclear').describe('Category: recommended, not-recommended, requires-review, or unclear'),
  educationReasoning: z.string().default('').describe('Detailed explanation of compliance score and category assignment'),
  reimbursementEligibility: z.string().default('requires-review').describe('Eligibility: likely-eligible, requires-review, or not-eligible')
});

/**
 * Schema for citizenship document analysis with student verification
 */
const CitizenshipDocumentAnalysisSchema = z.object({
  // Document identification fields
  detectedDocumentType: z.string().default('unknown').describe('Type of document detected: birth_certificate, passport, citizenship_certificate, immigration_document, unknown'),
  documentTypeConfidence: z.number().default(0).describe('Confidence 0-1 in document type classification'),
  
  // Student verification fields
  detectedName: z.string().nullable().optional().describe('Full name as it appears on the document, null if not found'),
  detectedFirstName: z.string().nullable().optional().describe('First name extracted from document'),
  detectedLastName: z.string().nullable().optional().describe('Last name extracted from document'),
  detectedBirthDate: z.string().nullable().optional().describe('Birth date in YYYY-MM-DD format if visible on document'),
  
  // Verification results
  studentNameMatch: z.boolean().default(false).describe('Whether the name on document matches the expected student name'),
  nameMatchConfidence: z.number().default(0).describe('Confidence 0-1 in name matching assessment'),
  nameMatchReasoning: z.string().default('').describe('Explanation of why names do or do not match'),
  
  documentTypeMatch: z.boolean().default(false).describe('Whether detected document type matches expected type'),
  typeMatchConfidence: z.number().default(0).describe('Confidence 0-1 in document type matching'),
  typeMatchReasoning: z.string().default('').describe('Explanation of document type classification'),
  
  // Document quality and validity
  documentQuality: z.number().default(0).describe('Quality score 0-100 for document readability and completeness'),
  isValidDocument: z.boolean().default(false).describe('Whether this appears to be a legitimate citizenship document'),
  validationIssues: z.array(z.string()).optional().describe('List of issues found with the document'),
  
  // Additional extracted information
  issuingAuthority: z.string().nullable().optional().describe('Government body or authority that issued the document'),
  documentNumber: z.string().nullable().optional().describe('Document number if visible and appropriate to extract'),
  issueDate: z.string().nullable().optional().describe('Date document was issued if visible'),
  expiryDate: z.string().nullable().optional().describe('Document expiry date if applicable and visible'),
  
  // Review requirements
  requiresManualReview: z.boolean().default(true).describe('Whether this document requires manual review'),
  reviewPriority: z.string().default('medium').describe('Review priority: high, medium, or low'),
  overallScore: z.number().default(0).describe('Overall verification score 0-100 combining all factors'),
  
  // Confidence scores
  confidence: z.object({
    nameExtraction: z.number().optional().describe('Confidence 0-1 for name extraction accuracy'),
    documentType: z.number().optional().describe('Confidence 0-1 for document type classification'),
    studentMatch: z.number().optional().describe('Confidence 0-1 for student verification'),
    documentAuthenticity: z.number().optional().describe('Confidence 0-1 for document authenticity assessment')
  }).optional().describe('Detailed confidence scores for each analysis aspect')
});

/**
 * Schema for mixed receipt analysis with item-level breakdown
 */
const MixedReceiptAnalysisSchema = z.object({
  // Core receipt data - same as single receipt
  purchaseDate: z.string().nullable().optional().describe('Purchase date in YYYY-MM-DD format, null if not found'),
  totalAmount: z.number().nullable().optional().describe('Total purchase amount as a number (no currency symbols), null if not found'),
  subtotalAmount: z.number().nullable().optional().describe('Subtotal amount before tax, null if not found'),
  taxAmount: z.number().nullable().optional().describe('Tax amount charged, null if not found'),
  vendor: z.string().nullable().optional().describe('Store/vendor name, null if not found'),
  
  // Document classification
  documentType: z.string().default('other').describe('Type of document detected: receipt, invoice, estimate, statement, other'),
  isValid: z.boolean().default(false).describe('Whether this appears to be a valid purchase receipt (not invoice or estimate)'),
  validationScore: z.number().default(0).describe('Quality score 0-100 for receipt readability and completeness'),
  validationIssues: z.array(z.string()).optional().describe('List of issues found with the receipt'),
  requiresManualReview: z.boolean().default(true).describe('Whether this document requires manual review due to quality or type issues'),
  reviewPriority: z.string().default('medium').describe('Review priority level: high, medium, or low'),
  
  // Item-level breakdown - key feature for mixed receipts
  items: z.array(z.object({
    description: z.string().describe('Description of the individual item or service'),
    amount: z.number().describe('Cost of this specific item (excluding tax unless itemized)'),
    quantity: z.number().optional().describe('Quantity purchased if visible'),
    isEducational: z.boolean().describe('Whether this item qualifies for Alberta Education reimbursement'),
    educationCategory: z.string().optional().describe('Education category if educational: books, art_supplies, science_supplies, etc.'),
    complianceScore: z.number().default(0).describe('Education compliance score 0-100 for this specific item'),
    complianceReasoning: z.string().optional().describe('Why this item is or is not educational'),
    confidence: z.number().default(0).describe('Confidence 0-1 in the classification of this item')
  })).describe('Array of individual items found on the receipt'),
  
  // Calculated totals
  educationalTotal: z.number().default(0).describe('Sum of all educational items before tax'),
  nonEducationalTotal: z.number().default(0).describe('Sum of all non-educational items before tax'),
  
  // Overall compliance assessment
  overallEducationComplianceScore: z.number().default(0).describe('Overall compliance score considering all items'),
  recommendedClaimAmount: z.number().default(0).describe('Recommended total amount to claim for reimbursement'),
  
  confidence: z.object({
    date: z.number().optional().describe('Confidence 0-1 for date extraction'),
    amount: z.number().optional().describe('Confidence 0-1 for total amount extraction'),
    vendor: z.number().optional().describe('Confidence 0-1 for vendor extraction'),
    itemBreakdown: z.number().optional().describe('Confidence 0-1 for item-level breakdown accuracy')
  }).optional().describe('Confidence scores for extracted fields')
});

/**
 * System prompt for receipt analysis
 */
const RECEIPT_ANALYSIS_PROMPT = `You are an expert document analyzer specializing in educational reimbursement validation. Your task is to extract information from receipt images and PDFs and determine if they are suitable for reimbursement claims.

Key responsibilities:
1. Extract purchase details: date, amounts (total, subtotal, tax), vendor name
2. Classify the document type (receipt, invoice, estimate, statement, other)
3. Assess validity for reimbursement purposes (receipts are preferred, invoices need review)
4. Extract item details and create purchase descriptions
5. Determine review priority and manual review requirements

Document Type Classification:
- RECEIPT: Proof of completed purchase transaction (good for reimbursement)
- INVOICE: Bill/request for payment (requires manual review)
- ESTIMATE: Quote/price estimate (not valid for reimbursement)
- STATEMENT: Account statement or summary (not valid for reimbursement)
- OTHER: Unidentifiable or different document type

Amount Extraction Guidelines:
- totalAmount: Final amount paid/charged
- subtotalAmount: Amount before taxes/fees
- taxAmount: Sales tax, GST, HST, or similar taxes
- For amounts: Extract as numbers only (no currency symbols)

Validation Scoring (0-100):
- 90-100: Perfect receipt, all information clear, ready for approval
- 70-89: Good receipt, minor issues, low priority review
- 50-69: Acceptable with concerns, medium priority review  
- 30-49: Poor quality or invoice, high priority manual review required
- 0-29: Major issues, invalid document, or estimate - requires manual review

Review Priority Assignment:
- HIGH: Score 0-49, invoices, estimates, missing critical info, major quality issues
- MEDIUM: Score 50-69, minor quality issues, handwritten receipts
- LOW: Score 70-100, clear receipts with all information present

Manual Review Requirements:
- Document is invoice instead of receipt
- Score below 50
- Missing critical information (date, amount, or vendor)
- Handwritten receipt without clear business information
- Image quality too poor to verify details
- Suspected fraud or manipulation

Common Validation Issues:
- "Not a receipt (invoice template)" - for invoices requiring payment
- "Missing purchase date" - no clear transaction date
- "Image too blurry or dark" - quality issues
- "Partially cut off or incomplete" - missing parts
- "Handwritten without business info" - informal receipts
- "Amount not clear" - unclear pricing
- "Not an educational expense" - inappropriate items

Confidence Scoring (0-1):
- 1.0 = Information clearly visible and unambiguous
- 0.7-0.9 = Present but requires interpretation
- 0.4-0.6 = Partially visible or unclear
- 0.1-0.3 = Barely visible or highly uncertain  
- 0.0 = Information not found

ALBERTA EDUCATION STANDARDS COMPLIANCE EVALUATION:

In addition to extracting receipt information, you must evaluate this purchase against Alberta Home Education Reimbursement Standards:

${ALBERTA_EDUCATION_STANDARDS}

${EDUCATION_COMPLIANCE_PROMPT}

CRITICAL: You must provide both receipt analysis AND education compliance evaluation. All fields including educationComplianceScore, educationCategory, educationReasoning, and reimbursementEligibility are required.

Return null for any fields you cannot extract with reasonable confidence.`;

/**
 * System prompt for mixed receipt analysis with item-level breakdown
 */
const MIXED_RECEIPT_ANALYSIS_PROMPT = `You are an expert document analyzer specializing in itemized receipt processing for educational reimbursement validation. Your task is to extract EACH INDIVIDUAL ITEM from receipts and classify them for Alberta Education compliance.

CRITICAL MISSION: Break down mixed receipts where educational and non-educational items are purchased together (e.g., Walmart trip with school supplies AND groceries).

Key responsibilities:
1. Extract EVERY line item from the receipt with individual prices
2. Classify EACH item as educational or non-educational according to Alberta standards
3. Calculate separate totals for educational vs non-educational items
4. Provide compliance reasoning for each item classification
5. Recommend final claimable amount (educational items only)

ITEM-LEVEL EXTRACTION REQUIREMENTS:

For each line item, extract:
- Item description (exactly as shown on receipt)
- Individual item price (before tax allocation)
- Quantity if visible
- Educational classification (true/false)
- Education category if applicable (art_supplies, books, science_supplies, etc.)
- Compliance score for this specific item (0-100)
- Reasoning for educational classification

EDUCATIONAL ITEM CLASSIFICATION:

${ALBERTA_EDUCATION_STANDARDS}

${EDUCATION_COMPLIANCE_PROMPT}

COMMON EDUCATIONAL ITEMS (approve with high confidence):
- Books, textbooks, workbooks, educational software
- Art supplies: paper, pencils, paints, brushes, markers, craft materials
- Science equipment: microscopes, calculators, lab supplies, experiment kits
- Sports equipment for PE: balls, equipment for organized sports
- Musical instruments and music supplies
- Technology: educational tablets, computers, printers for schoolwork
- Home economics supplies: cooking ingredients for educational projects

COMMON NON-EDUCATIONAL ITEMS (reject with high confidence):
- Regular groceries (food for family meals, not educational cooking)
- Personal care items: shampoo, soap, cosmetics
- Household supplies: cleaning products, paper towels, toilet paper
- Adult clothing, general family clothing
- Entertainment: toys, games (unless clearly educational)
- Alcohol, tobacco, pharmaceuticals

MIXED RECEIPT SCENARIOS:
- Costco/Walmart trip: Educational supplies + groceries → separate each item
- Staples visit: Office supplies (educational) + business cards (non-educational)
- Amazon order: Educational books + personal items → itemize each

CALCULATION REQUIREMENTS:
1. Sum all educational items = educationalTotal
2. Sum all non-educational items = nonEducationalTotal  
3. educationalTotal + nonEducationalTotal should approximately equal subtotal
4. recommendedClaimAmount = educationalTotal (what should be reimbursed)

CONFIDENCE SCORING:
- High confidence (0.9+): Clear educational purpose, matches approved categories
- Medium confidence (0.6-0.8): Potentially educational, requires review
- Low confidence (0.3-0.5): Unclear purpose, needs manual assessment
- Very low confidence (0.0-0.2): Clearly non-educational

OUTPUT REQUIREMENTS:
- MUST provide complete item breakdown with prices
- MUST classify every item as educational/non-educational
- MUST calculate accurate educational vs non-educational totals
- MUST provide reasoning for each classification
- Handle partial/unclear receipts gracefully with appropriate confidence scores

Return a complete JSON object with all required fields, even if some items cannot be clearly classified.`;

/**
 * Cloud function to analyze receipt images/PDFs using AI
 */
const analyzeReceipt = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    // Initialize AI instance
    const ai = initializeAI();
    
    console.log("Analyzing receipt:", data.fileName || 'unnamed');
    console.log("Request data:", {
      hasFileUrl: !!data.fileUrl,
      hasFileName: !!data.fileName,
      hasMimeType: !!data.mimeType,
      fileUrlLength: data.fileUrl ? data.fileUrl.length : 0
    });
    
    const { fileUrl, fileName, mimeType } = data;

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // For both images and PDFs, use the direct Firebase Storage URL
    // The Gemini API should be able to access public Firebase Storage URLs
    const contentType = mimeType || getContentType(null, fileName);
    
    console.log('Building prompt with content type:', contentType);
    
    const prompt = [
      {
        media: {
          url: fileUrl,
          contentType: contentType
        }
      },
      {
        text: `${RECEIPT_ANALYSIS_PROMPT}

Analyze this ${contentType === 'application/pdf' ? 'PDF receipt document' : 'receipt image'} and extract all relevant information. 

${contentType === 'application/pdf' ? 
'This is a PDF document. Please carefully read all text content and extract:' : 
'This is an image. Please carefully examine the visual content and extract:'}

1. Purchase date (any date format, convert to YYYY-MM-DD)
2. Total amount paid (look for "Total", "Amount", dollar signs, final price)
3. Vendor/business name (store name, hotel name, restaurant name)
4. What was purchased (items, services, description)
5. Tax amount if shown separately
6. Assess document quality and validity

Pay special attention to:
- Dollar amounts with $ symbols
- Business names at the top of receipts
- Date stamps or transaction dates
- Item descriptions or service types

CRITICAL: You must provide a validationScore between 0-100. Return all fields even if some are null.

IMPORTANT: You must return a complete JSON object with all required fields. Do not return null or undefined.`
      }
    ];
    
    console.log('Using direct URL for file:', {
      fileName,
      mimeType: mimeType || getContentType(null, fileName),
      urlLength: fileUrl.length
    });

    // Generate structured output using the schema
    let response;
    try {
      response = await ai.generate({
        model: googleAI.model(AI_MODELS.GEMINI.FLASH), // Using FLASH model for faster analysis
        prompt: prompt,
        output: { schema: ReceiptAnalysisSchema },
        config: {
          temperature: 0.1, // Low temperature for consistent extraction
          maxOutputTokens: 4000 // Increased to ensure complete JSON responses with validation issues, items lists, etc.
        }
      });
    } catch (schemaError) {
      console.error('Schema validation failed, trying fallback approach:', schemaError.message);
      
      // If structured output fails, try without schema and parse manually
      try {
        const fallbackResponse = await ai.generate({
          model: googleAI.model(AI_MODELS.GEMINI.FLASH),
          prompt: prompt,
          config: {
            temperature: 0.1,
            maxOutputTokens: 4000 // Increased to ensure complete JSON responses
          }
        });
        
        console.log('Fallback response received:', fallbackResponse.text ? 'has text' : 'no text');
        
        // Try to extract JSON from the text response
        let parsedOutput = null;
        if (fallbackResponse.text) {
          try {
            // Look for JSON in the response
            const jsonMatch = fallbackResponse.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedOutput = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON from fallback response');
            }
          } catch (parseError) {
            console.error('Could not parse JSON from fallback response:', parseError.message);
          }
        }
        
        // Set response with parsed output or null
        response = { output: parsedOutput };
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError.message);
        // Set response to null to trigger error handling below
        response = { output: null };
      }
    }

    console.log('Receipt analysis complete:', {
      isValid: response.output?.isValid,
      validationScore: response.output?.validationScore,
      hasDate: !!response.output?.purchaseDate,
      hasAmount: !!response.output?.totalAmount,
      hasVendor: !!response.output?.vendor
    });
    
    console.log('Full AI response output:', JSON.stringify(response.output, null, 2));

    // Handle null or incomplete responses
    if (!response.output) {
      console.log('AI model returned null - document likely cannot be processed');
      return {
        success: true,
        analysis: {
          purchaseDate: null,
          totalAmount: null,
          subtotalAmount: null,
          taxAmount: null,
          vendor: null,
          purchaseDescription: null,
          documentType: 'other',
          isValid: false,
          validationScore: 0,
          validationIssues: ['Document could not be processed by AI - please upload a clearer image or enter details manually'],
          requiresManualReview: true,
          reviewPriority: 'high',
          items: [],
          confidence: {
            date: 0,
            amount: 0,
            vendor: 0,
            description: 0,
            tax: 0
          },
          // Alberta Education Standards Compliance
          educationComplianceScore: 0,
          educationCategory: 'unclear',
          educationReasoning: 'Document could not be processed for education compliance assessment',
          reimbursementEligibility: 'requires-review'
        }
      };
    }
    
    // Return the structured output with proper fallbacks for missing fields
    const analysisResult = response.output;
    
    return {
      success: true,
      analysis: {
        purchaseDate: analysisResult.purchaseDate || null,
        totalAmount: analysisResult.totalAmount || null,
        subtotalAmount: analysisResult.subtotalAmount || null,
        taxAmount: analysisResult.taxAmount || null,
        vendor: analysisResult.vendor || null,
        purchaseDescription: analysisResult.purchaseDescription || null,
        documentType: analysisResult.documentType || 'other',
        isValid: analysisResult.isValid || false,
        validationScore: analysisResult.validationScore || 0,
        validationIssues: analysisResult.validationIssues || ['Receipt analysis completed with partial data'],
        requiresManualReview: analysisResult.requiresManualReview !== undefined ? analysisResult.requiresManualReview : true,
        reviewPriority: analysisResult.reviewPriority || 'medium',
        items: analysisResult.items || [],
        confidence: {
          date: analysisResult.confidence?.date || 0,
          amount: analysisResult.confidence?.amount || 0,
          vendor: analysisResult.confidence?.vendor || 0,
          description: analysisResult.confidence?.description || 0,
          tax: analysisResult.confidence?.tax || 0
        },
        // Alberta Education Standards Compliance
        educationComplianceScore: analysisResult.educationComplianceScore || 0,
        educationCategory: analysisResult.educationCategory || 'unclear',
        educationReasoning: analysisResult.educationReasoning || 'Education compliance assessment not completed',
        reimbursementEligibility: analysisResult.reimbursementEligibility || 'requires-review'
      }
    };
  } catch (error) {
    console.error('Error analyzing receipt:', error);
    
    // Check if this is likely an AI-generated image rejection
    let errorMessage = error.message;
    let validationIssues = ['Analysis failed: ' + error.message];
    
    if (error.message.includes('Provided image is not valid') || 
        error.message.includes('Unable to process input image')) {
      errorMessage = 'Image could not be processed. This may occur with AI-generated images or screenshots. Please upload a photo or scan of an actual receipt.';
      validationIssues = [
        'Image processing failed',
        'Ensure the image is a photo or scan of a real receipt',
        'AI-generated or synthetic images may be rejected'
      ];
    }
    
    return {
      success: false,
      error: errorMessage,
      analysis: {
        purchaseDate: null,
        totalAmount: null,
        subtotalAmount: null,
        taxAmount: null,
        vendor: null,
        purchaseDescription: null,
        documentType: 'other',
        isValid: false,
        validationScore: 0,
        validationIssues: validationIssues,
        requiresManualReview: true,
        reviewPriority: 'high',
        items: [],
        confidence: { date: 0, amount: 0, vendor: 0, description: 0, tax: 0 },
        // Alberta Education Standards Compliance
        educationComplianceScore: 0,
        educationCategory: 'unclear',
        educationReasoning: 'Analysis failed - education compliance could not be assessed',
        reimbursementEligibility: 'requires-review'
      }
    };
  }
});

/**
 * Cloud function to analyze mixed receipts with item-level breakdown using AI
 */
const analyzeMixedReceipt = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 90, // Increased timeout for more complex analysis
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    // Initialize AI instance
    const ai = initializeAI();
    
    console.log("Analyzing mixed receipt:", data.fileName || 'unnamed');
    console.log("Request data:", {
      hasFileUrl: !!data.fileUrl,
      hasFileName: !!data.fileName,
      hasMimeType: !!data.mimeType,
      fileUrlLength: data.fileUrl ? data.fileUrl.length : 0
    });
    
    const { fileUrl, fileName, mimeType } = data;

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    const contentType = mimeType || getContentType(null, fileName);
    
    console.log('Building mixed receipt prompt with content type:', contentType);
    
    const prompt = [
      {
        media: {
          url: fileUrl,
          contentType: contentType
        }
      },
      {
        text: `${MIXED_RECEIPT_ANALYSIS_PROMPT}

Analyze this ${contentType === 'application/pdf' ? 'PDF receipt document' : 'receipt image'} and extract ALL individual items with detailed classification.

${contentType === 'application/pdf' ? 
'This is a PDF document. Please carefully read all text content and extract each line item separately:' : 
'This is an image. Please carefully examine the visual content and extract each line item separately:'}

REQUIRED FOR EACH ITEM:
1. Exact item description as shown on receipt
2. Individual item price (not including tax unless itemized per item)
3. Educational classification (true/false) based on Alberta Education standards
4. Education category if applicable (books, art_supplies, science_supplies, etc.)
5. Compliance reasoning explaining the classification

CRITICAL CALCULATIONS:
- Sum all educational item prices = educationalTotal
- Sum all non-educational item prices = nonEducationalTotal
- recommendedClaimAmount = educationalTotal (only educational items)

PAY SPECIAL ATTENTION TO:
- Each line item with individual prices
- Distinguishing educational vs personal/household items
- Providing clear reasoning for each classification
- Ensuring totals add up correctly

EXAMPLE OUTPUT STRUCTURE:
{
  "items": [
    {
      "description": "Crayola Colored Pencils 24pk",
      "amount": 8.97,
      "isEducational": true,
      "educationCategory": "art_supplies",
      "complianceScore": 95,
      "complianceReasoning": "Art supplies are explicitly approved for Alberta Education reimbursement",
      "confidence": 0.95
    },
    {
      "description": "Bananas Organic 2lb",
      "amount": 4.50,
      "isEducational": false,
      "complianceScore": 0,
      "complianceReasoning": "Regular groceries are not eligible for educational reimbursement",
      "confidence": 0.98
    }
  ],
  "educationalTotal": 8.97,
  "nonEducationalTotal": 4.50,
  "recommendedClaimAmount": 8.97
}

IMPORTANT: You must return a complete JSON object with ALL required fields including item-level breakdown.`
      }
    ];

/**
 * System prompt for citizenship document analysis and student verification
 */
const CITIZENSHIP_DOCUMENT_ANALYSIS_PROMPT = `You are an expert document analyzer specializing in Canadian citizenship and immigration document verification for school registration purposes. Your primary task is to verify that uploaded documents belong to the correct student and are the expected document type.

CRITICAL MISSION: Verify student identity and document authenticity to prevent registration fraud and ensure compliance with Alberta Education requirements.

Key responsibilities:
1. Extract the full name from the document and compare it with the expected student name
2. Identify the specific type of citizenship/immigration document
3. Assess document authenticity and quality
4. Determine if the document matches the expected document type
5. Flag any discrepancies or concerns for manual review

DOCUMENT TYPE CLASSIFICATION:

BIRTH_CERTIFICATE:
- Canadian birth certificates from provinces/territories
- Should show child's name, birth date, parents' names, place of birth
- Official government seal or signature
- May be long form or short form

PASSPORT:
- Canadian passport (blue cover typically)
- Should show holder's name, photo, birth date, passport number
- Government of Canada issuing authority
- May be expired but still valid for identity verification

CITIZENSHIP_CERTIFICATE:
- Canadian Citizenship Certificate or Card
- Shows holder's name, certificate number, date of citizenship
- Issued by Immigration, Refugees and Citizenship Canada (IRCC)

IMMIGRATION_DOCUMENT:
- Permanent Resident Card (PR Card)
- Study permits, work permits, visitor records
- Immigration documents with legal status in Canada
- Various forms depending on immigration status

STUDENT NAME VERIFICATION:

When comparing names, consider:
- Exact matches (ideal case)
- Common variations (middle names missing, nicknames, shortened names)
- Cultural naming patterns (different name orders, hyphenated names)
- Legal name changes (adoption, marriage, etc.)
- OCR errors in name extraction

NAME MATCHING GUIDELINES:
- PERFECT MATCH (95-100% confidence): Names are identical or nearly identical
- GOOD MATCH (80-94% confidence): Minor variations (Nick vs Nicholas, missing middle name)
- PARTIAL MATCH (60-79% confidence): Some similarity but notable differences
- POOR MATCH (30-59% confidence): Significant differences but could be same person
- NO MATCH (0-29% confidence): Completely different names, likely wrong document

DOCUMENT QUALITY ASSESSMENT (0-100 scale):
- 90-100: Perfect image, all text clear, official appearance
- 70-89: Good quality, readable, minor issues
- 50-69: Acceptable but with clarity issues, partial visibility
- 30-49: Poor quality, difficult to read, missing information
- 0-29: Very poor, illegible, or invalid document

AUTHENTICITY INDICATORS:
- Official government seals, watermarks, or security features
- Proper formatting and layout for document type
- Consistent fonts and official appearance
- Appropriate issuing authority information
- No signs of tampering or alteration

RED FLAGS (require manual review):
- Name on document doesn't match expected student at all
- Document type doesn't match what was claimed
- Poor image quality preventing proper verification
- Signs of document tampering or forgery
- Missing critical information (names, dates, official markings)
- Document appears to be a photocopy of a photocopy

VERIFICATION SCORING (overallScore 0-100):
- 90-100: Perfect verification, document clearly belongs to student
- 70-89: Good verification, minor discrepancies but likely correct
- 50-69: Acceptable with concerns, requires review
- 30-49: Poor verification, significant issues, manual review required
- 0-29: Failed verification, likely wrong document or fraud attempt

MANUAL REVIEW TRIGGERS:
- Student name match confidence below 80%
- Document quality score below 50
- Document type doesn't match expected
- Any authenticity concerns
- Missing critical information
- Unusual document features or inconsistencies

CONFIDENCE SCORING (0-1 scale):
- 0.9-1.0: Extremely confident in assessment
- 0.7-0.8: Confident with minor uncertainties
- 0.5-0.6: Moderate confidence, some doubts
- 0.3-0.4: Low confidence, significant uncertainties
- 0.0-0.2: Very low confidence, major concerns

IMPORTANT: You will receive the expected student name and document type. Your job is to verify the document matches these expectations. Always provide detailed reasoning for your assessments, especially when flagging concerns.

Return complete analysis with all verification fields populated, even if some information cannot be determined with certainty.`;
    
    console.log('Using direct URL for mixed receipt file:', {
      fileName,
      mimeType: mimeType || getContentType(null, fileName),
      urlLength: fileUrl.length
    });

    // Generate structured output using the mixed receipt schema
    let response;
    try {
      response = await ai.generate({
        model: googleAI.model(AI_MODELS.GEMINI.FLASH), // Using FLASH model for faster analysis
        prompt: prompt,
        output: { schema: MixedReceiptAnalysisSchema },
        config: {
          temperature: 0.1, // Low temperature for consistent extraction
          maxOutputTokens: 6000 // Increased for item-level analysis
        }
      });
    } catch (schemaError) {
      console.error('Mixed receipt schema validation failed, trying fallback approach:', schemaError.message);
      
      // If structured output fails, try without schema and parse manually
      try {
        const fallbackResponse = await ai.generate({
          model: googleAI.model(AI_MODELS.GEMINI.FLASH),
          prompt: prompt,
          config: {
            temperature: 0.1,
            maxOutputTokens: 6000
          }
        });
        
        console.log('Mixed receipt fallback response received:', fallbackResponse.text ? 'has text' : 'no text');
        
        // Try to extract JSON from the text response
        let parsedOutput = null;
        if (fallbackResponse.text) {
          try {
            // Look for JSON in the response
            const jsonMatch = fallbackResponse.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedOutput = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON from mixed receipt fallback response');
            }
          } catch (parseError) {
            console.error('Could not parse JSON from mixed receipt fallback response:', parseError.message);
          }
        }
        
        // Set response with parsed output or null
        response = { output: parsedOutput };
      } catch (fallbackError) {
        console.error('Mixed receipt fallback generation also failed:', fallbackError.message);
        // Set response to null to trigger error handling below
        response = { output: null };
      }
    }

    console.log('Mixed receipt analysis complete:', {
      isValid: response.output?.isValid,
      validationScore: response.output?.validationScore,
      hasDate: !!response.output?.purchaseDate,
      hasAmount: !!response.output?.totalAmount,
      hasVendor: !!response.output?.vendor,
      itemCount: response.output?.items?.length || 0,
      educationalTotal: response.output?.educationalTotal,
      nonEducationalTotal: response.output?.nonEducationalTotal
    });
    
    console.log('Full mixed receipt AI response output:', JSON.stringify(response.output, null, 2));

    // Handle null or incomplete responses
    if (!response.output) {
      console.log('AI model returned null for mixed receipt - document likely cannot be processed');
      return {
        success: true,
        analysis: {
          purchaseDate: null,
          totalAmount: null,
          subtotalAmount: null,
          taxAmount: null,
          vendor: null,
          documentType: 'other',
          isValid: false,
          validationScore: 0,
          validationIssues: ['Mixed receipt could not be processed by AI - please upload a clearer image or enter details manually'],
          requiresManualReview: true,
          reviewPriority: 'high',
          items: [],
          educationalTotal: 0,
          nonEducationalTotal: 0,
          overallEducationComplianceScore: 0,
          recommendedClaimAmount: 0,
          confidence: {
            date: 0,
            amount: 0,
            vendor: 0,
            itemBreakdown: 0
          }
        }
      };
    }
    
    // Return the structured output with proper fallbacks for missing fields
    const analysisResult = response.output;
    
    // Ensure items array is properly structured
    const items = (analysisResult.items || []).map(item => ({
      description: item.description || 'Unknown item',
      amount: item.amount || 0,
      quantity: item.quantity || null,
      isEducational: item.isEducational || false,
      educationCategory: item.educationCategory || null,
      complianceScore: item.complianceScore || 0,
      complianceReasoning: item.complianceReasoning || 'No reasoning provided',
      confidence: item.confidence || 0
    }));
    
    return {
      success: true,
      analysis: {
        purchaseDate: analysisResult.purchaseDate || null,
        totalAmount: analysisResult.totalAmount || null,
        subtotalAmount: analysisResult.subtotalAmount || null,
        taxAmount: analysisResult.taxAmount || null,
        vendor: analysisResult.vendor || null,
        documentType: analysisResult.documentType || 'other',
        isValid: analysisResult.isValid || false,
        validationScore: analysisResult.validationScore || 0,
        validationIssues: analysisResult.validationIssues || ['Mixed receipt analysis completed with partial data'],
        requiresManualReview: analysisResult.requiresManualReview !== undefined ? analysisResult.requiresManualReview : true,
        reviewPriority: analysisResult.reviewPriority || 'medium',
        items: items,
        educationalTotal: analysisResult.educationalTotal || 0,
        nonEducationalTotal: analysisResult.nonEducationalTotal || 0,
        overallEducationComplianceScore: analysisResult.overallEducationComplianceScore || 0,
        recommendedClaimAmount: analysisResult.recommendedClaimAmount || analysisResult.educationalTotal || 0,
        confidence: {
          date: analysisResult.confidence?.date || 0,
          amount: analysisResult.confidence?.amount || 0,
          vendor: analysisResult.confidence?.vendor || 0,
          itemBreakdown: analysisResult.confidence?.itemBreakdown || 0
        }
      }
    };
  } catch (error) {
    console.error('Error analyzing mixed receipt:', error);
    
    // Check if this is likely an AI-generated image rejection
    let errorMessage = error.message;
    let validationIssues = ['Mixed receipt analysis failed: ' + error.message];
    
    if (error.message.includes('Provided image is not valid') || 
        error.message.includes('Unable to process input image')) {
      errorMessage = 'Image could not be processed. This may occur with AI-generated images or screenshots. Please upload a photo or scan of an actual receipt.';
      validationIssues = [
        'Image processing failed',
        'Ensure the image is a photo or scan of a real receipt',
        'AI-generated or synthetic images may be rejected'
      ];
    }
    
    return {
      success: false,
      error: errorMessage,
      analysis: {
        purchaseDate: null,
        totalAmount: null,
        subtotalAmount: null,
        taxAmount: null,
        vendor: null,
        documentType: 'other',
        isValid: false,
        validationScore: 0,
        validationIssues: validationIssues,
        requiresManualReview: true,
        reviewPriority: 'high',
        items: [],
        educationalTotal: 0,
        nonEducationalTotal: 0,
        overallEducationComplianceScore: 0,
        recommendedClaimAmount: 0,
        confidence: { date: 0, amount: 0, vendor: 0, itemBreakdown: 0 }
      }
    };
  }
});

/**
 * Cloud function to analyze citizenship documents and verify student identity
 */
const analyzeCitizenshipDocument = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    // Initialize AI instance
    const ai = initializeAI();
    
    console.log("Analyzing citizenship document:", data.fileName || 'unnamed');
    console.log("Request data:", {
      hasFileUrl: !!data.fileUrl,
      hasFileName: !!data.fileName,
      hasMimeType: !!data.mimeType,
      hasStudentName: !!data.studentName,
      hasExpectedDocType: !!data.expectedDocumentType,
      fileUrlLength: data.fileUrl ? data.fileUrl.length : 0
    });
    
    const { fileUrl, fileName, mimeType, studentName, studentBirthDate, expectedDocumentType } = data;

    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    if (!studentName) {
      throw new Error('Student name is required for verification');
    }

    const contentType = mimeType || getContentType(null, fileName);
    
    console.log('Building citizenship document prompt with content type:', contentType);
    
    const prompt = [
      {
        media: {
          url: fileUrl,
          contentType: contentType
        }
      },
      {
        text: `${CITIZENSHIP_DOCUMENT_ANALYSIS_PROMPT}

Analyze this ${contentType === 'application/pdf' ? 'PDF citizenship document' : 'citizenship document image'} and verify it belongs to the correct student.

STUDENT VERIFICATION DETAILS:
- Expected Student Name: "${studentName}"
${studentBirthDate ? `- Expected Birth Date: "${studentBirthDate}"` : ''}
${expectedDocumentType ? `- Expected Document Type: "${expectedDocumentType}"` : ''}

${contentType === 'application/pdf' ? 
'This is a PDF document. Please carefully read all text content and extract:' : 
'This is an image. Please carefully examine the visual content and extract:'}

VERIFICATION REQUIREMENTS:
1. Extract the full name exactly as it appears on the document
2. Compare the extracted name with the expected student name: "${studentName}"
3. Identify the type of citizenship document (birth_certificate, passport, citizenship_certificate, immigration_document)
${expectedDocumentType ? `4. Verify this matches the expected document type: "${expectedDocumentType}"` : '4. Classify the document type'}
5. Assess document quality and authenticity
6. Determine if this document belongs to the correct student

CRITICAL ANALYSIS POINTS:
- Does the name on the document match "${studentName}"?
- Is this a legitimate Canadian citizenship/immigration document?
- Is the document type correct for school registration?
- Are there any red flags or concerns?

NAME MATCHING INSTRUCTIONS:
When comparing names, consider these acceptable variations:
- "${studentName}" (exact match)
- Common nicknames or shortened versions
- Missing or additional middle names
- Different name order (cultural variations)
- Minor spelling differences due to OCR errors

DOCUMENT TYPE VERIFICATION:
${expectedDocumentType ? `Expected document type: "${expectedDocumentType}"
Verify this matches what you see in the document.` : 'Classify the document type based on its appearance and content.'}

RETURN COMPLETE ANALYSIS:
Provide all fields in the response schema, including confidence scores, reasoning, and specific verification results.

Focus on accuracy and fraud prevention while being reasonable about common name variations.`
      }
    ];
    
    console.log('Using direct URL for citizenship document:', {
      fileName,
      mimeType: mimeType || getContentType(null, fileName),
      urlLength: fileUrl.length,
      studentName,
      expectedDocumentType
    });

    // Generate structured output using the citizenship document schema
    let response;
    try {
      response = await ai.generate({
        model: googleAI.model(AI_MODELS.GEMINI.FLASH), // Using FLASH model for faster analysis
        prompt: prompt,
        output: { schema: CitizenshipDocumentAnalysisSchema },
        config: {
          temperature: 0.1, // Low temperature for consistent verification
          maxOutputTokens: 4000 // Sufficient for detailed analysis
        }
      });
    } catch (schemaError) {
      console.error('Citizenship document schema validation failed, trying fallback approach:', schemaError.message);
      
      // If structured output fails, try without schema and parse manually
      try {
        const fallbackResponse = await ai.generate({
          model: googleAI.model(AI_MODELS.GEMINI.FLASH),
          prompt: prompt,
          config: {
            temperature: 0.1,
            maxOutputTokens: 4000
          }
        });
        
        console.log('Citizenship document fallback response received:', fallbackResponse.text ? 'has text' : 'no text');
        
        // Try to extract JSON from the text response
        let parsedOutput = null;
        if (fallbackResponse.text) {
          try {
            // Look for JSON in the response
            const jsonMatch = fallbackResponse.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedOutput = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON from citizenship document fallback response');
            }
          } catch (parseError) {
            console.error('Could not parse JSON from citizenship document fallback response:', parseError.message);
          }
        }
        
        // Set response with parsed output or null
        response = { output: parsedOutput };
      } catch (fallbackError) {
        console.error('Citizenship document fallback generation also failed:', fallbackError.message);
        // Set response to null to trigger error handling below
        response = { output: null };
      }
    }

    console.log('Citizenship document analysis complete:', {
      detectedDocumentType: response.output?.detectedDocumentType,
      studentNameMatch: response.output?.studentNameMatch,
      documentTypeMatch: response.output?.documentTypeMatch,
      overallScore: response.output?.overallScore,
      requiresManualReview: response.output?.requiresManualReview
    });
    
    console.log('Full citizenship document AI response output:', JSON.stringify(response.output, null, 2));

    // Handle null or incomplete responses
    if (!response.output) {
      console.log('AI model returned null for citizenship document - document likely cannot be processed');
      return {
        success: true,
        analysis: {
          detectedDocumentType: 'unknown',
          documentTypeConfidence: 0,
          detectedName: null,
          detectedFirstName: null,
          detectedLastName: null,
          detectedBirthDate: null,
          studentNameMatch: false,
          nameMatchConfidence: 0,
          nameMatchReasoning: 'Document could not be processed by AI',
          documentTypeMatch: false,
          typeMatchConfidence: 0,
          typeMatchReasoning: 'Document type could not be determined',
          documentQuality: 0,
          isValidDocument: false,
          validationIssues: ['Document could not be processed by AI - please upload a clearer image or review manually'],
          issuingAuthority: null,
          documentNumber: null,
          issueDate: null,
          expiryDate: null,
          requiresManualReview: true,
          reviewPriority: 'high',
          overallScore: 0,
          confidence: {
            nameExtraction: 0,
            documentType: 0,
            studentMatch: 0,
            documentAuthenticity: 0
          }
        }
      };
    }
    
    // Return the structured output with proper fallbacks for missing fields
    const analysisResult = response.output;
    
    return {
      success: true,
      analysis: {
        detectedDocumentType: analysisResult.detectedDocumentType || 'unknown',
        documentTypeConfidence: analysisResult.documentTypeConfidence || 0,
        detectedName: analysisResult.detectedName || null,
        detectedFirstName: analysisResult.detectedFirstName || null,
        detectedLastName: analysisResult.detectedLastName || null,
        detectedBirthDate: analysisResult.detectedBirthDate || null,
        studentNameMatch: analysisResult.studentNameMatch || false,
        nameMatchConfidence: analysisResult.nameMatchConfidence || 0,
        nameMatchReasoning: analysisResult.nameMatchReasoning || 'Name matching assessment not completed',
        documentTypeMatch: analysisResult.documentTypeMatch || false,
        typeMatchConfidence: analysisResult.typeMatchConfidence || 0,
        typeMatchReasoning: analysisResult.typeMatchReasoning || 'Document type verification not completed',
        documentQuality: analysisResult.documentQuality || 0,
        isValidDocument: analysisResult.isValidDocument || false,
        validationIssues: analysisResult.validationIssues || ['Analysis completed with partial data'],
        issuingAuthority: analysisResult.issuingAuthority || null,
        documentNumber: analysisResult.documentNumber || null,
        issueDate: analysisResult.issueDate || null,
        expiryDate: analysisResult.expiryDate || null,
        requiresManualReview: analysisResult.requiresManualReview !== undefined ? analysisResult.requiresManualReview : true,
        reviewPriority: analysisResult.reviewPriority || 'medium',
        overallScore: analysisResult.overallScore || 0,
        confidence: {
          nameExtraction: analysisResult.confidence?.nameExtraction || 0,
          documentType: analysisResult.confidence?.documentType || 0,
          studentMatch: analysisResult.confidence?.studentMatch || 0,
          documentAuthenticity: analysisResult.confidence?.documentAuthenticity || 0
        }
      }
    };
  } catch (error) {
    console.error('Error analyzing citizenship document:', error);
    
    // Check if this is likely an AI-generated image rejection
    let errorMessage = error.message;
    let validationIssues = ['Citizenship document analysis failed: ' + error.message];
    
    if (error.message.includes('Provided image is not valid') || 
        error.message.includes('Unable to process input image')) {
      errorMessage = 'Image could not be processed. This may occur with AI-generated images or screenshots. Please upload a photo or scan of an actual document.';
      validationIssues = [
        'Image processing failed',
        'Ensure the image is a photo or scan of a real document',
        'AI-generated or synthetic images may be rejected'
      ];
    }
    
    return {
      success: false,
      error: errorMessage,
      analysis: {
        detectedDocumentType: 'unknown',
        documentTypeConfidence: 0,
        detectedName: null,
        detectedFirstName: null,
        detectedLastName: null,
        detectedBirthDate: null,
        studentNameMatch: false,
        nameMatchConfidence: 0,
        nameMatchReasoning: 'Analysis failed - name verification could not be completed',
        documentTypeMatch: false,
        typeMatchConfidence: 0,
        typeMatchReasoning: 'Analysis failed - document type could not be verified',
        documentQuality: 0,
        isValidDocument: false,
        validationIssues: validationIssues,
        issuingAuthority: null,
        documentNumber: null,
        issueDate: null,
        expiryDate: null,
        requiresManualReview: true,
        reviewPriority: 'high',
        overallScore: 0,
        confidence: {
          nameExtraction: 0,
          documentType: 0,
          studentMatch: 0,
          documentAuthenticity: 0
        }
      }
    };
  }
});

module.exports = {
  analyzeReceipt,
  analyzeMixedReceipt,
  analyzeCitizenshipDocument
};