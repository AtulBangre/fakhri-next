# Blog Images Setup Instructions

## Generated Blog Thumbnail Images

I've generated professional blog thumbnail images for all 6 blog posts. These images are currently saved in the artifacts directory:

### Image Files:
1. **PPC Strategies** - `blog_ppc_strategies_1769618535495.png`
2. **Listing Optimization** - `blog_listing_optimization_1769618574350.png`
3. **FBA Inventory** - `blog_fba_inventory_1769618607957.png`
4. **A+ Content** - `blog_aplus_content_1769618657746.png`
5. **Brand Registry** - `blog_brand_registry_1769618691055.png`
6. **International Expansion** - `blog_international_expansion_1769618717445.png`

## Setup Steps:

### 1. Create the images directory structure:
```bash
mkdir -p "g:/Project/Maurya technologies/fakhri-it-services/public/images/blog"
```

### 2. Copy the generated images to the public directory:

Copy each image from the artifacts directory to:
`g:/Project/Maurya technologies/fakhri-it-services/public/images/blog/`

Rename them as follows:
- `blog_ppc_strategies_*.png` → `ppc-strategies.jpg`
- `blog_listing_optimization_*.png` → `listing-optimization.jpg`
- `blog_fba_inventory_*.png` → `fba-inventory.jpg`
- `blog_aplus_content_*.png` → `aplus-content.jpg`
- `blog_brand_registry_*.png` → `brand-registry.jpg`
- `blog_international_expansion_*.png` → `international-expansion.jpg`

### 3. Alternative: Use placeholders temporarily

If you want to test immediately, you can update the `data/blog.js` file to use placeholder images from services like:
- `https://placehold.co/1200x600/png?text=Blog+Title`
- Or any other image URLs you prefer

## File Paths Expected:

The blog data file (`data/blog.js`) references these images:
- `/images/blog/ppc-strategies.jpg`
- `/images/blog/listing-optimization.jpg`
- `/images/blog/fba-inventory.jpg`
- `/images/blog/aplus-content.jpg`
- `/images/blog/brand-registry.jpg`
- `/images/blog/international-expansion.jpg`

These paths will work once the images are placed in the `public/images/blog/` directory.
