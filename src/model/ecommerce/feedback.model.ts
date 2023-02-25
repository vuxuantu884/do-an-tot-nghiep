export interface FeedbackQuery {
  is_replied?: string;
  product_ids: string[];
  shop_ids: string[];
  stars: number[];
  created_date_from?: string | null;
  created_date_to?: string | null;
  page: number;
  limit: number;
}
