import { Modal, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useEffect, useState } from "react";
import { callApiNative } from "utils/ApiUtils";
import { getInventoryReportApi } from "service/inventory/adjustment/index.service";
import { useDispatch } from "react-redux";
import { formatCurrency } from "utils/AppUtils";

export interface ModalInventoryReportProps {
  visible?: boolean;
  onCancel?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  bgIcon?: string;
  inventoryId: number | null;
  loading?: boolean,
}

export interface DataInventoryReport {
  excess: number,
  label: string;
  missing: number;
  ratio: number;
  on_hand: number;
}

const InventoryReportModal: React.FC<ModalInventoryReportProps> = (
  props: ModalInventoryReportProps,
) => {
  const { visible, onCancel, inventoryId } = props;
  const [data, setData] = useState<DataInventoryReport[]>([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const convertLabel = (label: string) => {
    switch (label) {
      case "quantity":
        return "Số lượng";
      case "retail_price":
        return "Giá bán";
      case "import_price":
        return "Giá nhập";
      case "cost_price":
        return "Giá vốn";
      default:
        return "";
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "",
      dataIndex: "label",
      render: (value) => {
        return (
          <div>
            {convertLabel(value)}
          </div>
        );
      },
    },
    {
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      render: (value) => {
        return (
          <div>
            {formatCurrency(value)}
          </div>
        );
      },
    },
    {
      title: "Số kiểm",
      dataIndex: "real_on_hand",
      render: (value) => {
        return (
          <div>
            {formatCurrency(value)}
          </div>
        );
      },
    },
    {
      title: "Thừa/Thiếu",
      dataIndex: "missing",
      render: (value, record) => {
        return (
          <div>
            <span className="text-success">
              {formatCurrency(record.excess)}
            </span>/
            <span className="text-error">{formatCurrency(record.missing)}</span>
          </div>
        );
      },
    },
    {
      title: "Tỉ lệ thừa thiếu",
      dataIndex: "excess",
      render: (value, record) => {
        return (
          <div>{record.ratio ? `${record.ratio}%` : ''}</div>
        )
      }
    },
  ];

  const fetchInventoryReport = async () => {
    setLoading(true);
    const res = await callApiNative(
      { isShowError: false },
      dispatch,
      getInventoryReportApi,
      inventoryId,
    );

    setLoading(false);

    if (res?.length > 0) {
      setData(res);
    }
  };

  useEffect(() => {
    fetchInventoryReport().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      width={742}
      className="modal-report"
      footer={[]}
      title="Báo cáo kiểm"
      visible={visible}
      onCancel={onCancel}
    >
      <div className="modal-report-container">
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </div>
    </Modal>
  );
};

export default InventoryReportModal;
