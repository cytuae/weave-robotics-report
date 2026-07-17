/** Types for the visual product catalog (section 7.16). */

export type ProductCategory = 'floors' | 'glass' | 'pool' | 'garden' | 'solar';

export type ProductStatus = 'current' | 'legacy' | 'announced' | 'rfq-only';

export type SaudiFit = 'high' | 'medium' | 'low' | 'testing';

export type ProductRole = 'agency' | 'benchmark' | 'possible_pl';

export interface RobotProduct {
  id: string;
  companyId: string;
  company: string;
  companyAr: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  status: ProductStatus;
  typeUse: string;
  keySpecs: string[];
  productUrl: string;
  videoUrl: string;
  videoType: 'official' | 'independent' | '';
  saudiFit: SaudiFit;
  saudiNote: string;
  role: ProductRole;
  roleAr: string;
  imagePending?: boolean;
}

export interface ProductsFile {
  updated: string;
  note: string;
  products: RobotProduct[];
}
