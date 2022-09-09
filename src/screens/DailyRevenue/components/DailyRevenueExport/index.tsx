import { Button, Modal, Radio, Space } from "antd";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { DailyRevenueTableModel, RevenueSearchQuery } from "model/revenue";
import moment from "moment";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getDailyRevenueService } from "service/daily-revenue";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./style";

type Props = {
  selectedItems?: number[];
  dataItem?: DailyRevenueTableModel[];
  visible: boolean;
  setVisible: (v: boolean) => void;
};

const EXPORT_TYPE = {
  EXPORT_SELECTED: 1,
  EXPORT_TOTAL: 2,
};

const DailyRevenueExport: React.FC<Props> = (props: Props) => {
  const { selectedItems, dataItem, visible, setVisible } = props;
  const dispatch = useDispatch();
  const [selectType, setSelectedType] = useState<number>();
  const EXPORT_LIST = useMemo(
    () => [
      {
        id: EXPORT_TYPE.EXPORT_SELECTED,
        name: `${selectedItems?.length} phiếu được chọn`,
        disable: selectedItems && selectedItems.length === 0 ? true : false,
      },
      {
        id: EXPORT_TYPE.EXPORT_TOTAL,
        name: `${dataItem?.length} phiếu phù hợp với tìm kiếm hiện tại`,
        disable: dataItem && dataItem.length === 0 ? true : false,
      },
    ],
    [dataItem, selectedItems],
  );

  const exportFile = useCallback(
    (dataQuery) => {
      dispatch(showLoading());
      getDailyRevenueService(dataQuery, {
        headers: {
          "Content-Type": "application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet",
        },
        responseType: "arraybuffer",
      })
        .then((response) => {
          if (response.status === 200) {
            console.log(response.data);
            const blob = new Blob([response.data], { type: "application/vnd.ms-excel" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const name = moment().format("YYYY-MM-DD HH:mm:ss");
            a.download = `phieu-tong-ket-ca.${name}.xls`;
            a.click();
            window.URL.revokeObjectURL(url);
            showSuccess("Xuất báo cáo thành công");
          }
        })
        .catch()
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch],
  );

  const onClickExport = useCallback(() => {
    switch (selectType) {
      case EXPORT_TYPE.EXPORT_SELECTED:
        const dataQuery: RevenueSearchQuery = {
          limit: 2000,
          page: 0,
          ids: selectedItems,
          format: "xls",
        };
        exportFile(dataQuery);
        break;
      case EXPORT_TYPE.EXPORT_TOTAL:
        const ids = dataItem?.map((p) => p.id);
        const dataQuerys: RevenueSearchQuery = {
          limit: 2000,
          page: 0,
          ids: ids,
          format: "xls",
        };
        exportFile(dataQuerys);
        break;
      default:
        break;
    }
  }, [selectType, dataItem, selectedItems, exportFile]);

  return (
    <StyledComponent>
      <Modal
        visible={visible}
        title="Xuất file danh sách phiếu"
        footer={
          <React.Fragment>
            <Space direction="horizontal">
              <Button onClick={() => setVisible && setVisible(false)}>Thoát</Button>
              <Button
                type="primary"
                onClick={onClickExport}
                disabled={!EXPORT_LIST.some((p) => p.disable === false) || !selectType}
              >
                Xuất file
              </Button>
            </Space>
          </React.Fragment>
        }
        onCancel={() => setVisible && setVisible(false)}
      >
        <Radio.Group value={selectType} onChange={(e) => setSelectedType(e.target.value)}>
          <Space direction="vertical">
            {EXPORT_LIST.map((p) => (
              <Radio value={p.id} disabled={p.disable}>
                {p.name}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    </StyledComponent>
  );
};

export default DailyRevenueExport;
