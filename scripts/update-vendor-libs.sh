#!/bin/bash

# This script updates the vendor libraries used by ReadRecall

echo "Updating vendor libraries..."

# Ensure the vendor directory exists
mkdir -p public/vendor

# Download JSZip library
echo "Downloading JSZip..."
curl -L https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js -o public/vendor/jszip.min.js

# Download EPUB.js library
echo "Downloading EPUB.js..."
curl -L https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js -o public/vendor/epub.min.js

# Make the script executable
chmod +x scripts/update-vendor-libs.sh

echo "All vendor libraries updated successfully!" 