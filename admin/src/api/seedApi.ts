import client from './client';

export interface SeedSheetStat {
  total: number;
  success: number;
  failed: number;
}

export interface SeedError {
  sheet: string;
  row: number;
  reason: string;
}

export interface SeedImportResponse {
  dryRun: boolean;
  categories: SeedSheetStat;
  ingredients: SeedSheetStat;
  ingredientSynonyms: SeedSheetStat;
  unitConversions: SeedSheetStat;
  recipes: SeedSheetStat;
  recipeIngredients: SeedSheetStat;
  recipeSteps: SeedSheetStat;
  totalErrors: number;
  errors: SeedError[];
}

export async function uploadSeedExcel(file: File, dryRun: boolean): Promise<SeedImportResponse> {
  const form = new FormData();
  form.append('file', file);
  form.append('dryRun', String(dryRun));
  return client.post('/admin/seed/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<SeedImportResponse>;
}

export async function downloadSeedExcel(): Promise<Blob> {
  const response = await client.get('/admin/seed/download', {
    responseType: 'blob',
    transformResponse: [(data) => data], // interceptor의 .data 추출 우회
  });
  return response as unknown as Blob;
}
