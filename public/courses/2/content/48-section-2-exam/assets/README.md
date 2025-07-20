# Section 2 Exam - Required Images

## Image Requirements

This directory should contain all images needed for the Physics 30 Section 2 Exam (Electromagnetism).

### Question Setup Images (All Questions)

For each question 1-25, you need setup images for both variants:

**Question Setup Images:**
- `q01_setup_v1.png` - Question 1 setup for variant A
- `q01_setup_v2.png` - Question 1 setup for variant B
- `q02_setup_v1.png` - Question 2 setup for variant A
- `q02_setup_v2.png` - Question 2 setup for variant B
- ... (continue for all 25 questions)

### Special Image-Based Answer Options

Three questions require image-based answer options (students select from visual diagrams):

**Q1 (Variant A only)** - Free-body diagram options:
- `q01_option_a_v1.png` - Option A diagram
- `q01_option_b_v1.png` - Option B diagram  
- `q01_option_c_v1.png` - Option C diagram (correct)
- `q01_option_d_v1.png` - Option D diagram

**Q20 (Variant B only)** - Magnetic field diagram options:
- `q20_option_a_v2.png` - Option A diagram
- `q20_option_b_v2.png` - Option B diagram
- `q20_option_c_v2.png` - Option C diagram (correct)
- `q20_option_d_v2.png` - Option D diagram

**Q21 (Variant A only)** - Direction matching with field arrows:
- `q21_option_a_v1.png` - Option A diagram
- `q21_option_b_v1.png` - Option B diagram (correct)
- `q21_option_c_v1.png` - Option C diagram
- `q21_option_d_v1.png` - Option D diagram

### Notes

- All images should be PNG format for best quality
- Setup images show the problem scenario
- Option images are used as answer choices instead of text
- The correct options are marked above for reference
- Q20 has swapped versions (V1 content became V2, V2 became V1)

### Asset Path

Images are referenced in the code using:
```javascript
const ASSET_PATH = '/courses/2/content/48-section-2-exam/assets/';
```

### Implementation Status

✅ **Code Complete**: All 25 questions implemented with proper image references
✅ **Master Function**: Routing configured for lesson 48
✅ **Course Config**: Gradebook integration with all questions (32 total points)
📁 **Assets**: Directory created, images need to be added

## File Naming Convention

- Question setup: `q[##]_setup_v[1|2].png`
- Answer options: `q[##]_option_[a-d]_v[1|2].png`
- Use two-digit question numbers (01, 02, etc.)
- Variants are numbered 1 and 2