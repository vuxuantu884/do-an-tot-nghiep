import { CheckOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Switch } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  actionConfigureIsAllowToSellWhenNotAvailableStock,
  actionGetIsAllowToSellWhenNotAvailableStock,
  actionListConfigurationShippingServiceAndShippingFee,
} from "domain/actions/settings/order-settings.action";
import { ShippingServiceConfigResponseModel } from "model/response/settings/order-settings.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderSettings(props: PropType) {
  const dateFormat = "HH:mm DD/MM/YYYY";

  const [
    IsAllowToSellWhenNotAvailableStock,
    setIsAllowToSellWhenNotAvailableStock,
  ] = useState(false);

  const [
    isLoadedAllowToSellWhenNotAvailableStock,
    setisLoadedAllowToSellWhenNotAvailableStock,
  ] = useState(false);

  const [ShippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigResponseModel[]
  >([]);
  const dispatch = useDispatch();

  const FAKE_LOGISTIC_SETTINGS_COLUMN = [
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
      title: "Kiểu",
      dataIndex: "style",
      key: "style",
    },
    {
      title: "Thời gian áp dụng",
      dataIndex: "date",
      key: "date",
      render: (
        value: any,
        row: ShippingServiceConfigResponseModel,
        index: number
      ) => {
        const start_date_text = moment(row.start_date).format(dateFormat);
        const end_date_text = moment(row.end_date).format(dateFormat);
        return <span>{`${start_date_text} - ${end_date_text}`}</span>;
      },
    },
    {
      title: "Áp dụng",
      dataIndex: "status",
      key: "status",
      render: (value: any, row: any, index: number) => {
        return <CheckOutlined />;
      },
    },
    {
      title: "",
      render: (value: any, row: any, index: number) => {
        return <MoreOutlined />;
      },
    },
  ];

  // const [tableLoading, setTableLoading] = useState(false);

  const history = useHistory();

  const renderCardExtra = () => {
    return (
      <Link to={`${UrlConfig.ORDER_SETTINGS}/create`}>
        <PlusOutlined style={{ marginRight: 5 }} />
        Thêm cài đặt
      </Link>
    );
  };

  const onChange = (checked: any) => {
    console.log("checked", checked);
    dispatch(
      actionConfigureIsAllowToSellWhenNotAvailableStock(checked, () => {})
    );
  };

  const goToPageDetail = (id: string | number) => {
    history.push(
      `${UrlConfig.ORDER_SETTINGS}/shipping-services-and-shipping-fee/${id}`
    );
  };

  useEffect(() => {
    dispatch(
      actionGetIsAllowToSellWhenNotAvailableStock((response) => {
        setIsAllowToSellWhenNotAvailableStock(response.sellable_inventory);
        setisLoadedAllowToSellWhenNotAvailableStock(true);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        console.log("response", response);
        setShippingServiceConfig(response);
        // setIsAllowToSellWhenNotAvailableStock(response.sellable_inventory);
        // setisLoadedAllowToSellWhenNotAvailableStock(true);
      })
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
        <Card title={null} className="sectionAllowInventory">
          Cho phép bán khi tồn kho
          {isLoadedAllowToSellWhenNotAvailableStock && (
            <Switch
              defaultChecked={IsAllowToSellWhenNotAvailableStock}
              onChange={onChange}
              className="ant-switch-primary"
              style={{ marginLeft: 20 }}
            />
          )}
        </Card>
        <Card
          title="Cài đặt dịch vụ vận chuyển và phí ship báo khách"
          extra={renderCardExtra()}
        >
          <CustomTable
            // isLoading={tableLoading}
            showColumnSetting={false}
            scroll={{ x: 1080 }}
            pagination={false}
            dataSource={ShippingServiceConfig}
            columns={FAKE_LOGISTIC_SETTINGS_COLUMN}
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
