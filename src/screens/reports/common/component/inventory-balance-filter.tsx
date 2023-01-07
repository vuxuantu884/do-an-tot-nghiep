import { FilterOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Row, Select } from "antd";
import { CityByCountryAction } from "domain/actions/content/content.action";
import { ProvinceModel } from "model/content/district.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AnalyticsDatePicker from "screens/reports/analytics/shared/analytics-date-picker";
import { VietNamId } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { strForSearch } from "utils/StringUtils";
import { InventoryBalanceFilterForm } from "../enums/inventory-balance-report";
import { InventoryBalanceFilterStyle } from "../styles/inventory-balance-filter.style";
import DepartmentSelect from "./department-select";

const { Option } = Select;
interface Props {
  applyFilter: (conditionFilter: any) => void;
}

function InventoryBalanceFilter({ applyFilter }: Props) {
  const [form] = Form.useForm();
  const [finalOptions, setFinalOptions] = useState<any[]>([]);

  const dispatch = useDispatch();
  const [listProvinces, setListProvinces] = useState<ProvinceModel[]>([]);

  const addAdditionalOptions = (keySearch: string) => {
    const skus = form.getFieldValue(InventoryBalanceFilterForm.Skus);
    const selectedOptions = skus?.length
      ? skus.map((value: string) => {
          return { label: value, value };
        })
      : [];
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
    const { timeRange, inventory, skus } = conditionFilter;
    if (!timeRange || !inventory) {
      return;
    }
    const startDate = timeRange[0].format(DATE_FORMAT.YYYYMMDD);
    const endDate = timeRange[1].format(DATE_FORMAT.YYYYMMDD);
    applyFilter({ startDate, endDate, listSKU: skus?.join(","), storeName: inventory });
  };

  const openFilter = () => {};

  useEffect(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setListProvinces(response);
      }),
    );
  }, [dispatch]);
  console.log("listProvinces", listProvinces);

  return (
    <InventoryBalanceFilterStyle>
      <Form form={form} name="form-filter">
        <Row gutter={10} justify="start">
          <Col>
            <Card>
              <Form.Item
                name={InventoryBalanceFilterForm.TimeRange}
                label="Thời gian"
                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                className="input-width report-filter-item"
                help={false}
              >
                <AnalyticsDatePicker className="input-width-sm" />
              </Form.Item>
            </Card>
          </Col>
          <Col>
            <Card>
              <Row gutter={10}>
                <Col>
                  <Form.Item label="Kho/Cửa hàng" name={InventoryBalanceFilterForm.Province}>
                    <Select
                      style={{ width: "200px" }}
                      showSearch
                      allowClear
                      placeholder={"Tỉnh thành"}
                      filterOption={(input: string, option: any) => {
                        if (option.props.value) {
                          return strForSearch(option.props.children).includes(strForSearch(input));
                        }
                        return false;
                      }}
                    >
                      {listProvinces.map((item, index) => (
                        <Option key={"province" + index} value={JSON.stringify(item)}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    name={InventoryBalanceFilterForm.Inventory}
                    rules={[{ required: true, message: "Vui lòng chọn kho/cửa hàng" }]}
                  >
                    <DepartmentSelect form={form}></DepartmentSelect>
                  </Form.Item>
                </Col>
                <Col>
                  <Button
                    htmlType="submit"
                    type="primary"
                    onClick={onApplyFilter}
                    className="btn-filter"
                  >
                    Lọc
                  </Button>
                  <Button onClick={openFilter} icon={<FilterOutlined />}>
                    Thêm bộ lọc
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
          {/* <Form.Item
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
        </Form.Item> */}
        </Row>
      </Form>
    </InventoryBalanceFilterStyle>
  );
}

export default InventoryBalanceFilter;
