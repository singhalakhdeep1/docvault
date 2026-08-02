// Typesense client for docvault

import Typesense from 'typesense';

class TypesenseService {
  private client: Typesense.Client;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || 'localhost',
          port: parseInt(process.env.TYPESENSE_PORT || '8108'),
          protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
      connectionTimeoutSeconds: 2,
    });
  }

  async indexDocument(collection: string, document: any) {
    try {
      await this.client.collections(collection).documents().create(document);
      return { success: true, message: 'Document indexed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async search(collection: string, query: string, searchParams: any = {}) {
    try {
      const response = await this.client.collections(collection).documents().search({
        q: query,
        query_by: 'title,content',
        ...searchParams,
      });
      return { success: true, hits: response.hits, found: response.found };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getDocument(collection: string, id: string) {
    try {
      const response = await this.client.collections(collection).documents(id).retrieve();
      return { success: true, document: response.document };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateDocument(collection: string, id: string, document: any) {
    try {
      await this.client.collections(collection).documents(id).update(document);
      return { success: true, message: 'Document updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(collection: string, id: string) {
    try {
      await this.client.collections(collection).documents(id).delete();
      return { success: true, message: 'Document deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createCollection(schema: any) {
    try {
      await this.client.collections().create(schema);
      return { success: true, message: 'Collection created successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteCollection(collection: string) {
    try {
      await this.client.collections(collection).delete();
      return { success: true, message: 'Collection deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      const response = await this.client.collections().retrieve();
      return { success: true, message: 'Typesense connection successful', collections: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const typesenseService = new TypesenseService();
