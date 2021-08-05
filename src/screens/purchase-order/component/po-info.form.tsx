import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Form, Input, Select } from "antd";
import HashTag from "component/custom/hashtag";
import { AccountResponse } from "model/account/account.model";

type POInfoFormProps = {
  winAccount: Array<AccountResponse>;
  rdAccount: Array<AccountResponse>;
};

const POInfoForm: React.FC<POInfoFormProps> = (props: POInfoFormProps) => {
  return (
    <div>
      <Card
        className="po-form"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN ĐƠN MUA HÀNG</span>
          </div>
        }
      >
        <div className="padding-20">
          <Form.Item
            rules={[
              {
                required: true,
                message: "Vui lòng chọn Merchandiser",
              },
            ]}
            name="merchandiser_code"
            label="Merchandiser"
          >
            <Select showArrow showSearch placeholder="Chọn Merchandiser">
              <Select.Option value="">Chọn Merchandiser</Select.Option>
              {props.winAccount.map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {[item.code, item.full_name].join(' - ')}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="qc_code" label="QC">
            <Select showArrow showSearch placeholder="Chọn QC">
              <Select.Option value="">Chọn QC</Select.Option>
              {props.rdAccount.map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {item.full_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            tooltip={{
              title: "Thêm số tham chiếu hoặc mã hợp đồng",
              icon: <InfoCircleOutlined />,
            }}
            name="reference"
            label="Số tham chiếu"
          >
            <Input type="text" maxLength={255} placeholder="Nhập số tham chiếu" />
          </Form.Item>
        </div>
      </Card>
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN BỔ SUNG</span>
          </div>
        }
      >
        <div className="padding-20">
          <Form.Item label="Ghi chú nội bộ" name="note">
            <Input.TextArea maxLength={500} placeholder="Nhập ghi chú" />
          </Form.Item>
          <Form.Item
            tooltip={{
              title: "Thẻ ngày giúp tìm kiếm đơn hàng",
              icon: <InfoCircleOutlined />,
            }}
            name="tags"
            label="Tag"
          >
            <HashTag placeholder="Thêm tag" />
          </Form.Item>
        </div>
      </Card>
    </div>
  );
};

export default POInfoForm;
