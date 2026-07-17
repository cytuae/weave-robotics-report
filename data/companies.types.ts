/** Type definitions for the China report data layer (consumed as JSON at runtime). */

export type ConfidenceGrade = 'A' | 'A/B' | 'B' | 'B+' | 'B/C' | 'C' | 'D';

export type ProductCategory = 'floors' | 'glass' | 'pool' | 'garden' | 'solar';

export type PartnershipPath = 'shortlist' | 'agency';

export type SourceGrade = 'A' | 'B' | 'C';

export interface Source {
  id: string;
  title: string;
  url: string;
  type: SourceGrade;
}

export interface Company {
  id: string;
  num: string;
  name: string;
  nameAr: string;
  nameCn: string;
  slug: string;
  type: string;
  typeAr: string;
  city: string;
  cityAr: string;
  trust: ConfidenceGrade | string;
  privateLabel: number;
  floors: number;
  specialty: number;
  saudi: number;
  priority: number;
  path: PartnershipPath;
  categories: ProductCategory[];
  badgeNote: string;
  summary: string;
  page: string;
  founded: string;
  sources: string[];
}

export interface CompaniesFile {
  updated: string;
  market: string;
  companies: Company[];
}

export interface SourcesFile {
  sources: Record<string, Source>;
}
