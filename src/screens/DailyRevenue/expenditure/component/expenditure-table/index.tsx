import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { ExpenditureSearchQuery, ExpenditureTableModel } from "model/revenue/expenditure.model";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { StyledComponent } from "./style";

type Props = {
  params: ExpenditureSearchQuery;
  data: PageResponse<ExpenditureTableModel>;
  setData: (v: PageResponse<ExpenditureTableModel>) => void;
  setParams: (v: ExpenditureSearchQuery) => void;
};

const ExpenditureTable: React.FC<Props> = (props: Props) => {
  const { params, data, setData, setParams } = props;
  const history = useHistory();
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [columns, setColumns] = useState<Array<ICustomTableColumType<ExpenditureTableModel>>>([]);

  const initColumns: Array<ICustomTableColumType<ExpenditureTableModel>> = useMemo(
    () => [
      {
        title: "ID phiếu",
        dataIndex: "id",
        key: "id",
        width: "100px",
        visible: true,
        align: "center",
        render: (value, i: any) => <React.Fragment>{value}</React.Fragment>,
      },
      {
        title: "Phụ thu",
        // dataIndex: "key",
        // key: "key",
        width: "100px",
        visible: true,
        align: "center",
        render: (value, i: any) => <React.Fragment>-</React.Fragment>,
      },
      {
        title: "Chi phí",
        // dataIndex: "key",
        // key: "key",
        width: "100px",
        visible: true,
        align: "center",
        render: (value, i: any) => <React.Fragment>-</React.Fragment>,
      },
      {
        title: "Cửa hàng",
        // dataIndex: "key",
        // key: "key",
        width: "100px",
        visible: true,
        align: "center",
        render: (value, i: any) => <React.Fragment>-</React.Fragment>,
      },
      {
        title: "Người tạo",
        // dataIndex: "key",
        // key: "key",
        width: "100px",
        visible: true,
        align: "center",
        render: (value, i: any) => <React.Fragment>-</React.Fragment>,
      },
      {
        title: "Phiếu tổng kết ca",
        // dataIndex: "key",
        // key: "key",
        width: "100px",
        visible: true,
        align: "center",
        render: (value, i: any) => <React.Fragment>-</React.Fragment>,
      },
    ],
    [],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const rowSelectionRenderCell = (
    checked: boolean,
    record: any,
    index: number,
    originNode: ReactNode,
  ) => {
    return (
      <React.Fragment>
        <div className="actionButton">{originNode}</div>
      </React.Fragment>
    );
  };

  const onSelectedChange = useCallback(
    (_: any[], selected?: boolean, changeRow?: any[]) => {
      let selectedRowKeysCopy: number[] = [...selectedRowKeys];
      if (selected === true) {
        changeRow?.forEach((row, index) => {
          let indexItem = selectedRowKeys.findIndex((p) => p === row.id);
          if (indexItem === -1) {
            selectedRowKeysCopy.push(row.id);
          }
        });
      } else {
        selectedRowKeys.forEach((row, index) => {
          let indexItemKey = changeRow?.findIndex((p) => p.id === row);
          if (indexItemKey !== -1) {
            let i = selectedRowKeysCopy.findIndex((p) => p === row);
            selectedRowKeysCopy.splice(i, 1);
          }
        });
      }
      setSelectedRowKeys(selectedRowKeysCopy);
    },
    [selectedRowKeys],
  );

  const onPageChange = useCallback(
    (page, size) => {
      const paramsCopy: ExpenditureSearchQuery = { ...params };
      paramsCopy.page = Number(page);
      paramsCopy.limit = Number(size);

      let queryParam = generateQuery(paramsCopy);
      setParams(paramsCopy);
      history.push(`${UrlConfig.DAILY_REVENUE}?${queryParam}`);
    },
    [history, params, setParams],
  );

  useEffect(() => {
    setColumns(initColumns);
  }, [columns, initColumns, setColumns]);

  return (
    <React.Fragment>
      <StyledComponent>
        <CustomTable
          scroll={{
            x: (2200 * columnFinal.length) / (columnFinal.length ? columnFinal.length : 1),
          }}
          sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
          isLoading={tableLoading}
          showColumnSetting={true}
          dataSource={data.items}
          columns={columnFinal}
          isShowPaginationAtHeader
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows: any[], selected?: boolean, changeRow?: any[]) =>
            onSelectedChange(selectedRows, selected, changeRow)
          }
          rowSelectionRenderCell={rowSelectionRenderCell}
          selectedRowKey={selectedRowKeys}
          isRowSelection
          rowKey={(item: ExpenditureTableModel) => item.id}
        />
      </StyledComponent>
    </React.Fragment>
  );
};

export default ExpenditureTable;
