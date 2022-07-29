import { Card, Row, Space } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
// import exportIcon from "assets/icon/export.svg";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import OrderDuplicateFilter from "component/filter/order-duplicate.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { PageResponse } from "model/base/base-metadata.response";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { Link, useHistory } from "react-router-dom";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { useDispatch } from "react-redux";
import { getQueryParams, useQuery } from "utils/useQuery";
import { DuplicateOrderSearchQuery } from "model/order/order.model";
import { generateQuery } from "utils/AppUtils";
import { getOrderDuplicateAction } from "domain/actions/order/order-duplicate.action";
import { CustomerDuplicateModel } from "model/order/duplicate.model";
import "./order-duplicate.scss";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";

const initQuery: DuplicateOrderSearchQuery = {
  page: 1,
  limit: 30,
  issued_on_min: "",
  issued_on_max: "",
  search_term: "",
  store_id: undefined,
};

const defaultData: PageResponse<CustomerDuplicateModel> = {
  metadata: {
    limit: 30,
    page: 1,
    total: 0,
  },
  items: [],
};

const CustomerDuplicate: React.FC = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  const history = useHistory();

  let dataQuery: DuplicateOrderSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };

  let [params, setPrams] = useState<DuplicateOrderSearchQuery>(dataQuery);

  const [tableLoading, setTableLoading] = useState(false);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);

  const [selectedRowCodes, setSelectedRowCodes] = useState<Array<number>>([]);
  const [data, setData] = useState<PageResponse<CustomerDuplicateModel>>(defaultData);

  const [columns, setColumns] = useState<Array<ICustomTableColumType<CustomerDuplicateModel>>>([
    {
      title: (
        <div style={{ display: "-webkit-flex" }}>
          <span style={{ width: "100%", textAlign: "center" }}>Khách hàng</span>
        </div>
      ),
      dataIndex: "customer",
      render: (value: string, i: CustomerDuplicateModel) => {
        let queryParamDetail = generateQuery({
          // store_ids:i.store_id,
          issued_on_min: params.issued_on_min,
          issued_on_max: params.issued_on_max,
          full_address: i.full_address,
          ward: i.ward,
          district: i.district,
          city: i.city,
          country: i.country,
        });
        return (
          <React.Fragment>
            <Link
              to={`${UrlConfig.ORDERS_DUPLICATE}/order/${i.customer_phone_number}/${i.store_id}?${queryParamDetail}`}
            >
              {value}
            </Link>
          </React.Fragment>
        );
      },
      visible: true,

      // fixed: "left",
      // className: "custom-shadow-td",
      width: 200,
      align: "center",
    },

    {
      title: "Số điện thoại",
      dataIndex: "customer_phone_number",
      render: (value: string, i: CustomerDuplicateModel) => {
        let queryParamDetail = generateQuery({
          //store_ids:i.store_id,
          issued_on_min: params.issued_on_min,
          issued_on_max: params.issued_on_max,
          full_address: i.full_address,
          ward: i.ward,
          district: i.district,
          city: i.city,
          country: i.country,
        });
        return (
          <React.Fragment>
            <Link
              to={`${UrlConfig.ORDERS_DUPLICATE}/order/${i.customer_phone_number}/${i.store_id}?${queryParamDetail}`}
            >
              {value}
            </Link>
          </React.Fragment>
        );
      },
      visible: true,
      width: 200,
    },

    {
      title: (
        <div style={{ display: "-webkit-flex" }}>
          <span style={{ width: "100%", textAlign: "center" }}>Địa chỉ</span>
        </div>
      ),
      dataIndex: "customer_full_address",
      render: (value: string, i: CustomerDuplicateModel) => {
        return <React.Fragment>{value}</React.Fragment>;
      },
      visible: true,
    },
    {
      title: "Cửa hàng",
      dataIndex: "store",
      render: (value: string, i: CustomerDuplicateModel) => {
        return <React.Fragment>{value}</React.Fragment>;
      },
      visible: true,
      width: 200,
      align: "center",
    },
    {
      title: "Tổng số đơn",
      dataIndex: "count_order",
      render: (value: string, i: CustomerDuplicateModel) => {
        return <React.Fragment>{value}</React.Fragment>;
      },
      visible: true,
      width: 120,
      align: "center",
    },
  ]);

  const [showSettingColumn, setShowSettingColumn] = useState(false);

  // cột column
  const columnConfigType = COLUMN_CONFIG_TYPE.orderDuplicatedOnline;
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(columnConfigType);
  //cột của bảng
  useSetTableColumns(columnConfigType, tableColumnConfigs, columns, setColumns);

  const onSelectedChange = useCallback(
    (
      selectedRows: CustomerDuplicateModel[],
      selected?: boolean,
      changeRow?: CustomerDuplicateModel[],
    ) => {
      let selectedRowCodesCopy = [...selectedRowCodes];
      // console.log("changeRow",changeRow)

      if (changeRow && changeRow.length > 0) {
        if (selected) {
          changeRow?.forEach((row) => {
            let index = selectedRowCodesCopy.findIndex((p) => p === row.key);
            if (index === -1) {
              selectedRowCodesCopy.push(row.key);
            }
          });
          setSelectedRowCodes(selectedRowCodesCopy);
        } else {
          changeRow?.forEach((row) => {
            let index = selectedRowCodesCopy.findIndex((p) => p === row.key);
            if (index !== -1) {
              selectedRowCodesCopy.splice(index, 1);
            }
          });
          setSelectedRowCodes(selectedRowCodesCopy);
        }
      }
    },
    [selectedRowCodes],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      setSelectedRowCodes([]);
      history.replace(`${UrlConfig.ORDERS_DUPLICATE}?${queryParam}`);
    },
    [history, params],
  );

  const onFilter = useCallback(
    (value: DuplicateOrderSearchQuery) => {
      let newPrams = { ...params, ...value, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ORDERS_DUPLICATE}?${queryParam}`);
    },
    [history, params],
  );

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);

  useEffect(() => {
    setTableLoading(true);
    dispatch(
      getOrderDuplicateAction(params, (data: PageResponse<CustomerDuplicateModel>) => {
        let result: PageResponse<CustomerDuplicateModel> = { ...defaultData };
        let resultItem = data.items.map((p, index) => {
          return { ...p, key: index };
        });

        result.metadata = {
          limit: data.metadata.limit,
          page: data.metadata.page,
          total: data.metadata.total,
        };
        result.items = [...resultItem];

        setData(result);
        setTableLoading(false);
      }),
    );
  }, [dispatch, params]);

  return (
    <ContentContainer
      title="Đơn trùng"
      breadcrumb={[
        {
          name: "Đơn hàng online",
          path: UrlConfig.ORDER,
        },
        {
          name: "Đơn trùng",
        },
      ]}
      extra={
        <Row>
          <Space>
            {/* <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
              {(isPassed: boolean) => (
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  // onClick={onExport}
                  onClick={() => {
                  }}
                  disabled={!isPassed}
                >
                  Xuất file
                </Button>
              )}
            </AuthWrapper> */}

            <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
              {(isPassed: boolean) => (
                <ButtonCreate
                  path={`${UrlConfig.ORDER}/create`}
                  child="Thêm mới đơn hàng"
                  disabled={!isPassed}
                />
              )}
            </AuthWrapper>
          </Space>
        </Row>
      }
    >
      <Card className="duplicate-card">
        <OrderDuplicateFilter
          onShowColumnSetting={() => setShowSettingColumn(true)}
          listStore={listStore}
          onFilter={onFilter}
          initialValues={params}
        />

        <CustomTable
          isRowSelection
          isShowPaginationAtHeader
          isLoading={tableLoading}
          showColumnSetting={true}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows, selected, changeRow) =>
            onSelectedChange(selectedRows, selected, changeRow)
          }
          selectedRowKey={selectedRowCodes}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: CustomerDuplicateModel) => item.key}
          className="order-list"
        />
      </Card>

      {showSettingColumn && (
        <ModalSettingColumn
          visible={showSettingColumn}
          isSetDefaultColumn={true}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            onSaveConfigTableColumn(data);
          }}
          data={columns}
        />
      )}
    </ContentContainer>
  );
};
export default CustomerDuplicate;
