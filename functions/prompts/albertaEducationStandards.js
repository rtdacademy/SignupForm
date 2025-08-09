/**
 * Alberta Home Education Reimbursement Standards
 * 
 * This module contains the official standards for home education reimbursement
 * as provided by Alberta Education, effective September 1, 2017.
 * 
 * These standards are used to evaluate educational purchases for reimbursement eligibility.
 */

const ALBERTA_EDUCATION_STANDARDS = `
Standards for Home Education Reimbursement

These standards are provided by Alberta Education to school authorities that supervise a home education program as a resource tool for meeting their accountabilities regarding the use of home education funding. They are effective beginning September 1, 2017.

Reimbursement decisions must be consistent with Section 7(4) of the Home Education Regulation. These standards are intended to assist in interpreting the provision in the regulation but are not a replacement for consideration of the reimbursement rules set out at Section 7(4) in relation to any request for reimbursement.

Test for Reimbursement

To determine whether a cost or expense is reimbursable, an associate board or associate independent school supervising a home education program must consider the following:

Determination #1 – Section 7(4)(a)(i) of the regulation
Determine if the expense being claimed is for something related to:
• the programs of study;
• instructional materials; or
• other resources related to the home education program.

Note: "Other resources" must be related to the home education program, not the home education school.

Determination #2 – Section 7(4)(a)(ii) of the regulation
Has the parent provided the school board or independent school with detailed receipts for the expense?

Note: If the school board or independent school is satisfied that the answers to both of these determinations authorize reimbursement, it must consider the third determination (below). If the above requirements are not met, there is no need to consider the third determination, as the cost is not reimbursable.

Determination #3 – Section 7(4)(b) of the regulation
The school board or independent school must determine whether the expense being claimed is for something that is:
• a form of personal remuneration for the parent; or
• to pay for travel costs or other expenses usually required to be paid by a parent of a student who is enrolled in a school operated by a board or independent school.

Note: If the expense being claimed fits within one of the above two categories, the school board or independent school is not authorized to reimburse that cost.

The supervising school board or independent school's own policy about school fees is irrelevant when determining if the expenses are "usually required" to be paid by a parent in a school operated by a board or independent school. What is relevant is "usually" required to be paid by a parent of students enrolled in school board or independent school operated in the province as a whole.

If the expense being claimed does not encompass either condition, the school is authorized to reimburse the parents for the expense.

Standards

Reimbursement is based on three conditions:
1. Necessary for and related to the student's program;
2. Paid for and supported by invoices; and
3. Not usually paid for by parents of students in a brick-and-mortar school or not a form of remuneration to the parent.

These standards apply with respect to parent-developed and parent-directed home education programs, as well as home education programs following the Alberta programs of study.

For many of the costs referred to below, consideration must be given to whether the cost is part of the cost of operating the home education school (e.g., school infrastructure or operating costs) versus the cost of providing the home educated student's program.

School authorities and home education families are encouraged to share school authority–owned resources where possible to offer the richest educational experience for home education students. Please see Section 7(6) of the Home Education Regulation for more information.

Alberta Education strongly encourages supervising school boards and independent schools to emphasize to parents the importance of student program development. As reimbursement of funding is closely tied to the student program, the details of that program must be developed in compliance with the regulation. For those home education programs not following the Alberta programs of study, the written description of the program must include:
• Activities with an explanation of how those activities will enable the student to achieve the outcomes appropriate to the home education program;
• Instructional methods and resources;
• The means of evaluating student progress; and
• The name of the person instructing the home education program if not the parent.

Whether a particular cost may be reimbursed depends, in part, on whether it is required by each student's program. This means that what is reimbursable for one student may not necessarily be reimbursable for another.

RECOMMENDED FOR REIMBURSEMENT (Section 7(4)(a) of the Home Education Regulation):

Determine if the expense being claimed is for something related to:
• the programs of study;
• instructional materials; or
• other resources related to the home education program.

• Consumables – paper, pencils, art supplies, general workbooks, ink
• Curriculum based – workbooks, textbooks, reading books
• Online curriculum programs – learning programs on CD
• Learning aids – manipulatives (supported in the student program)
• Computers, technology equipment (i.e., printers), including repairs and upgrades
  Supervising authorities may set dollar limits on the amount spent on these types of expenses annually
• Internet services – 50% of monthly fee from September to end of August
• Tutoring – Group or individual lessons necessary for the student's program delivered by a subject matter expert who is not an immediate family member
• Lessons – including, but not limited to, music, swimming, and language lessons taught by a certified Instructor and in relation to the student's program.
• Tangible assets – e.g., cameras, telescopes, musical instruments, physical education equipment, sewing machines
• Home economic edibles
• Admissions/field trips (up to a maximum of 50% of the funding provided to parents)
  Ensure reimbursements are for activities related to the student's program, which may include zoo admission, theatre tickets related to literature study, museum admissions, science centre entrance fees, and multiuse recreation centres.
• Multiple admissions or annual passes are acceptable for activities when directly related to the student's home education program.
• Postage/shipping and handling from vendors to the home education family

NOT RECOMMENDED FOR HOME EDUCATION REIMBURSEMENT:

Expenses that are considered a cost of operating a home school and not associated with the program and/or usually required to be paid for by a parent of a student enrolled in a school operated by a board or independent school.

• Furniture
• Warranties/insurance
• Competitions – including, but not limited to, swim meets and tournament costs
• Registration fees – including, but not limited to, sports teams, community leagues, and summer camps
• Postage, fax costs and long-distance charges to an associate school board or independent school and its teachers
• Per Section 7(4)(b)(ii) of the Home Education Regulation, reimbursements to parents are not acceptable for personal remuneration or payment for travel costs or other expenses usually required to be paid by a parent of a student who is enrolled in a school operated by a board or independent school.
`;

