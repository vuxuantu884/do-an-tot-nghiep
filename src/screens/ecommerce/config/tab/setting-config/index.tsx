import { StyledConfig } from "./styles";
import { Row, Col, Form, Input, Select, Button, Tag } from "antd";
import React, { useState } from "react";
import CustomSelect from "component/custom/select.custom";
import shopeeIcon from "assets/icon/e-shopee.svg";
import shopeeSendo from "assets/icon/e-sendo.svg";
import shopeeLazada from "assets/icon/e-lazada.svg";
import shopeeTiki from "assets/icon/e-tiki.svg";
import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { EcommerceRequest } from "model/request/ecommerce.request";

const { Option } = Select;
type SettingConfigProps = {
  listStores: Array<StoreResponse>;
  accounts: Array<AccountResponse>;
  form: any;
  configList: Array<EcommerceResponse>;
  configToView: EcommerceResponse | undefined;
  accountChangeSearch: (value: string) => void;
  handleCreateConfig: (value: EcommerceRequest) => void;
};

const SettingConfig: React.FC<SettingConfigProps> = (
  props: SettingConfigProps
) => {
  const {
    listStores,
    accountChangeSearch,
    accounts,
    form,
    handleCreateConfig,
    configToView,
  } = props;

  function tagRender(props: any) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="primary-bg"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        {label}
      </Tag>
    );
  }
const handleStoreChange = (event: any) => {
  let inventories  = []
  for(let id of event){
    const _store = listStores.find((store) => store.id === id)
    if(_store){
      inventories.push({
        store: _store.name,
        store_id: id
      })
    }

  }
  console.log(inventories)
}
  //mock
  React.useEffect(() => {
    if (configToView) {
      form.setFieldsValue({
        name: configToView.name,
      });
    }
  }, [configToView, form]);
  console.log("object");
  const [listSources] = useState<Array<any>>([
    {
      id: "1",
      shop_name: "Shop Hàng Đẹp",
      ecommerce_img: shopeeIcon,
      shop_id: "0696969",
    },
    {
      id: "2",
      shop_name: "Shop Hàng Mới",
      ecommerce_img: shopeeLazada,
      shop_id: "0696969",
    },
    {
      id: "3",
      shop_name: "Shop Gì Đó",
      ecommerce_img: shopeeTiki,
      shop_id: "0696969",
    },
    {
      id: "4",
      shop_name: "Shop Gì Đó Ơi",
      ecommerce_img: shopeeSendo,
      shop_id: "0696969",
    },
  ]);

  return (
    <StyledConfig className="padding-20">
      <Form form={form} onFinish={(value) => handleCreateConfig(value)}>
        <Row>
          <Col span={5}>
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
                },
              ]}
            >
              <CustomSelect
                showArrow
                showSearch
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                filterOption={(input, option) => {
                  if (option) {
                    return (
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  }
                  return false;
                }}
              >
                {listSources.map((item, index) => (
                  <CustomSelect.Option
                    style={{ width: "100%" }}
                    key={index.toString()}
                    value={item.id}
                  >
                    <img
                      style={{ marginRight: 8, paddingBottom: 4 }}
                      src={item.ecommerce_img}
                      alt=""
                    />{" "}
                    {item.shop_name}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Đặt tên gian hàng</span>
            <span className="description">
              Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt
              các gian hàng với nhau
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Tên gian hàng</span>}
              name="shop_name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn gian hàng",
                },
              ]}
            >
              <Input placeholder="Nhập tên gian hàng"></Input>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">
              Cấu hình nhân viên, cửa hàng
            </span>
            <span className="description">
              Lựa chọn cửa hàng và nhân viên bán hàng để ghi nhận doanh số
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Cửa hàng</span>}
              name="store_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
                },
              ]}
            >
              <Input placeholder="Nhập tên cửa hàng"></Input>
            </Form.Item>
            <Form.Item
              label={<span>Nhân viên bán hàng</span>}
              name="assign_account_code"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhân viên bán hàng",
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Chọn nhân viên bán hàng"
                allowClear
                optionFilterProp="children"
                onSearch={(value) => accountChangeSearch(value)}
              >
                {accounts &&
                  accounts.map((c: any) => (
                    <Option key={c.id} value={c.code}>
                      {`${c.code} - ${c.full_name}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Cấu hình đơn hàng</span>
            <span className="description">
              Chọn kiểu đồng bộ đơn hàng để cập nhật đơn tự động hay thủ công
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Kiểu đồng bộ đơn hàng</span>}
              name="order_sync"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kiểu đồng bộ đơn hàng",
                },
              ]}
            >
              <Select placeholder="Chọn kiểu đồng bộ đơn hàng">
                <Option value={"auto"}>Tự động</Option>
                <Option value={"manual"}>Thủ công</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Cấu hình sản phẩm</span>
            <span className="description">
              Chọn kiểu động bộ sản phẩm khi đơn hàng mới có sản phẩm chưa có
              trên admin
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Kiểu đồng bộ sản phẩm</span>}
              name="product_sync"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kiểu đồng bộ sản phẩm",
                },
              ]}
            >
              <Select placeholder="Chọn kiểu đồng bộ sản phẩm">
                <Option value={"auto"}>Tự động</Option>
                <Option value={"manual"}>Thủ công</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Cấu hình tồn kho</span>
            <span className="description">
              Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt
              các gian hàng với nhau
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Kiểu đồng bộ tồn kho</span>}
              name="inventory_sync"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kiểu đồng bộ tồn kho",
                },
              ]}
            >
              <Select placeholder="Chọn kiểu đồng bộ tồn kho">
                <Option value={"auto"}>Tự động</Option>
                <Option value={"manual"}>Thủ công</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="inventories"
              className="store"
              label={<span>Kho đồng bộ tồn</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kho đồng bộ tồn",
                },
              ]}
            >
              <CustomSelect
                showSearch
                optionFilterProp="children"
                showArrow
                placeholder="Chọn cửa hàng"
                mode="multiple"
                allowClear
                onChange={handleStoreChange}
                tagRender={tagRender}
                style={{
                  width: "100%",
                }}
                notFoundContent="Không tìm thấy kết quả"
                maxTagCount="responsive"
              >
                {listStores?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.id}>
                    {item.name}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Form.Item>
          </Col>
        </Row>
        <div className="customer-bottom-button">
          <Button
            className="disconnect-btn"
            // onClick={() => history.goBack()}
            style={{ marginLeft: ".75rem", marginRight: ".75rem" }}
            type="ghost"
          >
            Ngắt kết nối
          </Button>
          <Button type="primary" htmlType="submit">
            Lưu lại
          </Button>
        </div>
      </Form>
    </StyledConfig>
  );
};

export default SettingConfig;
