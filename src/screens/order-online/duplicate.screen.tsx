import { Button, Card, Row, Space } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MenuAction } from "component/table/ActionButton";
import { PrinterOutlined } from "@ant-design/icons";
import OrderDuplicateFilter from "component/filter/order-duplicate.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { CustomerDuplicateModel } from "model/duplicate/duplicate.model";
import { PageResponse } from "model/base/base-metadata.response";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { Link } from "react-router-dom";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { useDispatch } from "react-redux";

const ACTION_ID = {
  printShipment: 4,
  printStockExport: 5,
};

const actions: Array<MenuAction> = [
  {
    id: ACTION_ID.printShipment,
    name: "In phiếu giao hàng",
    icon: <PrinterOutlined />,
  }
];

const CustomerDuplicate: React.FC = () => {

  const dispatch = useDispatch();
  const [tableLoading, setTableLoading] = useState(false);
  const [listStore, setStore] = useState<Array<StoreResponse>>();

  const dataTest: CustomerDuplicateModel[] = [
    {
      key: 0,
      id: 1,
      code: "code1",
      name: "name 1",
      phone: "0965143609",
      address: "address1",
      store_id: 1,
      store_name: "store_name1",
      order_quanlity: 2
    },
    {
      key: 1,
      id: 2,
      code: "code1",
      name: "name 1",
      phone: "0965143609",
      address: "address1",
      store_id: 1,
      store_name: "store_name1",
      order_quanlity: 2
    },
    {
      key: 2,
      id: 3,
      code: "code1",
      name: "name 1",
      phone: "0965143609",
      address: "address1",
      store_id: 1,
      store_name: "store_name1",
      order_quanlity: 2
    }
  ];

  const [data, setData] = useState<PageResponse<CustomerDuplicateModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 3,
    },
    items: dataTest,
  });

  const [columns, setColumn] = useState<Array<ICustomTableColumType<CustomerDuplicateModel>>>([
    {
      title: "Khách hàng",
      dataIndex: "name",
      render: (value: string, i: CustomerDuplicateModel) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.CUSTOMER}/${i.id}`}>
              {value}
            </Link>
          </React.Fragment>
        )
      },
      visible: true,
      // fixed: "left",
      // className: "custom-shadow-td",
      width: 200,
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      render: (value: string, i: CustomerDuplicateModel) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.CUSTOMER}/${i.id}`}>
              {value}
            </Link>
          </React.Fragment>
        )
      },
      visible: true,
      width: 200,
      align: "center"
    },

    {
      title: (
        <div style={{ display: "-webkit-flex" }}>
          <span style={{ width: "100%", textAlign: "center" }}>Địa chỉ</span>
        </div>
      ),
      dataIndex: "address",
      render: (value: string, i: CustomerDuplicateModel) => {
        return (
          <React.Fragment>{value}</React.Fragment>
        )
      },
      visible: true,
    },
    {
      title: "Cửa hàng",
      dataIndex: "store_name",
      render: (value: string, i: CustomerDuplicateModel) => {
        return (
          <React.Fragment>{value}</React.Fragment>
        )
      },
      visible: true,
      width: 200,
      align: "center"
    },
    {
      title: "Tổng số đơn",
      dataIndex: "order_quanlity",
      render: (value: string, i: CustomerDuplicateModel) => {
        return (
          <React.Fragment>{value}</React.Fragment>
        )
      },
      visible: true,
      width: 120,
      align: "center"
    },
  ])

  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onPageChange = useCallback(
    (page, size) => {
    },
    []
  );

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        break;
      case 2:
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);
  return (
    <ContentContainer
      title="Đơn trùng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Đơn trùng",
        },
      ]}
      extra={
        <Row>
          <Space>
            <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.IMPORT]} passThrough>
              {(isPassed: boolean) => (
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
                  onClick={() => { }}
                  disabled={!isPassed}
                >
                  Nhập file
                </Button>
              )}
            </AuthWrapper>
            <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.EXPORT]} passThrough>
              {(isPassed: boolean) => (
                <Button
                  type="default"
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  // onClick={onExport}
                  onClick={() => {
                    console.log("export");
                  }}
                  disabled={!isPassed}
                >
                  Xuất file
                </Button>
              )}
            </AuthWrapper>

            <AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE]} passThrough>
              {(isPassed: boolean) => (
                <ButtonCreate path={`${UrlConfig.ORDER}/create`} disabled={!isPassed} />
              )}
            </AuthWrapper>
          </Space>
        </Row>
      }
    >
      <Card>
        <OrderDuplicateFilter
          actions={actions}
          onMenuClick={onMenuClick}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          listStore={listStore} />

        <CustomTable
          isRowSelection
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

          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: CustomerDuplicateModel) => item.id}
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
            setColumn(data);
          }}
          data={columns}
        />
      )}
    </ContentContainer>
  );
};
export default CustomerDuplicate;
