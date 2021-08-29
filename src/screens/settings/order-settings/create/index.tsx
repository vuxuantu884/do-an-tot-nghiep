import { CheckOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Switch, Form, Button } from "antd";
import ContentContainer from "component/container/content.container";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import OrderSettingInformation from "./OrderSettingInformation";
import OrderSettingValue from "./OrderSettingValue";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderSettings(props: PropType) {
  const FAKE_LOGISTIC_SETTINGS = [
    {
      key: "1",
      name: "Phí ship free đơn từ 499k, 20k đơn nhỏ hơn 499k 1",
      style: "Kiểu 1",
      date: "15:30 25/08/2021 - 12:00 31/21/2022 1",
      isActive: true,
    },
    {
      key: "2",
      name: "Phí ship free đơn từ 499k, 20k đơn nhỏ hơn 499k 2",
      style: "Kiểu 2",
      date: "15:30 25/08/2021 - 12:00 31/21/2022 2",
      isActive: false,
    },
    {
      key: "3",
      name: "Phí ship free đơn từ 499k, 20k đơn nhỏ hơn 499k 3",
      style: "Kiểu 3",
      date: "15:30 25/08/2021 - 12:00 31/21/2022 3",
      isActive: true,
    },
  ];

  const onChange = (checked: any) => {
    console.log("checked", checked);
  };

  const FAKE_LOGISTIC_SETTINGS_COLUMN = [
    {
      title: "STT",
      render: (value: any, row: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Sau",
      dataIndex: "style",
      key: "style",
    },
    {
      title: "Thời gian áp dụng",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Áp dụng",
      dataIndex: "isActive",
      key: "isActive",

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

  const [tableLoading, setTableLoading] = useState(false);

  const history = useHistory();

  const [form] = Form.useForm();

  const renderCardExtra = () => {
    return (
      <div>
        Cho phép bán khi tồn kho <Switch defaultChecked onChange={onChange} />
      </div>
    );
  };

  const initialFormValue = {
    from_date: null,
    to_date: null,
    print_size: null,
    store: null,
    store_id: null,
    template: null,
    type: null,
  };

  const goToPageDetail = (id: string | number) => {
    history.replace(`${UrlConfig.PRINTER}/${id}`);
  };

  const handleSubmitForm = () => {
    form.validateFields().then((formValue: any) => {
      console.log("formValue", formValue);
      console.log("formValue.from_date", formValue.from_date?._d);
    });
  };

  return (
    <StyledComponent>
      <ContentContainer
        title="Thêm cài đặt dịch vụ vận chuyển & phí ship báo khách"
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
            path: UrlConfig.ORDER_SETTINGS,
          },
          {
            name: "Thêm cài đặt",
          },
        ]}
      >
        <Form form={form} layout="vertical" initialValues={initialFormValue}>
          <OrderSettingInformation />
          <OrderSettingValue />
        </Form>
        <Button onClick={() => handleSubmitForm()}>Lưu</Button>
        <Card title="Thông tin chương trình" extra={renderCardExtra()}>
          Cho phép bán khi tồn kho <Switch defaultChecked onChange={onChange} />
        </Card>
        <Card
          title="Cài đặt dịch vụ vận chuyển và phí ship báo khách"
          extra={renderCardExtra()}
        >
          <CustomTable
            isLoading={tableLoading}
            showColumnSetting={false}
            scroll={{ x: 1080 }}
            pagination={false}
            dataSource={FAKE_LOGISTIC_SETTINGS}
            columns={FAKE_LOGISTIC_SETTINGS_COLUMN}
            rowKey={(item: any) => item.key}
            onRow={(record: any) => {
              return {
                onClick: (event) => {
                  goToPageDetail(record.key);
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
