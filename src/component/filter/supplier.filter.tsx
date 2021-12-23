import { Button, Col, Form, Input, Row, Select } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { SupplierQuery } from "model/core/supplier.model";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { useCallback, useEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import CustomDatepicker from "component/custom/date-picker.custom";
import { DistrictResponse } from "model/content/district.model";
import "assets/css/custom-filter.scss";
import SelectPaging from "component/custom/SelectPaging";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountResponse } from "model/account/account.model";

type SupplierFilterProps = {
  initValue: SupplierQuery;
  params: SupplierQuery;
  onFilter?: (values: SupplierQuery) => void;
  supplierStatus?: Array<BaseBootstrapResponse>;
  listSupplierType?: Array<BaseBootstrapResponse>;
  scorecard?: Array<BaseBootstrapResponse>;
  listDistrict?: Array<DistrictResponse>;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
  accounts: PageResponse<AccountResponse>;
  onAccountPageChange: (key: string, page: number) => void;
};

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const {
    onFilter,
    params,
    initValue,
    listSupplierType,
    supplierStatus,
    scorecard,
    listDistrict,
    actions,
    onAccountPageChange,
    accounts,
    onMenuClick,
  } = props;
  const [visible, setVisible] = useState(false);
  const [formAdvance] = Form.useForm();
  // const formRef = createRef<FormInstance>();

  const onFinish = useCallback(
    (values: SupplierQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvance.submit();
  }, [formAdvance]);
  const onClearFilterAdvanceClick = useCallback(() => {
    formAdvance.setFieldsValue(initValue);
    setVisible(false);
    formAdvance.submit();
  }, [formAdvance, initValue]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
  useEffect(() => {
    if (visible) {
      formAdvance.resetFields();
    }

    formAdvance.setFieldsValue({
      district_id: params.district_id,
    });
  }, [formAdvance, listDistrict, params.district_id, visible]);

  return (
    <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="condition" style={{ flex: 1 }}>
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tên/Mã nhà cung cấp"
            />
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{
                width: 200,
              }}
              allowClear
              placeholder="Loại nhà cung cấp"
            >
              {listSupplierType?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
          </Form.Item>
        </Form>
      </CustomFilter>
      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <Form
          form={formAdvance}
          onFinish={onFinish}
          //ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Form.Item label="Thông tin liên hệ" name="contact">
            <Input placeholder="Tên/SDT người liên hệ" />
          </Form.Item>
          <Form.Item name="pics" label="Tên / Mã người phụ trách">
            <SelectPaging
              allowClear
              mode="multiple"
              placeholder="Nhân viên phụ trách"
              searchPlaceholder={"Tìm kiếm nhân viên phụ trách"}
              metadata={accounts.metadata}
              maxTagCount="responsive"
              onPageChange={(key, page) => {
                onAccountPageChange(key, page);
              }}
              showSearch={false}
              onSearch={(key) => {
                onAccountPageChange(key, 1);
              }}
            >
              {accounts.items.map((value, index) => (
                <SelectPaging.Option key={value.id} value={value.code}>
                  {value.code + " - " + value.full_name}
                </SelectPaging.Option>
              ))}
            </SelectPaging>
          </Form.Item>
          <Row gutter={50}>
            <Col span={24}>
              <Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái nhà cung cấp" allowClear>
                  {supplierStatus?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Item name="scorecard" label="Phân cấp NCC">
            <Select placeholder="Chọn phân cấp" allowClear>
              {scorecard?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>
          <Item label="Tỉnh/ Thành phố" name="district_id">
            <Select allowClear showSearch placeholder="Chọn khu vực" optionFilterProp="children">
              {listDistrict?.map((item) => (
                <Option key={item.id} value={item.id.toString()}>
                  {item.city_name} - {item.name}
                </Option>
              ))}
            </Select>
          </Item>

          <Row gutter={50}>
            <Col span={12}>
              <Item name="from_created_date" label="Ngày tạo từ">
                <CustomDatepicker placeholder="Ngày tạo từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item label="Đến" name="to_created_date">
                <CustomDatepicker placeholder="Ngày tạo đến" />
              </Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </div>
  );
};

export default SupplierFilter;
