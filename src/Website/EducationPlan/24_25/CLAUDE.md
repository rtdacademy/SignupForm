# Education Plan 2024-25 Development Guide

## Project Context

This directory contains the Education Plan for RTD Academy for the 2024-25 school year. The Education Plan is a critical document required by Alberta Education that outlines our three-year educational priorities, strategies, and performance measures.

### Technology Stack
- **React** with functional components and hooks
- **Tailwind CSS** for styling
- **shadcn/ui** component library for UI elements
- **React Router** for navigation
- **Lucide-react** for icons

### Component Structure

The main education plan uses a modular component structure:

```
24_25/
├── EducationPlan.js (main component with sheet navigation)
├── Components/
│   ├── StudentInformation.js
│   ├── CurrentProgress.js
│   ├── AcademicGoals.js
│   ├── CareerPlanning.js
│   ├── PersonalDevelopment.js
│   └── NextSteps.js
└── CLAUDE.md (this file)
```

### Navigation System

The education plan uses a sheet-based navigation system:
- Menu button in top-right corner opens a navigation sheet
- Each section has a ref for smooth scrolling
- Navigation items correspond to major components
- Uses `scrollIntoView` for smooth navigation

### UI Components Used

From shadcn/ui:
- `Card` - Primary container for content sections
- `Sheet` - Side navigation drawer
- `Button` - Navigation and action buttons
- `Badge` - Status indicators and labels
- `Progress` - Progress bars for completion tracking
- `Tabs` - Tabbed content (if needed)

### Data Handling

All data is currently sample data marked clearly with:
- "(Sample)" labels
- Yellow warning cards indicating demo content
- Comments in code marking sample data sections

---

# Comprehensive Guide to Creating Your Third-Year Education Plan for RTD Academy

## Executive Summary

Based on your Annual Education Results Report (AERR) for 2023-24 and Alberta's requirements, I've created this comprehensive guide for developing the third year of your three-year education plan. This guide is specifically tailored for RTD Academy as an online private school specializing in mathematics and STEM education.

## Part 1: Third-Year Plan Requirements Under Alberta's Assurance Framework

### Critical Year 3 Requirements

The third year of your education plan represents both a culmination of your current cycle and a transition to your next planning period. Your plan must include:

#### Comprehensive Evaluation and Reflection
- Analyze the entire three-year cycle's effectiveness
- Document lessons learned from all implementation phases
- Assess overall impact on student learning outcomes

#### Results Analysis with Three-Year Trends
- Analyze provincial assurance measures using three-year rolling averages
- Compare your 2023-24 AERR data with previous years' results
- Identify improvement trends in key areas (completion rates, course performance, stakeholder satisfaction)

#### Transition Planning Elements
- Build a bridge between current achievements and future goals
- Use Year 3 analysis as foundation for the next three-year cycle
- Ensure continuity of successful strategies

#### Complete Documentation of Your Improvement Journey
- Celebrate successes (like your 89% student satisfaction rate)
- Acknowledge ongoing challenges (like your 60.9% Math 30-1 diploma exam rate)
- Show evidence of responsive action based on previous results

## Part 2: Required Components for RTD Academy's Plan

### 1. Accountability Statement

The Education Plan for RTD Academy for 2024-2027 was prepared under the direction of the Board of Directors in accordance with the responsibilities under the Private Schools Regulation and the Ministerial Grants Regulation. This plan was developed in the context of the provincial government's business and fiscal plans. The Board has used performance results to develop the plan and is committed to implementing the strategies contained within the plan to improve student learning and results.

The Board approved the 2024-2027 Education Plan on [DATE].

Board Chair: [NAME]
Board Chair Signature: _______________________

### 2. Foundational Statements

Update your mission, vision, and values with a focus on your asynchronous learning model and STEM focus. For example:

- **Mission**: Providing high-quality, accessible asynchronous education that empowers students to excel in mathematics and STEM
- **Vision**: To be Alberta's premier online provider of mathematics and STEM education
- **Values**: Accessibility, Flexibility, Excellence, Innovation, Support

