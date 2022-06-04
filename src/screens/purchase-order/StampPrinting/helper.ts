import { FormInstance } from "antd";
import UrlConfig from "config/url.config";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { ProductStampPrinting, PurchaseOrder } from "model/purchase-order/purchase-order.model";
export enum FormFiledStampPrinting {
    variants = "variants",
    type_name = "type_name",
    order_code = "order_code",
    supplier_id = "supplier_id",
    supplier = "supplier",
    note = "note",
    order_id = "order_id",
}
export const initFormValueStampPrinting = {
    type_name: "excel",
    variants: []
}
export const defaultBreadcrumbStampPrinting = [{
    name: 'Kho hàng',
},
{
    name: 'Đặt hàng',
    path: `${UrlConfig.PURCHASE_ORDERS}`,
}]
export const handleSelectProduct = (item: PurchaseOrderLineItem, index: number, selectedIds: number[], setSelectedIds: (data: number[]) => void) => {
    if (item.variant_id) {
        if (selectedIds.includes(item.variant_id)) {
            setSelectedIds(selectedIds.filter(id => id !== item.variant_id))
        } else {
            setSelectedIds([...selectedIds, item.variant_id]);
        }
    }

}

export const handleChangeQtyPrintByVariantId = (variantId: number, quantity: number, form: FormInstance) => {
    if (typeof quantity === "number") {
        const selectedProduct: ProductStampPrinting[] = form.getFieldValue(FormFiledStampPrinting.variants) || [];
        const newProduct = selectedProduct.map(item => {
            return {
                ...item,
                quantity_req: item.variant_id === variantId ? quantity : item.quantity_req,
            }
        })
        form.setFieldsValue({ [FormFiledStampPrinting.variants]: [...newProduct] });
    }
}

export const handleSupplementalStamp = (rate: number, form: FormInstance, poData: PurchaseOrder) => {
    const lineItems = poData?.line_items || [];
    const selectedProduct: ProductStampPrinting[] = form.getFieldValue(FormFiledStampPrinting.variants) || [];
    const newProduct = selectedProduct.map(item => {
        const lineItem = lineItems.find(lineItem => lineItem.variant_id === item.variant_id);
        const lineItemQty = lineItem ? lineItem.quantity : 0;
        return {
            ...item,
            quantity_req: lineItemQty + Math.round(lineItemQty * rate / 100),
        }
    })
    form.setFieldsValue({ [FormFiledStampPrinting.variants]: [...newProduct] });
}