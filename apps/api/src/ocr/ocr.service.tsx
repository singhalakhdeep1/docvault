import Tesseract from 'tesseract.js';

export class OCRService {
  async extractTextFromImage(imageBuffer: Buffer, language: string = 'eng') {
    try {
      const { data: { text, confidence } } = await Tesseract.recognize(
        imageBuffer,
        language,
        {
          logger: (m: any) => console.log(m),
        }
      );

      return {
        text,
        confidence,
        language,
      };
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  async extractTextFromPDF(pdfBuffer: Buffer) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        pdfBuffer,
        'eng',
        {
          logger: (m: any) => console.log(m),
        }
      );

      return {
        text,
        confidence: 0.9,
        language: 'eng',
      };
    } catch (error) {
      throw new Error(`PDF OCR extraction failed: ${error.message}`);
    }
  }

  async batchOCR(imageBuffers: Buffer[], language: string = 'eng') {
    const results = await Promise.allSettled(
      imageBuffers.map(buffer => this.extractTextFromImage(buffer, language))
    );

    return results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null,
    }));
  }

  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const patterns: Record<string, RegExp> = {
      eng: /[a-zA-Z]/,
      spa: /[áéíóúüñ¿¡]/,
      fra: /[àâäéèêëïîôùûüÿç]/,
      deu: /[äöüß]/,
      chi: /[\u4e00-\u9fff]/,
      jpn: /[\u3040-\u309f\u30a0-\u30ff]/,
      kor: /[\uac00-\ud7af]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'eng';
  }
}
