import {
  Table,
  Modal,
} from "antd";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcurementViewDraft } from "model/purchase-order/purchase-procument";
import {
  POInventoryDraftTable,
} from "screens/purchase-order/component/po-inventory/POInventoryDraft/styles";

type ProcurementModalProps = {
  visible?: boolean;
  onCancel?: () => void;
  onOk: (value: Array<PurchaseProcurementViewDraft>) => void;
  dataSource?: Array<PurchaseOrderLineItem>;
};

const POEditDraftProcurementModal: React.FC<ProcurementModalProps> = (
  props: ProcurementModalProps
) => {
  const {
    visible,
    onCancel,
    onOk,
  } = props;


  return (
    <Modal
      width={"60%"}
      centered
      title={"Sửa kế hoạch nhập kho"}
      visible={visible}
      onCancel={() => {
        onCancel && onCancel();
      }}
      cancelText={`Hủy`}
      okText={`Lưu`}
    >
      <POInventoryDraftTable>
        <Table
          pagination={false}
          scroll={{ y: 300, x: 1000 }}
        />
      </POInventoryDraftTable>
    </Modal>
  );
};

export default POEditDraftProcurementModal;
