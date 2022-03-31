
export declare type DefectValue = any
export interface LineItemDefect {
    id: number;
    code: string;
    sku: string;
    variant_id: number,
    variant_name: string;
    image_url: string;
    on_hand: number,
    note: string | null,
    defect: number;
    store_id: number;
    store: string;
    [name: string]: DefectValue;
}

export interface InventorySearchItem {
    page: number;
    limit: number;
    condition?: string | null,
    store_id?: number | null,
}

export interface InventoryItemsDefectedDetail {
    id?: number; 
    code: string;
    sku: string;
    variant_id: number,
    variant_name?: string; 
    image_url?: string;
    on_hand?: number,
    note: string | null,
    defect: number;
    store_id: number;
    store: string;
}


export interface InventoryDefectResponse {
    id: number;
    code: string;
    version: number;
    created_by: string;
    created_name: string;
    created_date: Date;
    updated_by: string;
    updated_name: string;
    updated_date: Date;
    store_id: number
    store: string;
    variant_id: number;
    sku: string;
    defect: number;
    note: string;
    image_url? :string;
    on_hand: number;
    product_id? :number;
}

export const InventoryDefectFields = {
    code: "code",
    sku: "sku",
    variant_id: "variant_id",
    variant_name: "variant_name",
    image_url: "image_url",
    on_hand: "on_hand",
    note: "note",
    defect: "defect",
    store_id: "store_id",
    store: "store"
}
