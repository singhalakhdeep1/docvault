// Elasticsearch client for docvault

import { Client } from '@elastic/elasticsearch';

class ElasticsearchService {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_AUTH
        ? { username: process.env.ELASTICSEARCH_USERNAME, password: process.env.ELASTICSEARCH_PASSWORD }
        : undefined,
    });
  }

  async indexDocument(index: string, id: string, document: any) {
    try {
      await this.client.index({
        index,
        id,
        document,
      });
      return { success: true, message: 'Document indexed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async search(index: string, query: any) {
    try {
      const response = await this.client.search({
        index,
        query,
      });
      return { success: true, hits: response.hits.hits, total: response.hits.total };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getDocument(index: string, id: string) {
    try {
      const response = await this.client.get({
        index,
        id,
      });
      return { success: true, document: response._source };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateDocument(index: string, id: string, document: any) {
    try {
      await this.client.update({
        index,
        id,
        doc: document,
      });
      return { success: true, message: 'Document updated successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(index: string, id: string) {
    try {
      await this.client.delete({
        index,
        id,
      });
      return { success: true, message: 'Document deleted successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createIndex(index: string, mappings: any) {
    try {
      await this.client.indices.create({
        index,
        mappings,
      });
      return { success: true, message: 'Index created successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async bulkIndex(index: string, documents: any[]) {
    try {
      const body = documents.flatMap((doc) => [
        { index: { _index: index, _id: doc.id } },
        doc,
      ]);
      await this.client.bulk({ refresh: true, body });
      return { success: true, message: 'Documents indexed successfully' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async searchWithHighlight(index: string, query: any, highlightFields: string[]) {
    try {
      const response = await this.client.search({
        index,
        query,
        highlight: {
          fields: highlightFields.reduce((acc, field) => ({ ...acc, [field]: {} }), {}),
        },
      });
      return { success: true, hits: response.hits.hits };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    try {
      await this.client.ping();
      return { success: true, message: 'Elasticsearch connection successful' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const elasticsearchService = new ElasticsearchService();
