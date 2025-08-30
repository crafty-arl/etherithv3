# Headshot Image Setup

## Required Image File

To complete the hero image setup, you need to add a `head-shot.jpg` file to the `etherith/public/` directory.

### Steps:
1. Place your headshot image file named `head-shot.jpg` in the `etherith/public/` directory
2. The image should be at least 400x400 pixels for optimal display
3. The image will be displayed as a circular hero image on the home page

### File Structure:
```
etherith/
├── public/
│   ├── head-shot.jpg  ← Place your image here
│   ├── next.svg
│   ├── vercel.svg
│   └── ... (other public files)
├── content.json       ← Contains heroImg: "head-shot.jpg"
└── src/app/page.tsx  ← Displays the hero image
```

### Image Requirements:
- Format: JPG/JPEG
- Filename: `head-shot.jpg` (exact match)
- Location: `etherith/public/head-shot.jpg`
- Recommended size: 400x400 pixels or larger
- Aspect ratio: 1:1 (square) works best for circular display

Once you add the image file, the hero section will automatically display it on the home page.
