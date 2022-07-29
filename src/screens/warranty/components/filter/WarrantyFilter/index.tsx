import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select } from "antd";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { OrderSearchQuery } from "model/order/order.model";
import { GetWarrantiesParamModel } from "model/warranty/warranty.model";
import React, { useCallback, useEffect, useMemo } from "react";
import { DATE_FORMAT } from "utils/DateUtils";
import { WARRANTY_TYPE } from "utils/Warranty.constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  stores: StoreResponse[];
  params: GetWarrantiesParamModel;
  actions: Array<MenuAction>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
};

function WarrantyFilter(props: PropTypes): JSX.Element {
  const { stores, params, actions, onMenuClick, onFilter, onShowColumnSetting, isLoading } = props;

  console.log("params", params);
  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);
  const [formSearch] = Form.useForm();
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const initialValues = useMemo(() => {
    return {
      ...params,
      ids: Array.isArray(params.ids) ? params.ids.map((i) => Number(i)) : params.ids,
      store_ids: Array.isArray(params.store_ids)
        ? params.store_ids.map((i) => Number(i))
        : Number(params.store_ids),
      type: params.type ? params.type : undefined,
    };
  }, [params]);

  console.log("initialValues", initialValues);

  const renderTabHeader = () => {};

  const onFinish = useCallback(
    (values) => {
      onFilter && onFilter(values);
    },
    [onFilter],
  );

  useEffect(() => {
    formSearch.setFieldsValue(initialValues);
  }, [formSearch, initialValues]);

  return (
    <StyledComponent>
      {renderTabHeader()}
      <div className="warranty-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form form={formSearch} initialValues={initialValues} layout="inline" onFinish={onFinish}>
            <div style={{ width: "100%" }}>
              <Row gutter={8}>
                <Col span={4}>
                  <Form.Item name="store_ids">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Chọn cửa hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      dropdownStyle={{ minWidth: 180 }}
                    >
                      {stores.map((item, index) => (
                        <Select.Option key={index} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </CustomSelect>
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item name="query">
                    <Input type="text" placeholder="ID phiếu bảo hành, tên, SĐT khách hàng" />
                  </Form.Item>
                </Col>
                <Col span={3} className="colSelectDate">
                  <Form.Item name="from_created_date">
                    <CustomDatePicker
                      placeholder="Ngày tiếp nhận"
                      format={DATE_FORMAT.DD_MM_YYYY}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3} className="colSelectDate">
                  <Form.Item name="to_created_date">
                    <CustomDatePicker
                      placeholder="Đến ngày"
                      format={DATE_FORMAT.DD_MM_YYYY}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3} className="colSelectDate">
                  <Form.Item name="from_appointment_date">
                    <CustomDatePicker
                      placeholder="Ngày hẹn trả"
                      format={DATE_FORMAT.DD_MM_YYYY}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3} className="colSelectDate">
                  <Form.Item name="to_appointment_date">
                    <CustomDatePicker
                      placeholder="Đến ngày"
                      format={DATE_FORMAT.DD_MM_YYYY}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3} className="colType">
                  <Form.Item name="type">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Loại"
                      notFoundContent="Không tìm thấy kết quả"
                      dropdownStyle={{ minWidth: 170 }}
                    >
                      {WARRANTY_TYPE.map((item, index) => (
                        <Select.Option key={index} value={item.code}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </CustomSelect>
                  </Form.Item>
                </Col>
              </Row>
            </div>
            <div className="buttonGroup">
              <Button type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
              <Button icon={<SettingOutlined />} onClick={onShowColumnSetting} />
            </div>
          </Form>
        </CustomFilter>
      </div>
    </StyledComponent>
  );
}

export default WarrantyFilter;
