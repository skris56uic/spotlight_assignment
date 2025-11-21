# Figma to HTML Converter

A tool to convert Figma designs into high-fidelity HTML/CSS with accurate layout, typography, colors, and gradients.

## Features

- **Auto Layout to Flexbox**: Converts Figma's Auto Layout to CSS Flexbox
- **Absolute Positioning**: Handles non-Auto Layout frames with precise positioning
- **Typography**: Automatically loads Google Fonts used in the design
- **Gradients**: Calculates correct gradient angles from Figma's gradient handles
- **Styling**: Supports backgrounds, borders, shadows, border-radius, and more

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   FIGMA_API_KEY_TOKEN=your_figma_personal_access_token
   FIGMA_FILE_URL=https://www.figma.com/design/YOUR_FILE_KEY/Your-File-Name
   ```

   **How to get your Figma Personal Access Token:**
   - Go to Figma → Settings → Account → Personal Access Tokens
   - Click "Generate new token"
   - Copy the token and paste it in your `.env` file

   **How to get the Figma File URL:**
   - Open your Figma file in the browser
   - Copy the full URL from the address bar

## Usage

Simply run the conversion command:

```bash
npm run convert
```

This will:
1. Build the TypeScript code
2. Fetch the Figma file from the URL specified in `.env`
3. Convert the design to HTML/CSS
4. Save the output to `output/Frame.html`

## Viewing the Output

After running the conversion, open the generated HTML file in your browser:

```bash
# On Windows
start output/Frame.html

# On macOS
open output/Frame.html

# On Linux
xdg-open output/Frame.html
```

Or simply navigate to the `output` directory and double-click `Frame.html`.

## Output Structure

The generated HTML file includes:
- Embedded CSS styles
- Google Fonts links (automatically detected from the design)
- Black background for better visibility
- Pixel-perfect positioning and spacing
- Accurate colors, gradients, and typography

## Notes

- The converter currently supports the first top-level frame in the Figma file
- Output is saved to the `output` directory by default
- The Figma API has rate limits - if you encounter a 429 error, wait a few minutes before retrying
