/** Types for Saudi market competition (section 7.17) and monthly price watch. */

export type PresenceBadge = 'official' | 'retail' | 'marketplace' | 'grey-risk';

export type Channel =
  | 'official-saudi'
  | 'amazon-sa'
  | 'noon-sa'
  | 'jarir'
  | 'extra'
  | 'marketplace'
  | 'other';

export type WarrantyType = 'manufacturer-saudi' | 'retailer' | 'seller' | 'unknown';

export interface SaudiCompetitorListing {
  id: string;
  brand: string;
  brandAr: string;
  model: string;
  category: 'floors' | 'glass' | 'pool' | 'garden';
  channel: Channel | string;
  channelAr: string;
  sellerName?: string;
  priceSar: number;
  listPriceSar?: number | null;
  vatIncluded: boolean | 'unknown';
  fulfillment: 'local' | 'international' | 'unknown';
  warrantyType: WarrantyType;
  warrantyMonths?: number | null;
  presenceBadge: PresenceBadge;
  inStock: boolean;
  capturedAt: string;
  sourceUrl: string;
  note?: string;
}

export interface CompetitorProfile {
  id: string;
  name: string;
  nameAr: string;
  presence: string;
  presenceAr: string;
  channels: string[];
  warranty: string;
  priceBand: string;
  score: number;
  products: string[];
  prices: { model: string; priceSar: number; channel: string; note: string }[];
  strengths: string[];
  weaknesses: string[];
  verdict: string;
  threat: string;
}
