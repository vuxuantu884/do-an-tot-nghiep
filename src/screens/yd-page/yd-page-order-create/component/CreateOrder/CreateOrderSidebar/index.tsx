import {InfoCircleOutlined, SearchOutlined} from "@ant-design/icons";
import {Card, Form, Input, Select} from "antd";
import UrlConfig from "config/url.config";
import {AccountResponse} from "model/account/account.model";
import {OrderResponse} from "model/response/order/order.response";
import React from "react";
import {Link} from "react-router-dom";
import SidebarOrderHistory from "./SidebarOrderHistory";
import CustomInputTags from "component/custom/custom-input-tags";
import {StyledComponent} from "./styles";

type PropType = {
  accounts: AccountResponse[];
  tags: string;
  levelOrder?: number;
  updateOrder?: boolean;
  customerId?: number | undefined;
  orderDetail?: OrderResponse | null;
  onChangeTag: (value: []) => void;
};

/**
 * sử dụng trong tạo đơn hàng, sửa đơn hàng, clone
 *
 * accounts: danh sách nhân viên
 *
 * leverOrder: phân quyền
 *
 * updateOrder: sửa đơn hàng
 *
 * customerId: id khách hàng, để lấy thông tin lịch sử giao dịch
 *
 * orderDetail: chi tiết đơn hàng
 *
 * onChangeTag: xử lý khi thay đổi tag
 */
const CreateOrderSidebar: React.FC<PropType> = (props: PropType) => {
  const {accounts, onChangeTag, tags, customerId, orderDetail} = props;

  const renderSplitOrder = () => {
    const splitCharacter = "-";
    if (!orderDetail?.linked_order_code) {
      return;
    }
    let result = orderDetail.linked_order_code.split(splitCharacter);
    if (result.length > 1) {
      return (
        <div>
          <label>Đơn tách:{"   "}</label>
          {result.map((single, index) => {
            return (
              <React.Fragment>
                <Link target="_blank" to={`${UrlConfig.ORDER}/${single}`}>
                  <strong>{single}</strong>
                </Link>
                {index < result.length - 1 && ", "}
              </React.Fragment>
            );
          })}
        </div>
      );
    } else {
      return (
        <div>
          <label>Đơn gốc tách đơn:{"   "}</label>
          <Link
            target="_blank"
            to={`${UrlConfig.ORDER}/${orderDetail.linked_order_code}`}
          >
            <strong>{orderDetail.linked_order_code}</strong>
          </Link>
        </div>
      );
    }
  };

  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
        <Form.Item
          label="Nhân viên bán hàng"
          name="assignee_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên bán hàng",
            },
          ]}
        >
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Nhân viên marketing"
          name="marketer_code"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn nhân viên marketing",
            },
          ]}
        >
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Nhân viên điều phối" name="coordinator_code">
          <Select
            className="select-with-search"
            notFoundContent="Không tìm thấy kết quả"
            showSearch
            allowClear
            placeholder={
              <React.Fragment>
                <SearchOutlined />
                <span> Tìm, chọn nhân viên</span>
              </React.Fragment>
            }
            filterOption={(input, option) => {
              if (option) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }
              return false;
            }}
          >
            {accounts.map((item, index) => (
              <Select.Option key={index.toString()} value={item.code}>
                {`${item.code} - ${item.full_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Tham chiếu"
          name="reference_code"
          tooltip={{
            title: "Thêm số tham chiếu hoặc ID đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền tham chiếu" maxLength={255} />
        </Form.Item>
        <Form.Item
          label="Đường dẫn"
          name="url"
          tooltip={{
            title: "Thêm đường dẫn đơn hàng gốc trên kênh bán hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input placeholder="Điền đường dẫn" maxLength={255} />
        </Form.Item>
        {renderSplitOrder()}
      </Card>
      <Card title="THÔNG TIN BỔ SUNG">
        <Form.Item name="customer_note" label="Ghi chú của khách">
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "130px"}}
          />
        </Form.Item>
        <Form.Item
          name="note"
          label="Ghi chú nội bộ"
          tooltip={{
            title: "Thêm thông tin ghi chú chăm sóc khách hàng",
            icon: <InfoCircleOutlined />,
          }}
        >
          <Input.TextArea
            placeholder="Điền ghi chú"
            maxLength={500}
            style={{minHeight: "130px"}}
          />
        </Form.Item>
        <Form.Item
          label="Tag"
          tooltip={{
            title: "Thêm từ khóa để tiện lọc đơn hàng",
            icon: <InfoCircleOutlined />,
          }}
          // name="tags"
        >
          <CustomInputTags onChangeTag={onChangeTag} tags={tags} />
        </Form.Item>
      </Card>
      <SidebarOrderHistory customerId={customerId} />
    </StyledComponent>
  );
};

export default CreateOrderSidebar;
