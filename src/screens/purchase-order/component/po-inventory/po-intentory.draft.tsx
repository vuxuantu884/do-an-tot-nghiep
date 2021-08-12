import { Col, Form, Input, Row, Select } from "antd";
import CustomDatepicker from "component/custom/date-picker.custom";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

type POInventoryDraftProps = {
  stores: Array<StoreResponse>;
  now: Date;
  isEdit: boolean;
};

const POInventoryDraft: React.FC<POInventoryDraftProps> = (
  props: POInventoryDraftProps
) => {
  const { stores, now, isEdit } = props;
  if (!isEdit) {
    return (
      <Row gutter={50}>
        <Col span={24} md={10}>
          <Form.Item
            name={POField.expect_store_id}
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn kho nhập dự kiến'
              }
            ]}
            label="Kho nhập hàng"
          >
            <Select showSearch optionFilterProp="children">
              <Select.Option value="">Chọn kho nhập</Select.Option>
              {stores.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24} md={10}>
          <Form.Item
            name={POField.expect_import_date}
            required
            label="Ngày nhận dự kiến"
          >
            <CustomDatepicker
              disableDate={(date) => date.valueOf() < now.getTime()}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>
    );
  }
  return (
    <Row gutter={50}>
      <Col span={24} md={10}>
        <Form.Item name={POField.expect_store_id} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.expect_store} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.expect_store] !== current[POField.expect_store]
          }
        >
          {({ getFieldValue }) => {
            let store = getFieldValue(POField.expect_store);
            return (
              <div>
                Kho nhận dự kiến: <strong>{store}</strong>
              </div>
            );
          }}
        </Form.Item>
      </Col>
      <Col span={24} md={10}>
        <Form.Item name={POField.expect_import_date} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.expect_import_date] !== current[POField.expect_import_date]
          }
        >
          {({ getFieldValue }) => {
            let expect_import_date = getFieldValue(POField.expect_import_date);
            return (
              <div>
                Ngày nhận dự kiến: <strong>{ConvertUtcToLocalDate(expect_import_date)}</strong>
              </div>
            );
          }}
        </Form.Item>
      </Col>
    </Row>
  );
};

export default POInventoryDraft;
