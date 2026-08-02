// Algolia client for docvault

import algoliasearch from 'algoliasearch';

class AlgoliaService {
  private client: algoliasearch.SearchClient;

  constructor() {
    this.client = algoliasearch(
      process.env.ALGOLIA_APP_ID || 'your-app-id',
      process.env.ALGOLIA_API_KEY || 'your-api-key'
    );
  }

  async indexDocument(indexName: string, document: any) {
    try {
      const index = this.client.initIndex(indexName);
      await index.saveObject(document);
      return { success: true, message: 'Document indexed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async search(indexName: string, query: string, searchParams: any = {}) {
    try {
      const index = this.client.initIndex(indexName);
      const response = await index.search(query, searchParams);
      return { success: true, hits: response.hits, nbHits: response.nbHits };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getDocument(indexName: string, objectID: string) {
    try {
      const index = this.client.initIndex(indexName);
      const response = await index.getObject(objectID);
      return { success: true, document: response };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateDocument(indexName: string, objectID: string, document: any) {
    try {
      const index = this.client.initIndex(indexName);
      await index.partialUpdateObject({ ...document, objectID });
      return { success: true, message: 'Document updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(indexName: string, objectID: string) {
    try {
      const index = this.client.initIndex(indexName);
      await index.deleteObject(objectID);
      return { success: true, message: 'Document deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async bulkIndex(indexName: string, documents: any[]) {
    try {
      const index = this.client.initIndex(indexName);
      await index.saveObjects(documents);
      return { success: true, message: 'Documents indexed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearIndex(indexName: string) {
    try {
      const index = this.client.initIndex(indexName);
      await index.clearObjects();
      return { success: true, message: 'Index cleared successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async setSettings(indexName: string, settings: any) {
    try {
      const index = this.client.initIndex(indexName);
      await index.setSettings(settings);
      return { success: true, message: 'Settings updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      const response = await this.client.listIndices();
      return { success: true, message: 'Algolia connection successful', indices: response.items };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const algoliaService = new AlgoliaService();
