// signatures.js - Home Education Form Signature Configuration
// Executive Director and School Authority information for official documents

export const EXECUTIVE_DIRECTOR = {
  name: 'Kyle Brown',
  title: 'Executive Director',
  email: 'kyle@rtdacademy.com',
  phone: '587-413-0498', // Update with actual phone number
  digitalSignature: 'Kyle Brown (Digital Signature - Executive Director)'
};

export const SCHOOL_AUTHORITY_INFO = {
  name: 'RTD Academy',
  fullName: 'RTD Academy - Alberta Home Education Authority',
  address: '5 Crawford Street, Red Deer, Alberta, T4P 2G4',
  schoolCode: '2444',
  authorityCode: '0402',
  contact: {
    main: 'connect@rtdacademy.com',
    phone: '403-351-0896',
  },
  regulatoryCompliance: {
    regulation: 'Alberta Home Education Regulation A.R. 89/2019',
    responseTimeRequired: 15, // school days
    approvalAuthority: 'Executive Director'
  }
};

export const PART_C_TEMPLATES = {
  ACCEPTED: {
    status: 'accepted',
    responseMessage: 'This home education program is accepted for supervision.',
    complianceNote: 'Home education program approved in accordance with Alberta Home Education Regulation A.R. 89/2019.',
    standardApprovalText: 'RTD Academy agrees to supervise this home education program and will provide appropriate oversight in accordance with provincial regulations.'
  },
  PROVISIONALLY_ACCEPTED: {
    status: 'provisionally_accepted', 
    responseMessage: 'This home education program is provisionally accepted pending completion of additional requirements.',
    complianceNote: 'Home education program provisionally approved in accordance with Alberta Home Education Regulation A.R. 89/2019.',
    standardApprovalText: 'RTD Academy provisionally agrees to supervise this home education program subject to the conditions noted above.'
  },
  NOT_ACCEPTED: {
    status: 'not_accepted',
    responseMessage: 'This home education program is not accepted for supervision at this time.',
    complianceNote: 'Home education program not approved. Please contact RTD Academy to discuss requirements.',
    standardApprovalText: 'RTD Academy is unable to supervise this home education program at this time.'
  }
};

export const REGULATORY_TEXT = {
  PART_C_HEADER: 'PART C - Associate School Board or Associate Private School Notification of Acceptance',
  RESPONSE_REQUIREMENT: 'As per Section 2(3) of the Home Education Regulation the associate board or associate private school must reply in writing to the parent/guardian not more than 15 school days after the date on which it is notified whether it agrees to supervise or continue to supervise the Home Education Program.',
  ACCEPTANCE_LANGUAGE: 'This agreement is accepted by',
  PROVISIONAL_LANGUAGE: 'This agreement is provisionally accepted by',
  REJECTION_LANGUAGE: 'This agreement is not accepted by'
};

// Helper function to get the appropriate template
export const getApprovalTemplate = (status = 'accepted') => {
  switch (status.toLowerCase()) {
    case 'provisionally_accepted':
    case 'provisional':
      return PART_C_TEMPLATES.PROVISIONALLY_ACCEPTED;
    case 'not_accepted':
    case 'rejected':
      return PART_C_TEMPLATES.NOT_ACCEPTED;
    case 'accepted':
    default:
      return PART_C_TEMPLATES.ACCEPTED;
  }
};

// Generate complete PART_C data structure
export const generatePartCData = (approvalStatus = 'accepted', additionalNotes = '') => {
  const template = getApprovalTemplate(approvalStatus);
  
  return {
    acceptanceStatus: template.status,
    schoolResponse: template.responseMessage,
    schoolName: SCHOOL_AUTHORITY_INFO.name,
    schoolFullName: SCHOOL_AUTHORITY_INFO.fullName,
    schoolContact: `${EXECUTIVE_DIRECTOR.name}, ${EXECUTIVE_DIRECTOR.title}\nEmail: ${EXECUTIVE_DIRECTOR.email}`,
    schoolAddress: SCHOOL_AUTHORITY_INFO.address,
    schoolCode: SCHOOL_AUTHORITY_INFO.schoolCode,
    authorityCode: SCHOOL_AUTHORITY_INFO.authorityCode,
    schoolSignature: EXECUTIVE_DIRECTOR.digitalSignature,
    responseDate: new Date().toISOString().split('T')[0],
    schoolNotes: additionalNotes || template.complianceNote,
    signedBy: EXECUTIVE_DIRECTOR.name,
    signerTitle: EXECUTIVE_DIRECTOR.title,
    authenticatedUser: EXECUTIVE_DIRECTOR.email,
    approvalTimestamp: new Date().toISOString(),
    regulatoryCompliance: {
      regulation: SCHOOL_AUTHORITY_INFO.regulatoryCompliance.regulation,
      responseWithinDays: SCHOOL_AUTHORITY_INFO.regulatoryCompliance.responseTimeRequired,
      approvalAuthority: SCHOOL_AUTHORITY_INFO.regulatoryCompliance.approvalAuthority,
      responseRequirement: REGULATORY_TEXT.RESPONSE_REQUIREMENT
    }
  };
};