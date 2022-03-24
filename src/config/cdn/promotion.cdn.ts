import { AppConfig } from "config/app.config";

const { CDN } = AppConfig;
export const PROMOTION_CDN = {
    PROMOTION_FIXED_PRICE_TEMPLATE_URL: `${CDN}/files/promotion-import-templates/v1/mau-chiet-khau-dong-gia.xlsx`,
    PROMOTION_QUANTITY_TEMPLATE_URL: `${CDN}/files/promotion-import-templates/v1/mau-chiet-khau-tren-tung-san-pham.xlsx`,
    DISCOUNT_CODES_TEMPLATE_URL: `https://yody-file.s3.ap-southeast-1.amazonaws.com/promotions/discount-codes-template.xlsx`,
}