import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import { FigmaDocument, FigmaNode } from './types';

dotenv.config();

export class FigmaClient {
  private client: AxiosInstance;

  constructor(apiKey?: string) {
    const token = apiKey || process.env.FIGMA_API_KEY_TOKEN;
    if (!token) {
      throw new Error('Figma API key is required. Set FIGMA_API_KEY_TOKEN in .env or pass it to the constructor.');
    }

    this.client = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': token,
      },
    });
  }

  async getFile(fileKey: string): Promise<FigmaDocument> {
    try {
      const response = await this.client.get<FigmaDocument>(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma file:', error);
      throw error;
    }
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<Record<string, FigmaNode>> {
    try {
      const response = await this.client.get<{ nodes: Record<string, FigmaNode> }>(`/files/${fileKey}/nodes`, {
        params: { ids: nodeIds.join(',') },
      });
      return response.data.nodes;
    } catch (error) {
      console.error('Error fetching Figma nodes:', error);
      throw error;
    }
  }

  async getImages(fileKey: string, nodeIds: string[], format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png'): Promise<Record<string, string>> {
    try {
      const response = await this.client.get<{ images: Record<string, string> }>(`/images/${fileKey}`, {
        params: { ids: nodeIds.join(','), format },
      });
      return response.data.images;
    } catch (error) {
      console.error('Error fetching Figma images:', error);
      throw error;
    }
  }
}