const EDUCATION_COMPLIANCE_PROMPT = `
You are an expert evaluator for Alberta Home Education reimbursement compliance. Your task is to analyze purchase receipts and determine how well they align with Alberta Education's official reimbursement standards.

Based on the Alberta Home Education Reimbursement Standards provided above, evaluate the educational appropriateness of this purchase and provide:

1. EDUCATION COMPLIANCE SCORE (0-100):
   - 90-100: Clearly recommended items that strongly align with educational standards (curriculum materials, manipulatives, technology, instruments, science equipment)
   - 70-89: Generally acceptable educational items with minor concerns or unclear categorization
   - 50-69: Potentially eligible items but require review (may be borderline cases or need justification)
   - 30-49: Questionable items that may not meet standards (unclear educational value or borderline categories)
   - 0-29: Not recommended items that clearly don't meet standards (furniture, competitions, personal items)

2. EDUCATION CATEGORY:
   - "recommended": Clearly listed as recommended for reimbursement
   - "not-recommended": Clearly listed as not recommended for reimbursement  
   - "requires-review": Falls in gray area and needs manual evaluation
   - "unclear": Cannot determine educational appropriateness from available information

3. REIMBURSEMENT ELIGIBILITY:
   - "likely-eligible": Strong alignment with standards, minimal review needed
   - "requires-review": Needs manual evaluation but may be approved with justification
   - "not-eligible": Does not meet standards and unlikely to be approved

4. REASONING: Provide a clear explanation of:
   - Which specific standard(s) the purchase aligns with or violates
   - Why you assigned the compliance score
   - What makes this purchase educational or non-educational
   - Any concerns or considerations for reviewers

IMPORTANT EVALUATION CRITERIA:

RECOMMENDED ITEMS (High Scores 80-100):
- Consumables: paper, pencils, art supplies, workbooks, ink
- Curriculum materials: textbooks, workbooks, reading books
- Online curriculum programs and learning software
- Learning aids and manipulatives for educational purposes
- Technology: computers, printers, educational software, repairs
- Internet services (50% of monthly fees)
- Tutoring by qualified non-family members
- Certified instruction: music, swimming, language lessons
- Tangible educational assets: cameras, telescopes, musical instruments, PE equipment, sewing machines
- Home economics edibles (for cooking/baking education)
- Educational field trips and admissions (up to 50% of funding)
- Educational shipping costs

NOT RECOMMENDED ITEMS (Low Scores 0-30):
- Furniture (desks, chairs, shelving)
- Warranties and insurance
- Competition fees (swim meets, tournaments)
- Registration fees (sports teams, community leagues, summer camps)
- Personal remuneration for parents
- Travel costs typically paid by parents
- Communication costs to schools
- Items typically required by brick-and-mortar school parents

EVALUATION FOCUS:
- Does this purchase directly support a student's educational program?
- Is it an instructional material or educational resource?
- Would this be considered a normal school operating cost vs. student program cost?
- Is this something parents of brick-and-mortar students would typically pay for?

Provide specific, actionable feedback that helps families understand whether their purchase aligns with Alberta's standards.
`;

module.exports = {
  ALBERTA_EDUCATION_STANDARDS,
  EDUCATION_COMPLIANCE_PROMPT
};