import { Button, Col, Form, Input, Row, Select, Tooltip } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { SupplierQuery } from "model/core/supplier.model";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { useCallback, useEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";
import CustomDatepicker from "component/custom/date-picker.custom";
import { DistrictResponse } from "model/content/district.model";

type SupplierFilterProps = {
  initValue: SupplierQuery;
  params: SupplierQuery;
  onFilter?: (values: SupplierQuery) => void;
  supplierStatus?: Array<BaseBootstrapResponse>;
  goods?: Array<BaseBootstrapResponse>;
  listSupplierType?: Array<BaseBootstrapResponse>;
  scorecard?: Array<BaseBootstrapResponse>;
  listDistrict?: Array<DistrictResponse>;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
};

const { Item } = Form;
const { Option } = Select;

const SupplierFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const {
    onFilter,
    params,
    initValue,
    goods,
    listSupplierType,
    supplierStatus,
    scorecard,
    listDistrict,
    actions,
    onMenuClick,
  } = props;
  const [visible, setVisible] = useState(false);
  const [formAdvance] = Form.useForm();
  // const formRef = createRef<FormInstance>();

  const onFinish = useCallback(
    (values: SupplierQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter],
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
    [onMenuClick],
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
    <div>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Tên/Mã nhà cung cấp"
            />
          </Form.Item>
          <Form.Item name="goods">
            <Select
              style={{
                width: 200,
              }}
            >
              <Select.Option value="">Ngành hàng</Select.Option>
              {goods?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type">
            <Select
              style={{
                width: 200,
              }}
            >
              <Select.Option value="">Loại nhà cung cấp</Select.Option>
              {listSupplierType?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="contact">
            <Input style={{ width: 200 }} placeholder="Tên/SDT người liên hệ" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Tooltip overlay="Lưu bộ lọc" placement="top">
              <Button icon={<StarOutlined />} />
            </Tooltip>
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
      >
        <Form
          form={formAdvance}
          onFinish={onFinish}
          //ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Item name="pic" label="Tên / Mã người phục trách">
            <Input placeholder="Tên/Mã người phụ trách" />
          </Item>
          <Row gutter={50}>
            <Col span={12}>
              <Item name="status" label="Trạng thái">
                <Select className="selector">
                  <Option value="">Chọn trạng thái</Option>
                  {supplierStatus?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={12}>
              <Item name="scorecard" label="Phân cấp NCC">
                <Select className="selector">
                  <Option value="">Chọn phân cấp</Option>
                  {scorecard?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>

          <Item label="Tỉnh/ Thành phố" name="district_id">
            <Select
              showSearch
              className="selector"
              placeholder="Chọn khu vực"
              optionFilterProp="children"
            >
              <Option value="">Chọn khu vực</Option>
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
          <Item name="note" label="Ghi chú">
            <Input placeholder="Ghi chú" />
          </Item>
        </Form>
      </BaseFilter>
    </div>
  );
};

export default SupplierFilter;
