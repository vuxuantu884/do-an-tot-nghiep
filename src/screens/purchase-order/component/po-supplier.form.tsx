//#region Import
import { Space, Card, AutoComplete, Input, Form, Button, Avatar } from "antd";

import { SearchOutlined } from "@ant-design/icons";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AiOutlineClose, AiOutlinePlusCircle } from "react-icons/ai";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { PageResponse } from "model/base/base-metadata.response";
import { SupplierResponse } from "model/core/supplier.model";
import SupplierItem from "./supplier-item";
import avatarDefault from "assets/icon/user.svg";


const POSupplierForm = () => {
  const [data, setData] = useState<Array<SupplierResponse>>([]);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const onResult = useCallback((result: PageResponse<SupplierResponse>) => {
    setData(result.items);
  }, []);
  const onSupplierSearchChange = useCallback(
    (value) => {
      if (value.length >= 3) {
        dispatch(SupplierSearchAction({ info: value }, onResult));
      } else {
        setData([]);
      }
    },
    [dispatch, onResult]
  );
  const onSelect = useCallback(
    (value: string) => {
      let index = data.findIndex((item) => item.id.toString() === value);
      form.setFieldsValue({
        supplier_id: value,
        supplier: data[index],
      });
    },
    [data, form]
  );
  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: SupplierResponse, index: number) => {
      options.push({
        label: <SupplierItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [data]);
  return (
    <Form form={form} name="supplier">
      <Card
        className="po-form"
        title={
          <Space>
            <i className="icon-dot icon-title" />
            Thông tin nhà cung cấp
          </Space>
        }
      >
        <div className="padding-20">
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues.supplier_id !== curValues.supplier_id
            }
          >
            {({ getFieldValue }) => {
              let supplier_id = getFieldValue("supplier_id");
              let supplier: SupplierResponse = getFieldValue("supplier");
              return supplier_id ? (
                <div className="supplier-container">
                  <div className="supplier-container-info">
                    <Avatar src={avatarDefault} />
                    <div className="rs-name">{supplier.name}</div>
                    <div>Công nợ hiện tại: 0</div>
                    <Button className="rs-delete" icon={<AiOutlineClose />} />
                  </div>
                </div>
              ) : (
                <AutoComplete
                  notFoundContent={"Không tìm thấy nhà cung cấp"}
                  onSearch={onSupplierSearchChange}
                  style={{ width: "100%" }}
                  dropdownClassName="supplier"
                  dropdownRender={(menu) => (
                    <div className="dropdown-custom">
                      <Button
                        icon={<AiOutlinePlusCircle size={24} />}
                        className="dropdown-add-new"
                        type="link"
                      >
                        Thêm mới nhà cung cấp
                      </Button>
                      {menu}
                    </div>
                  )}
                  onSelect={onSelect}
                  options={renderResult}
                >
                  <Input
                    placeholder="Tìm hoặc thêm nhà cung cấp... (F4)"
                    className="border-input"
                    prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                  />
                </AutoComplete>
              );
            }}
          </Form.Item>
        </div>

        {/* <div className="padding-20">
          <Space size={40}>
            <Space>
              <Link to="#">Đỗ Nguyệt Anh</Link>
            </Space>
          </Space>
          <Divider className="margin-0" />
          <div className="padding-20">
            <Row gutter={10}>
              <Col md={12}>
                <Space direction="vertical">
                  <strong>Địa chỉ giao hàng</strong>
                  <span>
                    <ProfileOutlined /> Kho online
                  </span>
                  <span>
                    <PhoneOutlined /> 0986868686
                  </span>
                  <span>
                    <EnvironmentOutlined />
                    YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                  </span>
                </Space>
              </Col>
              <Col md={12}>
                <Space direction="vertical">
                  <strong>Địa chỉ hóa đơn</strong>
                  <span>
                    <ProfileOutlined /> Kho online
                  </span>
                  <span>
                    <PhoneOutlined /> 0986868686
                  </span>
                  <span>
                    <EnvironmentOutlined />
                    YODY hub, Dưới chân cầu An Định, Tp. Hải Dương
                  </span>
                </Space>
              </Col>
            </Row>
          </div>
        </div> */}
      </Card>
    </Form>
  );
};

export default POSupplierForm;
