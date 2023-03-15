export interface Translation {
  text: string;
  from: string;
  to: string;
  api: string;
}

export interface Translator {
  readonly name: string;
  translate(text: string, targetLanguage: string, sourceLanguage?: string): Promise<Translation>;
}
