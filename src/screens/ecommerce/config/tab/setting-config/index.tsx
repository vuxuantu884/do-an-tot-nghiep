import { StyledConfig } from "./styles";
import { Row, Col, Form, Input, Select } from "antd";
import { SourceResponse } from "model/response/order/source.response";
import React, { useState, useEffect, useMemo } from "react";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { useDispatch } from "react-redux";
import CustomSelect from "component/custom/select.custom";

const { Option } = Select;
type SettingConfigProps = {};

// interface EcommerceConfig {

// }

const SettingConfig: React.FC<SettingConfigProps> = (
  props: SettingConfigProps
) => {
  const dispatch = useDispatch();
  const [configForm] = Form.useForm()
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);

  useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);

  return (
    <StyledConfig className="padding-20">
      <Form form={configForm}>
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
                placeholder="Nguồn đơn hàng"
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
                    {item.name}
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
      </Form>
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
          <Form.Item
            label={<span>Kiểu đồng bộ tồn</span>}
            name="remaining_sync_type"
          >
            <Select placeholder="Chọn kiểu đồng bộ tồn">
              <Option value={"auto"}>Tự động</Option>
              <Option value={"manual"}>Thủ công</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </StyledConfig>
  );
};

export default SettingConfig;