### 3. Stakeholder Engagement Evidence

Document how you've engaged with:
- Students (via registration surveys and exit surveys)
- Parents/guardians (through weekly updates)
- Board members (bi-monthly meetings)
- Alberta Education (ongoing consultations)
- Community partners

Include how their feedback shaped your plan (especially the strong satisfaction rates from your AERR).

### 4. Education Plan Priorities and Outcomes

Based on your AERR data, address these areas within the five assurance domains:

#### Domain 1: Student Growth and Achievement

**Priority 1: Enhance Student Achievement in Mathematics**
- Context: Your AERR shows Math 10C (73.20%) and Math 20-2 (72.93%) need attention, while Math 31 (85.02%) performs well
- Outcome: Improved mathematics achievement across all courses
- Strategies:
  - Enhanced support for Math 10C and Math 20-2
  - Expanded "Rock the Diploma" preparation for Math 30-1/-2
  - Improvement plan for diploma exam results (addressing the 60.9% vs 81.5% provincial average)

#### Domain 2: Teaching and Leading

**Priority 2: Strengthen Instructional Approaches in Online Learning**
- Context: Your asynchronous model shows strong completion rates (77.6% overall)
- Outcome: Enhanced teacher effectiveness in asynchronous environments
- Strategies:
  - Professional development on online pedagogical approaches
  - Implementation of lessons learned from course completion data

#### Domain 3: Learning Supports

**Priority 3: Enhance Early Identification and Support Systems**
- Context: Your AERR identified 45 students falling behind or inactive
- Outcome: Improved retention and completion rates
- Strategies:
  - Implementation of early warning system
  - Individualized support for at-risk students
  - Enhanced digital literacy support

#### Domain 4: Governance

**Priority 4: Strengthen Communication with Stakeholders**
- Context: Your weekly email updates and stakeholder engagement show positive results
- Outcome: Enhanced stakeholder involvement in student success
- Strategies:
  - Further development of custom communication software
  - Increased parent engagement in orientation meetings

#### Domain 5: Local and Societal Context

**Priority 5: Expand Access to Quality STEM Education**
- Context: Your diverse student population (806 students in 2023-24)
- Outcome: Increased educational opportunities for diverse learners
- Strategies:
  - Expanded course offerings based on successful subjects
  - Specific outreach to underrepresented groups

### 5. First Nations, Métis, and Inuit Student Success

Based on your 8 First Nations students mentioned in previous documentation:
- Gap-closing strategies specific to Indigenous students
- Cultural integration plans for curriculum
- Indigenous engagement processes
- Performance measures specific to Indigenous student success

### 6. Performance Measures Framework

**Provincial Measures (Required)**
- Student Learning Engagement
- Education Quality
- Citizenship
- Welcoming, Caring, Respectful, and Safe Learning Environments
- Access to Supports and Services
- Diploma Examination Results
- Provincial Achievement Tests (if applicable)
- High School Completion Rates

**Local Measures (Based on your AERR)**
- Course completion rates (targeting improvement from 77.6%)
- Student satisfaction (maintaining 89% satisfaction)
- Parent satisfaction (maintaining 90% satisfaction)
- Performance in key mathematics courses (improvement in Math 10C and Math 20-2)
- Custom stakeholder surveys

### 7. Implementation Plan

Detail how you will:
- **Resource allocation**: Align budget with priorities
- **Timeline**: Schedule key actions throughout the year
- **Roles**: Assign responsibilities for each strategy
- **Monitoring**: Establish regular review of progress
- **Adjustment mechanisms**: Process for mid-year strategy modifications

### 8. Budget Summary

Provide a high-level overview of how resources will be allocated to support each priority.

## Part 3: Template Structure for RTD Academy's Plan

Based on your current AERR structure and Alberta's requirements, your education plan should include:

