const InventoryType = {
  GET: "INVENTORY_GET_LIST",
  GET_BY_VARIANTS: "INVENTORY_GET_BY_VARIANTS",
  GET_DETAIL: "INVENTORY_GET_LIST_DETAIL",
  GET_HISTORY: "INVENTORY_GET_LIST_HISTORY",
  GET_DETAIL_lIST_VARIANT: "GET_DETAIL_lIST_VARIANT",
  GET_DETAIL_lIST_VARIANT_EXT: "GET_DETAIL_lIST_VARIANT_EXT",
  GET_DETAIL_lIST_VARIANT_TRANSFER: "GET_DETAIL_lIST_VARIANT_TRANSFER",
  GET_STORE: "INVENTORY_GET_SENDER_STORE",
  GET_VARIANT_BY_STORE: 'INVENTORY_GET_VARIANT_BY_STORE',
  UPLOAD_FILES: 'INVENTORY_UPLOAD_FILES',
  CREATE_INVENTORY_TRANSFER: 'CREATE_INVENTORY_TRANSFER',
  CREATE_INVENTORY_TRANSFER_SHIPMENT: 'CREATE_INVENTORY_TRANSFER_SHIPMENT',
  UPDATE_INVENTORY_TRANSFER: 'UPDATE_INVENTORY_TRANSFER',
  RECEIVED_INVENTORY__TRANSFER: 'RECEIVED_INVENTORY__TRANSFER',
  GET_LIST_INVENTORY_TRANSFER: 'GET_LIST_INVENTORY_TRANSFER',
  GET_LIST_LOG_INVENTORY_TRANSFER: 'GET_LIST_LOG_INVENTORY_TRANSFER',
  GET_DETAIL_INVENTORY_TRANSFER: 'GET_DETAIL_INVENTORY_TRANSFER',
  GET_COPY_DETAIL_INVENTORY_TRANSFER: 'GET_COPY_DETAIL_INVENTORY_TRANSFER',
  DELETE_INVENTORY_TRANSFER: 'DELETE_INVENTORY_TRANSFER',
  GET_LOGISTIC_SERVICE: 'GET_LOGISTIC_SERVICE',
  GET_INFO_FEES_INVENTORY: 'GET_INFO_FEES_INVENTORY',
  CANCEL_SHIPMENT_INVENTORY: 'CANCEL_SHIPMENT_INVENTORY',
  EXPORT_INVENTORY: 'EXPORT_INVENTORY',
  //kiểm kho
  ADJUSTMENT_INVENTORY: 'ADJUSTMENT_INVENTORY',
  GET_LIST_INVENTORY_ADJUSTMENT: 'GET_LIST_INVENTORY_ADJUSTMENT',
  CREATE_INVENTORY_ADJUSTMENT: 'CREATE_INVENTORY_ADJUSTMENT',
  GET_DETAIL_INVENTORY_ADJUSTMENT: 'GET_DETAIL_INVENTORY_ADJUSTMENT',
  UPDATE_ONLINE_INVENTORY: 'UPDATE_ONLINE_INVENTORY',
  UPDATE_ITEM_ONLINE_INVENTORY: 'UPDATE_ITEM_ONLINE_INVENTORY',
  UPDATE_ADJUSTMENT_INVENTORY: 'UPDATE_ADJUSTMENT_INVENTORY',
  PRINT_ADJUSTMENT_INVENTORY: 'PRINT_ADJUSTMENT_INVENTORY',
  GET_LINES_ITEM_ADJUSTMENT: 'GET_LINES_ITEM_ADJUSTMENT',
  UPDATE_ADJUSTMENT: 'UPDATE_ADJUSTMENT',
}

const InventoryConfigType ={
  CREATE_INVENTORY_CONFIG: "CREATE_INVENTORY_CONFIG",
  UPDATE_INVENTORY_CONFIG: "UPDATE_INVENTORY_CONFIG",
  GET_INVENTORY_CONFIG: "GET_INVENTORY_CONFIG"
}

export {InventoryType, InventoryConfigType};