import { Button, Card, Form, Row, Select } from "antd";
import { useState } from "react";
import AnalyticsDatePicker from "screens/reports/analytics/shared/analytics-date-picker";
import { DATE_FORMAT } from "utils/DateUtils";
import { searchNumberString } from "utils/StringUtils";
import { InventoryBalanceFilterForm } from "../enums/inventory-balance-report";
import DepartmentSelect from "./department-select";

interface Props {
  applyFilter: (conditionFilter: any) => void;
}

function InventoryBalanceFilter({ applyFilter }: Props) {
  const [form] = Form.useForm();
  const [finalOptions, setFinalOptions] = useState<any[]>([]);

  const addAdditionalOptions = (keySearch: string) => {
    const skus = form.getFieldValue(InventoryBalanceFilterForm.Skus);
    const selectedOptions = skus?.length
      ? skus.map((value: string) => {
          return { label: value, value };
        })
      : [];
    console.log("selectedOptions", selectedOptions);

    const opt = { label: keySearch, value: keySearch };
    setFinalOptions(() => {
      if (!skus?.includes(keySearch)) {
        return [...selectedOptions, opt];
      }
      return [...selectedOptions];
    });
  };

  const onApplyFilter = () => {
    const conditionFilter = form.getFieldsValue();
    const { timeRange, inventories, skus } = conditionFilter;
    if (!timeRange || !inventories) {
      return;
    }
    const startDate = timeRange[0].format(DATE_FORMAT.YYYYMMDD);
    const endDate = timeRange[1].format(DATE_FORMAT.YYYYMMDD);
    applyFilter({ startDate, endDate, listSKU: skus?.join(","), storeIds: inventories.join(",") });
  };
  return (
    <Form form={form} name="form-filter">
      <Card bodyStyle={{ paddingBottom: 8, paddingTop: 8 }} className="form-filter-wrapper">
        <Row gutter={10} justify="start">
          <Form.Item
            name={InventoryBalanceFilterForm.TimeRange}
            label="Thời gian"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
            className="input-width report-filter-item"
            help={false}
          >
            <AnalyticsDatePicker className="input-width-sm" />
          </Form.Item>
          <Form.Item
            name={InventoryBalanceFilterForm.Inventories}
            label="Kho/Cửa hàng"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: "Vui lòng chọn kho/cửa hàng" }]}
          >
            <DepartmentSelect form={form}></DepartmentSelect>
          </Form.Item>
          <Form.Item
            label="Mã vật tư (SKU)"
            labelCol={{ span: 24 }}
            name={InventoryBalanceFilterForm.Skus}
          >
            <Select
              style={{ width: "200px" }}
              showSearch
              allowClear
              mode="multiple"
              maxTagCount={"responsive"}
              placeholder={"Tìm kiếm theo mã vật tư (SKU)"}
              onSearch={(value) => addAdditionalOptions(value)}
              options={finalOptions}
              filterOption={(input, option) => {
                return option?.label && input
                  ? searchNumberString(input, option?.label as string)
                  : false;
              }}
            />
          </Form.Item>
          <Form.Item label="-" labelCol={{ span: 24 }}>
            <Button htmlType="submit" type="primary" onClick={onApplyFilter}>
              Áp dụng
            </Button>
          </Form.Item>
        </Row>
      </Card>
    </Form>
  );
}

export default InventoryBalanceFilter;
