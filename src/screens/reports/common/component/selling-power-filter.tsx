import { FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Select } from "antd";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import moment from "moment";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import { SellingPowerFilterForm } from "../enums/selling-power-report.enum";
import { TypeSku } from "../enums/type-sku.enum";
import { InventoryBalanceFilterStyle } from "../styles/inventory-balance-filter.style";

const { Option } = Select;
interface Props {
  applyFilter: (conditionFilter: any) => void;
}

function SellingPowerFilter({ applyFilter }: Props) {
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onApplyFilter = useCallback(() => {
    const conditionFilter = form.getFieldsValue();
    const { date } = conditionFilter;
    if (!date) {
      return;
    }
    applyFilter({
      date: moment(date, DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.YYYYMMDD),
      typeSKU: TypeSku.Sku13,
    });
  }, [applyFilter, form]);

  const openFilter = () => {};

  return (
    <>
      <InventoryBalanceFilterStyle>
        <Form form={form} name="form-filter">
          <Card>
            <Row gutter={10} justify="start">
              <Col span={24} md={12} lg={8}>
                <Form.Item label="Thời gian" name={SellingPowerFilterForm.Date}>
                  <CustomDatePicker
                    format={DATE_FORMAT.DDMMYYY}
                    placeholder="Chọn thời gian"
                    style={{ width: "100%" }}
                    showToday={false}
                  />
                </Form.Item>
              </Col>
              <Col span={24} lg={8} className="action-btn-group">
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={onApplyFilter}
                  className="btn-filter"
                >
                  Lọc
                </Button>
                <Button onClick={openFilter} className="btn-filter" icon={<FilterOutlined />}>
                  Thêm bộ lọc
                </Button>
                <Button
                  className="btn-setting"
                  title="Ẩn/hiện cột"
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettingColumn(true)}
                />
              </Col>
            </Row>
          </Card>
        </Form>
      </InventoryBalanceFilterStyle>
    </>
  );
}

export default SellingPowerFilter;
