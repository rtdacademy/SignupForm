# Section 3 Exam - Required Images

## Image Requirements

This directory should contain all images needed for the Physics 30 Section 3 Exam (Atomic and Nuclear Physics).

### Question Setup Images (All Questions)

For each question 1-25, you need setup images for both variants:

**Question Setup Images:**
- `q01_setup_v1.png` - Question 1 setup for variant A
- `q01_setup_v2.png` - Question 1 setup for variant B
- `q02_setup_v1.png` - Question 2 setup for variant A
- `q02_setup_v2.png` - Question 2 setup for variant B
- ... (continue for all 25 questions)

### Special Image-Based Answer Options

[To be determined based on exam content - add sections here for any questions that use image-based answer options]

### Notes

- All images should be PNG format for best quality
- Setup images show the problem scenario
- Option images are used as answer choices instead of text (if applicable)

### Asset Path

Images are referenced in the code using:
```javascript
const ASSET_PATH = '/courses/2/content/76-section-3-exam/assets/';
```

### Implementation Status

✅ **Code Complete**: All 25 questions implemented with proper image references
✅ **Master Function**: Routing configured for lesson 76
✅ **Course Config**: Gradebook integration with all questions
📁 **Assets**: Directory created, images need to be added

## File Naming Convention

- Question setup: `q[##]_setup_v[1|2].png`
- Answer options: `q[##]_option_[a-d]_v[1|2].png` (if applicable)
- Use two-digit question numbers (01, 02, etc.)
- Variants are numbered 1 and 2