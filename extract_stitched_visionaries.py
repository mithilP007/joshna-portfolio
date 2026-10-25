#!/usr/bin/env python3
"""
Stitched Visionaries Collection PDF Page Extractor
--------------------------------------------------
Extracts pages of 'Stitched Visionaries.pdf' into high-quality images in the images/ directory.
Supports pdftoppm (poppler-utils), PyMuPDF (fitz), pdf2image, or pypdfium2.
"""

import os
import sys
import glob
import re
import subprocess
import shutil

OUTPUT_DIR = "images"
PDF_FILE = "Stitched Visionaries.pdf"
PREFIX = "stitched-visionaries-page"
DPI = 150  # High-definition retina quality matching existing portfolio pages


def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]


def extract_with_pdftoppm(pdf_path, output_dir, prefix, dpi=150):
    print(f"[*] Using pdftoppm (poppler) at {dpi} DPI...")
    base_prefix = os.path.join(output_dir, prefix)
    cmd = [
        "pdftoppm",
        "-png",
        "-r", str(dpi),
        pdf_path,
        base_prefix
    ]
    subprocess.run(cmd, check=True)

    # Normalize filenames safely using natural sort to stitched-visionaries-page-1.png, etc.
    generated_files = sorted(
        [f for f in glob.glob(os.path.join(output_dir, f"{prefix}-*.png")) if not os.path.basename(f).startswith("temp_")],
        key=natural_sort_key
    )
    temp_files = []
    for idx, filepath in enumerate(generated_files, start=1):
        temp_name = os.path.join(output_dir, f"temp_{prefix}_{idx}.png")
        if os.path.exists(temp_name):
            os.remove(temp_name)
        os.rename(filepath, temp_name)
        temp_files.append(temp_name)

    for idx, temp_path in enumerate(temp_files, start=1):
        target_name = os.path.join(output_dir, f"{prefix}-{idx}.png")
        if os.path.exists(target_name):
            os.remove(target_name)
        os.rename(temp_path, target_name)

    return len(generated_files)


def extract_with_fitz(pdf_path, output_dir, prefix, dpi=150):
    import fitz  # PyMuPDF
    print(f"[*] Using PyMuPDF (fitz) at {dpi} DPI...")
    doc = fitz.open(pdf_path)
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    for idx, page in enumerate(doc, start=1):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out_path = os.path.join(output_dir, f"{prefix}-{idx}.png")
        pix.save(out_path)
    return len(doc)


def extract_with_pdf2image(pdf_path, output_dir, prefix, dpi=150):
    from pdf2image import convert_from_path
    print(f"[*] Using pdf2image at {dpi} DPI...")
    images = convert_from_path(pdf_path, dpi=dpi)
    for idx, img in enumerate(images, start=1):
        out_path = os.path.join(output_dir, f"{prefix}-{idx}.png")
        img.save(out_path, "PNG")
    return len(images)


def extract_with_pypdfium2(pdf_path, output_dir, prefix, dpi=150):
    import pypdfium2 as pdfium
    print(f"[*] Using pypdfium2 at {dpi} DPI...")
    pdf = pdfium.PdfDocument(pdf_path)
    scale = dpi / 72.0
    for idx, page in enumerate(pdf, start=1):
        image = page.render(scale=scale).to_pil()
        out_path = os.path.join(output_dir, f"{prefix}-{idx}.png")
        image.save(out_path)
    return len(pdf)


def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else PDF_FILE
    if not os.path.exists(pdf_path):
        print(f"[!] Error: Could not find PDF file '{pdf_path}'")
        sys.exit(1)

    print(f"[+] Found PDF: {pdf_path}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    extracted_count = 0
    # Try pdftoppm first if installed (fastest and native)
    if shutil.which("pdftoppm"):
        try:
            extracted_count = extract_with_pdftoppm(pdf_path, OUTPUT_DIR, PREFIX, DPI)
        except Exception as e:
            print(f"[-] pdftoppm failed: {e}")

    # Fallback to python packages
    if extracted_count == 0:
        for method, extractor in [
            ("PyMuPDF", extract_with_fitz),
            ("pdf2image", extract_with_pdf2image),
            ("pypdfium2", extract_with_pypdfium2),
        ]:
            try:
                extracted_count = extractor(pdf_path, OUTPUT_DIR, PREFIX, DPI)
                break
            except ImportError:
                continue
            except Exception as e:
                print(f"[-] {method} failed: {e}")

    if extracted_count == 0:
        print("[!] Error: No suitable extraction tool available.")
        print("    Please install poppler-utils (sudo apt install poppler-utils) or pymupdf (pip install pymupdf)")
        sys.exit(1)

    print(f"\n[✓] Successfully extracted {extracted_count} pages into '{OUTPUT_DIR}/':")
    for idx in range(1, extracted_count + 1):
        img_file = os.path.join(OUTPUT_DIR, f"{PREFIX}-{idx}.png")
        if os.path.exists(img_file):
            size_mb = os.path.getsize(img_file) / (1024 * 1024)
            print(f"    - {img_file} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
