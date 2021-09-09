import { StyledConfig } from "./styles";
import { Row, Col, Form, Input, Select, Button, Tag } from "antd";
import React, { useState } from "react";
import CustomSelect from "component/custom/select.custom";
import shopeeIcon from "assets/icon/shopee.svg";
import arrowLeft from "assets/icon/arrow-left.svg";
import { Link } from "react-router-dom";
import { StoreResponse } from "model/core/store.model";

const { Option } = Select;
type SettingConfigProps = {
  listStores: Array<StoreResponse>;
};

// interface EcommerceConfig {

// }

const SettingConfig: React.FC<SettingConfigProps> = ({
  listStores,
}: SettingConfigProps) => {
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

  //mock
  const [configForm] = Form.useForm();
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
      ecommerce_img: shopeeIcon,
      shop_id: "0696969",
    },
    {
      id: "3",
      shop_name: "Shop Gì Đó",
      ecommerce_img: shopeeIcon,
      shop_id: "0696969",
    },
  ]);

  // useEffect(() => {
  //   dispatch(getListSourceRequest(setListSource));
  // }, [dispatch]);

  // const listSources = useMemo(() => {
  //   return listSource.filter((item) => item.code !== "pos");
  // }, [listSource]);
  const onFinish = (value: any) => {
    console.log(value)
  };

  return (
    <StyledConfig className="padding-20">
      <Form form={configForm} onFinish={onFinish}>
        <Row>
          <Col span={5}>
            <Form.Item
              name="source_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nguồn đơn hàng",
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
            <Form.Item label={<span>Tên gian hàng</span>} name="shop_name">
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
            <Form.Item label={<span>Cửa hàng</span>} name="shop">
              <Input placeholder="Nhập tên gian hàng"></Input>
            </Form.Item>
            <Form.Item
              label={<span>Nhân viên bán hàng</span>}
              name="shop_staff"
            >
              <Input placeholder="Nhập tên gian hàng"></Input>
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
            name="order_sync_type"
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
            Chọn kiểu động bộ sản phẩm khi đơn hàng mới có sản phẩm chưa có trên
            admin
          </span>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<span>Kiểu đồng bộ sản phẩm</span>}
            name="product_sync_type"
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
            Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt các
            gian hàng với nhau
          </span>
        </Col>
        <Col span={12}>
          <Form.Item
            label={<span>Kiểu đồng bộ tồn kho</span>}
            name="inventory_sync_type"
          >
            <Select placeholder="Chọn kiểu đồng bộ tồn kho">
              <Option value={"auto"}>Tự động</Option>
              <Option value={"manual"}>Thủ công</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sync" className="store" label={<span>Kiểu đồng bộ tồn</span>}>
            <CustomSelect
              showSearch
              optionFilterProp="children"
              showArrow
              placeholder="Chọn cửa hàng"
              mode="multiple"
              allowClear
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
        <Link to="/customers">
          <div style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            Quay lại danh sách khách hàng
          </div>
        </Link>
        <div>
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
      </div>
      </Form>
    </StyledConfig>
  );
};

export default SettingConfig;
