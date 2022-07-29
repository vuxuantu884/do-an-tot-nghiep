import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Menu } from "antd";
import { ColumnType } from "antd/lib/table";
import iconDelete from "assets/icon/deleteIcon.svg";
import iconEdit from "assets/icon/edit.svg";
import iconIsActive from "assets/icon/iconIsActive.svg";
import threeDot from "assets/icon/three-dot.svg";
import ContentContainer from "component/container/content.container";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  actionDeleteConfigurationShippingServiceAndShippingFee,
  actionEditOrderConfig,
  actionGetOrderConfig,
  actionGetOrderConfigPrint,
  actionListConfigurationShippingServiceAndShippingFee,
} from "domain/actions/settings/order-settings.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderConfigRequestModel } from "model/request/settings/order-settings.resquest";
import {
  OrderConfigPrintResponseModel,
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
  ShippingServiceConfigResponseModel,
} from "model/response/settings/order-settings.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";
import CardGeneralSettings from "./components/CardGeneralSettings";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderSettings(props: PropType) {
  const dateFormat = "HH:mm DD/MM/YYYY";

  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isLoadedData, setIsLoadedData] = useState(false);

  const [listPrintConfig, setListPrintConfig] = useState<OrderConfigPrintResponseModel[] | null>(
    null,
  );

  const [listOrderConfigs, setListOrderConfigs] = useState<OrderConfigResponseModel | null>(null);

  const shipping_requirements = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement,
  );

  const [ShippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigResponseModel[]
  >([]);

  const dispatch = useDispatch();

  const handleDeleteShippingService = (id: number) => {
    dispatch(
      actionDeleteConfigurationShippingServiceAndShippingFee(id, () => {
        setIsTableLoading(true);
        dispatch(
          actionListConfigurationShippingServiceAndShippingFee((response) => {
            setShippingServiceConfig(response);
            setIsTableLoading(false);
          }),
        );
      }),
    );
  };

  const TABLE_COLUMN: ColumnType<any>[] = [
    {
      title: "STT",
      render: (value: any, row: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "program_name",
      key: "program_name",
    },
    {
      title: "Thời gian áp dụng",
      dataIndex: "date",
      key: "date",
      render: (value: any, row: ShippingServiceConfigResponseModel, index: number) => {
        const start_date_text = moment(row.start_date).format(dateFormat);
        const end_date_text = moment(row.end_date).format(dateFormat);
        return <span>{`${start_date_text} - ${end_date_text}`}</span>;
      },
    },
    {
      title: "Áp dụng",
      dataIndex: "status",
      key: "status",
      className: "columnActive",
      render: (value: any, row: ShippingServiceConfigDetailResponseModel, index: number) => {
        if (value === ORDER_SETTINGS_STATUS.active) {
          return (
            <div>
              <img src={iconIsActive} alt="" />
            </div>
          );
        }
      },
    },
    {
      title: "",
      width: "48px",
      render: (value: any, row: ShippingServiceConfigDetailResponseModel) => {
        const menu = (
          <Menu>
            <Menu.Item key="1">
              <Link to={`${UrlConfig.ORDER_SETTINGS}/shipping-services-and-shipping-fee/${row.id}`}>
                <Button
                  icon={<img alt="" style={{ marginRight: 12 }} src={iconEdit} />}
                  type="text"
                  className=""
                  style={{
                    paddingLeft: 24,
                    background: "transparent",
                    border: "none",
                  }}
                >
                  Chỉnh sửa
                </Button>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Button
                icon={<img alt="" style={{ marginRight: 12 }} src={iconDelete} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                  color: "red",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteShippingService(row.id);
                }}
              >
                Xóa
              </Button>
            </Menu.Item>
          </Menu>
        );
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 4px",
            }}
          >
            <div className="action-group">
              <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
                <Button
                  type="text"
                  icon={<img src={threeDot} alt=""></img>}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                ></Button>
              </Dropdown>
            </div>
          </div>
        );
      },
    },
  ];

  const history = useHistory();

  const renderCardExtra = () => {
    return (
      <Link to={`${UrlConfig.ORDER_SETTINGS}/create`}>
        <PlusOutlined style={{ marginRight: 5 }} />
        Thêm cài đặt
      </Link>
    );
  };

  const goToPageDetail = (id: string | number) => {
    history.push(`${UrlConfig.ORDER_SETTINGS}/shipping-services-and-shipping-fee/${id}`);
  };

  const onUpdateOrderConfig = (params: OrderConfigRequestModel) => {
    dispatch(
      actionEditOrderConfig(params, (response) => {
        console.log("response", response);
      }),
    );
  };

  useEffect(() => {
    dispatch(
      actionGetOrderConfigPrint((response) => {
        setListPrintConfig(response);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      actionGetOrderConfig((response) => {
        setListOrderConfigs(response);
        setIsLoadedData(true);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        setIsTableLoading(false);
      }),
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Cấu hình đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Cấu hình đơn hàng",
          },
        ]}
      >
        {isLoadedData ? (
          <CardGeneralSettings
            listPrintConfig={listPrintConfig}
            listActionsOrderPreview={shipping_requirements}
            listOrderConfigs={listOrderConfigs}
            onUpdateOrderConfig={onUpdateOrderConfig}
          />
        ) : (
          <div style={{ marginBottom: 15 }}>Đang cập nhật...</div>
        )}

        <Card title="Cài đặt dịch vụ vận chuyển và phí ship báo khách" extra={renderCardExtra()}>
          <CustomTable
            isLoading={isTableLoading}
            showColumnSetting={false}
            pagination={false}
            dataSource={ShippingServiceConfig}
            columns={TABLE_COLUMN}
            rowKey={(item: ShippingServiceConfigResponseModel) => item.id}
            onRow={(record: ShippingServiceConfigResponseModel) => {
              return {
                onClick: (event) => {
                  goToPageDetail(record.id);
                }, // click row
              };
            }}
          />
        </Card>
      </ContentContainer>
    </StyledComponent>
  );
}

export default OrderSettings;