### I. Introduction and Context
- School profile (online, asynchronous, STEM focus)
- Student demographics
- School authority context
- Brief summary of progress from previous years

### II. Accountability Statement

### III. Stakeholder Engagement Process
- Engagement methods
- Key findings
- How input shaped the plan

### IV. Vision, Mission, and Values
- Updated statements
- Alignment with Alberta Education framework

### V. Domain Analysis and Priorities

For each assurance domain, include:
- Data analysis (from AERR)
- Priority statement
- Outcome(s)
- Performance measures (provincial and local)
- Strategies and actions
- Resource implications
- Timeline for implementation

### VI. First Nations, Métis, and Inuit Education
- Dedicated section addressing Indigenous education
- Specific measures and strategies

### VII. Budget Alignment
- How resources support priorities
- Program funding details

### VIII. Conclusion and Future Direction
- Summary of key priorities
- Transition to next planning cycle vision

## Part 4: Comparative Analysis Requirements

A critical component of your third-year plan is demonstrating continuous improvement through comparative analysis:

### Year-Over-Year Data Analysis

Use charts similar to your React components to visualize:
- Three-year trends in completion rates
- Performance improvements in key courses
- Stakeholder satisfaction trends

### Strategic Effectiveness Assessment

Evaluate how your previous strategies performed:
- Which interventions showed the best results?
- What adjustments were made based on feedback?
- Which areas still need improvement?

### Evidence of Responsive Action

Document how you've adapted based on previous results:
- Changes to course delivery based on completion rates
- Enhancements to support systems for at-risk students
- Communication improvements based on stakeholder feedback

## Part 5: Special Considerations for RTD Academy

### Online Asynchronous Learning Focus
- Address the unique context of flexible scheduling
- Include strategies specifically designed for non-primary students (635 students in your AERR)
- Incorporate lessons from your asynchronous communication challenges

### Mathematics Performance Emphasis
- Targeted strategies for diploma exam preparation
- Course-specific improvement plans (especially Math 10C at 73.20%)
- Support resources for challenging courses

### Diverse Student Population
- Strategies for different student categories (primary, non-primary, adult, home education)
- Support systems tailored to each group's needs
- Completion strategies for varied student circumstances

## Component Development Guidelines

### Creating New Components

When creating new components for the Education Plan:

1. **Follow the existing pattern**:
   ```javascript
   import React from 'react';
   import { Card } from "../../../../components/ui/card";
   
   const ComponentName = () => {
     // Component logic
     return (
       <section className="space-y-4">
         <h2 className="text-2xl font-semibold mb-4">Section Title</h2>
         {/* Content */}
       </section>
     );
   };
   
   export default ComponentName;
   ```

2. **Use consistent styling**:
   - Section spacing: `className="space-y-4"`
   - Headers: `className="text-2xl font-semibold mb-4"`
   - Cards: Use the Card component for content containers
   - Grid layouts: `className="grid grid-cols-1 md:grid-cols-2 gap-6"`

3. **Add to navigation**:
   - Create a ref in EducationPlan.js
   - Add to navigationItems array
   - Import and include the component

### Data Integration

When ready to integrate real data:

1. Replace sample data objects with Firebase queries
2. Add loading states and error handling
3. Remove sample data warnings
4. Update component logic to handle dynamic data

### Best Practices

1. **Accessibility**: Ensure all components are keyboard navigable
2. **Responsive Design**: Use Tailwind's responsive classes
3. **Error Handling**: Include appropriate error states
4. **Loading States**: Add skeleton loaders or spinners
5. **Data Validation**: Validate all data before rendering

## Conclusion

This template provides a comprehensive framework for creating your third-year education plan that meets Alberta's requirements while addressing RTD Academy's unique context. By incorporating your AERR data, you can demonstrate continuous improvement and set the stage for your next three-year cycle.

Follow these guidelines to develop a plan that not only satisfies provincial requirements but also provides a meaningful roadmap for continuing RTD Academy's success in providing flexible, high-quality mathematics and STEM education.