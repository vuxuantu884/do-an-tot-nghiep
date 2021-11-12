// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
const PurchaseOrders = "purchase_orders";

export const PurchaseOrderPermission = {
    po_create: `${PurchaseOrders}_po_create`,
    po_update : `${PurchaseOrders}_po_update`,
    po_delete : `${PurchaseOrders}_po_delete`,
    po_read : `${PurchaseOrders}_po_read`,
    po_cancel : `${PurchaseOrders}_po_cancel`,
    po_print : `${PurchaseOrders}_po_print`,
    po_return : `${PurchaseOrders}_po_return`,

    procurements_create : `${PurchaseOrders}_procurements_create`,
    procurements_update : `${PurchaseOrders}_procurements_update`,
    procurements_delete : `${PurchaseOrders}_procurements_delete`,
    procurements_read : `${PurchaseOrders}_procurements_read`,  
    procurements_finish : `${PurchaseOrders}_procurements_finish`,

    payments_create : `${PurchaseOrders}_payments_create`,
    payments_update : `${PurchaseOrders}_payments_update`,
    payments_delete : `${PurchaseOrders}_payments_delete`,
    payments_finish : `${PurchaseOrders}_payments_finish`,

    payments_condition_create : `${PurchaseOrders}_payments_condition_create`,
    payments_condition_update : `${PurchaseOrders}_payments_condition_update`,
    payments_condition_delete : `${PurchaseOrders}_payments_condition_delete`,
    payments_condition_read : `${PurchaseOrders}_payments_condition_read`,
};
