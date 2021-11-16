// đăt tên resouces  có chữ [s] + action , viết thường, snake_case => products_read
// nếu có resource con :  resouces cha [s] + resource con [s] + action => products_categories_create
const PurchaseOrders = "purchase_orders";

export const PurchaseOrderPermission = {

    create: `${PurchaseOrders}_create`,
    update : `${PurchaseOrders}_update`,
    delete : `${PurchaseOrders}_delete`,
    read : `${PurchaseOrders}_read`,
    cancel : `${PurchaseOrders}_cancel`,
    print : `${PurchaseOrders}_print`,
    return : `${PurchaseOrders}_return`,
    approve : `${PurchaseOrders}_approve`,

    procurements_create : `${PurchaseOrders}_procurements_create`,
    procurements_delete : `${PurchaseOrders}_procurements_delete`,
    procurements_read : `${PurchaseOrders}_procurements_read`,  
    procurements_finish : `${PurchaseOrders}_procurements_finish`,
    procurements_approve : `${PurchaseOrders}_procurements_approve`,
    procurements_confirm : `${PurchaseOrders}_procurements_confirm`,

    payments_create : `${PurchaseOrders}_payments_create`,
    payments_update : `${PurchaseOrders}_payments_update`,
    payments_delete : `${PurchaseOrders}_payments_delete`,
    payments_finish : `${PurchaseOrders}_payments_finish`,
    payments_approve : `${PurchaseOrders}_payments_approve`,

    payments_condition_create : `${PurchaseOrders}_payments_condition_create`,
    payments_condition_update : `${PurchaseOrders}_payments_condition_update`,
    payments_condition_delete : `${PurchaseOrders}_payments_condition_delete`,
    payments_condition_read : `${PurchaseOrders}_payments_condition_read`,
};
