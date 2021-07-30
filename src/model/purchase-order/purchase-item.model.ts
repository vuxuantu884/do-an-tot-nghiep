export interface PurchaseOrderLineItem{
    id?: number,
    sku:string,
    variant_id: number,
    product_id: number,
    product: string,
    variant: string,
    product_type: string,
    quantity: number,
    price: number,
    amount: number,
    note: string,
    type: string,
    variant_image: string|null,
    unit: string,
    tax: number,
    tax_rate: number,
    tax_included: boolean,
    tax_type_id: number|null,
    line_amount_after_line_discount: number,
    discount_rate: number|null,
    discount_value: number|null,
    discount_amount: number,
    position: number|null,
    purchase_order_id: number|null,
    temp_id: string
}

export interface Vat {
    value: number,
    amount: number,
}