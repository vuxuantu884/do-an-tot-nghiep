import { FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Col, Form, List, Modal, Row, Select } from "antd";
import Undo from "assets/icon/undo.svg";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import BaseFilter from "component/filter/base.filter";
import moment from "moment";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useEffectOnce } from "react-use";
import { DATE_FORMAT } from "utils/DateUtils";
import { searchNumberString } from "utils/StringUtils";
import { defaultDisplayOptions } from "../constant/goods-reports/selling-power-report";
import { SellingPowerFilterForm } from "../enums/selling-power-report.enum";
import { TypeSku } from "../enums/type-sku.enum";
import { InventoryBalanceFilterStyle } from "../styles/inventory-balance-filter.style";

interface Props {
  applyFilter: (conditionFilter: any) => void;
  displayOptions: any[];
  setDisplayOptions: (options: any[]) => void;
}

function SellingPowerFilter({ applyFilter, displayOptions, setDisplayOptions }: Props) {
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [visible, setVisible] = useState(false);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const defaultDate = moment().subtract(1, "days");

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

  const openFilter = () => {
    setVisible(true);
  };

  const handleClearFilter = () => {
    form?.setFieldsValue({
      productGroupLv1: undefined,
      productGroupLv2: undefined,
      skuCodes: undefined,
      skuNames: undefined,
    });
  };

  const onFilterClick = useCallback(() => {
    setVisible(false);
    form?.submit();
    onApplyFilter();
  }, [form, onApplyFilter]);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onCheckedChange = (index: number, e: any) => {
    if (index < 0 || index > displayOptions.length - 1) return; // Ignores if outside designated area
    const items = [...displayOptions];
    items[index] = { ...items[index], visible: e.target.checked };
    setDisplayOptions(items);
  };

  const resetDisplayOptions = () => {
    setDisplayOptions(defaultDisplayOptions);
  };

  const onCancelDisplayOptions = () => {
    setShowSettingColumn(false);
  };

  const onConfirmDisplayOptions = () => {
    setShowSettingColumn(false);
    onApplyFilter();
  };

  useEffectOnce(() => {
    applyFilter({
      date: defaultDate.format(DATE_FORMAT.YYYYMMDD),
      typeSKU: TypeSku.Sku13,
    });
  });

  return (
    <>
      <InventoryBalanceFilterStyle>
        <Form form={form} name="form-filter">
          <Card>
            <Row gutter={10} justify="start">
              <Col span={24} md={8}>
                <Form.Item label="Thời gian" name={SellingPowerFilterForm.Date}>
                  <CustomDatePicker
                    disableDate={(date) => date >= moment().startOf("days")}
                    format={DATE_FORMAT.DDMMYYY}
                    placeholder="Chọn thời gian"
                    style={{ width: "100%" }}
                    showToday={false}
                    defaultValue={defaultDate}
                  />
                </Form.Item>
              </Col>
              <Col span={0} md={8}></Col>
              <Col span={24} md={8} className="action-btn-group">
                <Button
                  htmlType="submit"
                  type="primary"
                  onClick={onApplyFilter}
                  className="btn-filter"
                >
                  Lọc kết quả
                </Button>
                <Button onClick={openFilter} className="btn-filter" icon={<FilterOutlined />}>
                  Thêm bộ lọc
                </Button>
                <Button
                  className="btn-filter"
                  title="Ẩn/hiện cột"
                  icon={<SettingOutlined />}
                  onClick={() => setShowSettingColumn(true)}
                />
              </Col>
            </Row>
          </Card>
        </Form>
      </InventoryBalanceFilterStyle>
      <BaseFilter
        onClearFilter={handleClearFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <div className="ant-form ant-form-vertical">
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                label="Nhóm hàng"
                labelCol={{ span: 24 }}
                name={SellingPowerFilterForm.Collection}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={"Chọn nhóm hàng"}
                  // options={productGroupLv1}
                  filterOption={(input, option) => {
                    return option?.label && input
                      ? searchNumberString(input, option?.label as string)
                      : false;
                  }}
                  // onFocus={onGetProductGroupLv1}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                label="Danh mục sản phẩm"
                labelCol={{ span: 24 }}
                name={SellingPowerFilterForm.Category}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder={"Chọn danh mục sản phẩm"}
                  // options={productGroupLv2}
                  filterOption={(input, option) => {
                    return option?.label && input
                      ? searchNumberString(input, option?.label as string)
                      : false;
                  }}
                  // onFocus={onGetProductGroupLv2}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                label="Mã 3 ký tự"
                labelCol={{ span: 24 }}
                name={SellingPowerFilterForm.Sku3}
              >
                <Select
                  showSearch
                  allowClear
                  mode="multiple"
                  maxTagCount={"responsive"}
                  placeholder={"Chọn mã 3 ký tự"}
                  // options={productGroupLv2}
                  filterOption={(input, option) => {
                    return option?.label && input
                      ? searchNumberString(input, option?.label as string)
                      : false;
                  }}
                  // onFocus={onGetProductGroupLv2}
                ></Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item
                label="Mã 7 ký tự"
                labelCol={{ span: 24 }}
                name={SellingPowerFilterForm.Sku7}
              >
                <Select
                  showSearch
                  allowClear
                  mode="multiple"
                  maxTagCount={"responsive"}
                  placeholder={"Chọn mã 7 ký tự"}
                ></Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={50}>
            <Col span={24}>
              <Form.Item label="Mã SKU" labelCol={{ span: 24 }} name={SellingPowerFilterForm.Sku13}>
                <Select
                  showSearch
                  allowClear
                  mode="multiple"
                  maxTagCount={"responsive"}
                  placeholder={"Chọn mã SKU"}
                ></Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </BaseFilter>
      <Modal
        title="Thay đổi tuỳ chọn hiển thị"
        closable={false}
        visible={showSettingColumn}
        onCancel={onCancelDisplayOptions}
        footer={[
          <div
            key="footer-button-list"
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button
              key="return_default"
              icon={<img src={Undo} style={{ marginRight: 5 }} alt="" />}
              onClick={resetDisplayOptions}
            >
              Quay về mặc định
            </Button>

            <div>
              <Button key="on_cancel" onClick={onCancelDisplayOptions}>
                Huỷ
              </Button>
              <Button key="on_confirm" type="primary" onClick={() => onConfirmDisplayOptions()}>
                Lưu
              </Button>
            </div>
          </div>,
        ]}
      >
        <List
          dataSource={displayOptions}
          renderItem={(item, index) => (
            <Checkbox
              key={item.key}
              onChange={(e) => onCheckedChange(index, e)}
              checked={item.visible}
            >
              {item.title}
            </Checkbox>
          )}
        />
      </Modal>
    </>
  );
}

export default SellingPowerFilter;
