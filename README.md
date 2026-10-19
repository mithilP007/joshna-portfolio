# Joshna Christa S B - Fashion Design Portfolio

A modern, responsive, single-page fashion design portfolio website built with HTML5, CSS3, and Vanilla JavaScript. Features seamless high-resolution vertical scrolling, mobile slide-out navigation drawer, sticky glassmorphic header, and multi-slide interactive viewing.

## 🌟 Features

- **Responsive Design**: Spans 100% viewport width across desktop, laptop, tablet, and mobile screens with zero horizontal overflow.
- **Multi-Slide Tab Navigation**: Toggle seamlessly between portfolio collections:
  - `01. About me`
  - `02. Graphic Tshirt`
  - `03. Casual formal shirt`
  - `04. Smart casual`
  - `05. contemporary urban casualwear`
  - `06. Womens`
- **Mobile Drawer Menu**: Smooth slide-out navigation drawer with hamburger toggle and 'X' close button.
- **Glassmorphic Sticky Header**: Fixed top navigation with subtle blur and active link indicator.
- **High-Definition Assets**: Retina-ready artwork extracted from high-quality design boards.
- **Python Extractor**: Automated scripts (`extract_pages.py`, `extract_womens.py`) to convert PDF design boards into high-quality images.

## 📁 Project Structure

```
.
├── index.html         # Main single-page web structure
├── styles.css         # Responsive styling, design tokens & animations
├── script.js          # Navigation logic, drawer toggles & slide switcher
├── extract_pages.py   # High-resolution PDF page extraction script
├── extract_womens.py  # Womens collection PDF page extraction script
├── images/            # Extracted portfolio slide artwork
└── README.md          # Project documentation
```

## 🚀 Running Locally

You can run the portfolio locally using Python's built-in HTTP server:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in any web browser.

## 🛠 Extracting Pages from PDF

If you ever update the source PDF portfolio, extract the pages using:

```bash
# Extract main portfolio pages
python3 extract_pages.py

# Or extract Womens collection pages
python3 extract_womens.py
```
