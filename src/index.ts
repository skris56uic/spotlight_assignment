import { FigmaClient } from './figma/client';
import { FigmaConverter } from './figma/converter';
import { collectImageNodes } from './figma/assets';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const figmaUrl = process.env.FIGMA_FILE_URL;

    if (!figmaUrl) {
        console.error('Error: FIGMA_FILE_URL is required in .env');
        process.exit(1);
    }

    // Extract file key from URL - Match 'file/KEY' or 'design/KEY'
    const match = figmaUrl.match(/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match || !match[1]) {
        console.error('Error: Could not extract file key from FIGMA_FILE_URL.');
        process.exit(1);
    }

    const fileKey = match[1];
    const outputDir = './output';

    console.log(`Fetching Figma file: ${fileKey}...`);

    const client = new FigmaClient();

    try {
        const document = await client.getFile(fileKey);

        const canvas = document.document.children?.find(c => c.type === 'CANVAS');
        if (!canvas || !canvas.children || canvas.children.length === 0) {
            console.error('No content found in Figma file.');
            return;
        }

        // Convert the first top-level frame
        const rootFrame = canvas.children[0];
        console.log(`Converting node: ${rootFrame.name} (${rootFrame.type})...`);

        // 1. Identify image nodes
        const imageNodeIds = collectImageNodes(rootFrame);
        console.log(`Found ${imageNodeIds.length} image/vector nodes.`);

        // 2. Fetch image URLs
        let imageMap: Record<string, string> = {};
        if (imageNodeIds.length > 0) {
            console.log('Fetching image URLs...');
            // Fetch as PNG for now to ensure compatibility
            imageMap = await client.getImages(fileKey, imageNodeIds, 'png');
        }

        const converter = new FigmaConverter(imageMap);
        const html = converter.convert(rootFrame);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, 'Frame.html');
        fs.writeFileSync(outputPath, html);

        console.log(`Conversion complete! Saved to ${outputPath}`);

    } catch (error) {
        console.error('Conversion failed:', error);
        process.exit(1);
    }
}

main();
