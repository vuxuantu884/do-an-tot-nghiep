const inventory_transfer = "inventory_transfer";
const shipment_inventory_transfer = "inventory_transfer_shipment";

export const InventoryTransferPermission = {
  create: `${inventory_transfer}_create`, //Tạo phiếu chuyển kho
  update:`${inventory_transfer}_update`, //Sửa phiếu chuyển kho
  cancel:`${inventory_transfer}_cancel`, //Hủy phiếu chuyển kho
  read:`${inventory_transfer}_read`, //Xem phiếu chuyển kho
  balance:`${inventory_transfer}_balance`,//Cân bằng nhanh
  clone  : `${inventory_transfer}_clone`, //Tạo bản sao phiếu chuyển
  print : `${inventory_transfer}_print`, // In vận đơn/phiếu
  receive : `${inventory_transfer}_receive`, //Nhận hàng online
  import : `${inventory_transfer}_import`, //Tạo phiếu chuyển từ excel
};

export const ShipmentInventoryTransferPermission = {
  create: `${shipment_inventory_transfer}_create`, //Chuyển hàng
  delete:`${shipment_inventory_transfer}_delete`, //Huỷ giao hàng
  export:`${shipment_inventory_transfer}_export`, //Xuất kho
};
