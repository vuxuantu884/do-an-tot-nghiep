import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { productGetHistoryAction } from "domain/actions/product/products.action";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { PageResponse } from "model/base/base-metadata.response";
import { ProductHistoryQuery, ProductHistoryResponse } from "model/product/product.model";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, getEndOfDay, getStartOfDay } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { HistoryProductFilter } from "../../filter";
import { StyledComponent } from "../style";
import { EyeOutlined } from "@ant-design/icons";
import { Col, Modal, Row } from "antd";
import { PRODUCT_ACTION_TYPES } from "screens/products/helper";
const initQuery: ProductHistoryQuery = {};

const TabHistoryInfo: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalLog, setOpenModalLog] = useState(false);
  const [dataLogSelected, setDataLogSelected] = useState<ProductHistoryResponse | null>(null);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [data, setData] = useState<PageResponse<ProductHistoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onResult = useCallback((result: PageResponse<ProductHistoryResponse> | false) => {
    setIsLoading(false);
    if (result) {
      setData(result);
    }
  }, []);

  const dataQuery: ProductHistoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };

  const [params, setParams] = useState<ProductHistoryQuery>(dataQuery);

  const changePage = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      const queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${ProductTabUrl.PRODUCT_HISTORIES}?${queryParam}`);
    },
    [history, params],
  );

  const openModalLog = (data: ProductHistoryResponse) => {
    setOpenModalLog(true);
    const newOldData: any = {};
    const newCurrentData: any = {};

    if (data?.data_old) {
      for (let property in JSON.parse(data?.data_old)) {
        const dataOldProperty = JSON.stringify(JSON.parse(data.data_old)[property]);
        const dataCurrentProperty = JSON.stringify(JSON.parse(data.data_current)[property]);
        if (dataOldProperty !== dataCurrentProperty) {
          newOldData[property] = JSON.parse(data.data_old)[property];
          newCurrentData[property] = JSON.parse(data.data_current)[property];
        }
      }
    }

    const newData = {
      ...data,
      data_old: JSON.stringify(newOldData),
      data_current: JSON.stringify(newCurrentData),
    };

    setDataLogSelected(newData);
  };

  const defaultColumns: Array<ICustomTableColumType<ProductHistoryResponse>> = useMemo(() => {
    return [
      {
        title: "Sản phẩm",
        dataIndex: "sku",
        key: "sku",
        visible: true,
        fixed: "left",
        render: (sku, item) => {
          if (PRODUCT_ACTION_TYPES.includes(item.history_type)) {
            return (
              <div>
                <Link to={`${UrlConfig.PRODUCT}/${item.product_id}`}>{item.product_code}</Link>
                <div>{<TextEllipsis value={item.product_name} line={1} />}</div>
              </div>
            );
          }
          return (
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                {item.sku}
              </Link>
              <div>{<TextEllipsis value={item.variant_name} line={1} />}</div>
            </div>
          );
        },
      },
      {
        title: "Người sửa",
        width: 200,
        dataIndex: "action_by",
        key: "action_by",
        visible: true,
        align: "left",
        render: (value, record) => {
          return (
            <div>
              {value !== null ? (
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record?.action_by}`}>
                  {record.action_name}
                </Link>
              ) : (
                "---"
              )}
            </div>
          );
        },
      },
      {
        title: "Log ID",
        dataIndex: "code",
        key: "code",
        visible: true,
        align: "center",
      },
      {
        title: "Thao tác",
        dataIndex: "history_type_name",
        key: "history_type_name",
        visible: true,
        align: "left",
      },
      {
        title: "Chi tiết",
        dataIndex: "history_type",
        key: "history_type",
        visible: true,
        align: "center",
        width: 100,
        render: (value, record) => {
          return (
            <div style={{ textAlign: "center" }}>
              {(value === "UPDATE_VARIANT" || value === "UPDATE_PRODUCT") && (
                <div>
                  <EyeOutlined onClick={() => openModalLog(record)} />
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: "Thời gian",
        visible: true,
        align: "left",
        dataIndex: "action_date",
        key: "action_date",
        render: (value) => (value !== null ? ConvertUtcToLocalDate(value) : "---"),
        width: 160,
      },
    ];
  }, []);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<ProductHistoryResponse>>>(defaultColumns);

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT_HISTORY,
  );

  useSetTableColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT_HISTORY,
    tableColumnConfigs,
    defaultColumns,
    setColumns,
  );

  const columnsFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(productGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params]);

  return (
    <StyledComponent>
      <HistoryProductFilter
        onFinish={(values: any) => {
          const { from_action_date, to_action_date, condition } = values;
          if (from_action_date) {
            values.from_action_date = getStartOfDay(from_action_date);
          }
          if (to_action_date) {
            values.to_action_date = getEndOfDay(to_action_date);
          }
          values.condition = condition && condition.trim();
          const newParams = { ...params, ...values, page: 1 };
          setParams(newParams);
          const queryParam = generateQuery(newParams);
          history.replace(`${ProductTabUrl.PRODUCT_HISTORIES}?${queryParam}`);
        }}
        onShowColumnSetting={() => setIsShowSettingColumn(true)}
        onMenuClick={() => {}}
        actions={[]}
      />
      <CustomTable
        className="small-padding"
        bordered
        rowKey={(record) => record.id}
        isRowSelection
        columns={columnsFinal}
        dataSource={data.items}
        isLoading={isLoading}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        isShowPaginationAtHeader
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: changePage,
          onShowSizeChange: changePage,
        }}
      />
      <ModalSettingColumn
        visible={isShowSettingColumn}
        onCancel={() => setIsShowSettingColumn(false)}
        onOk={(data) => {
          setIsShowSettingColumn(false);
          setColumns(data);
          onSaveConfigTableColumn(data);
        }}
        data={columns}
        onResetToDefault={() => {
          setIsShowSettingColumn(false);
          setColumns(defaultColumns);
          onSaveConfigTableColumn(defaultColumns);
        }}
        isSetDefaultColumn
      />

      {isOpenModalLog && (
        <Modal
          width={1000}
          visible={isOpenModalLog}
          onCancel={() => setOpenModalLog(false)}
          footer={null}
          title={<div className="font-weight-500">Chi tiết logs</div>}
        >
          <Row gutter={24}>
            <Col span={12} style={{ borderRight: "1px solid #d9d9d9" }}>
              <div style={{ textAlign: "center" }} className="font-weight-500 mb-20">
                Trước
              </div>
              <pre>
                {dataLogSelected &&
                  dataLogSelected.data_old &&
                  JSON.stringify(JSON.parse(dataLogSelected.data_old), null, 2)}
              </pre>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: "center" }} className="font-weight-500 mb-20">
                Sau
              </div>
              <pre>
                {dataLogSelected &&
                  dataLogSelected.data_current &&
                  JSON.stringify(JSON.parse(dataLogSelected.data_current), null, 2)}
              </pre>
            </Col>
          </Row>
        </Modal>
      )}
    </StyledComponent>
  );
};

export default TabHistoryInfo;
