import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select } from "antd";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import { OrderSearchQuery } from "model/order/order.model";
import queryString from "query-string";
import React, { useCallback, useEffect, useMemo } from "react";
import { replaceFormatString } from "utils/AppUtils";
import { WARRANTY_REASON_STATUS } from "utils/Warranty.constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  actions: Array<MenuAction>;
  isLoading?: boolean;
  location: any,
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
};

function WarrantyReasonFilter(props: PropTypes): JSX.Element {
  const { actions, onMenuClick, onFilter, onShowColumnSetting, isLoading, location} = props;

  const queryParamsParsed: any = queryString.parse(location.search);

  const loadingFilter = useMemo(() => { 
    return !!isLoading;
  }, [isLoading]);

  const [formSearch] = Form.useForm();

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const initialValues = useMemo(() => {
    return {
      ...queryParamsParsed,
      ids: Array.isArray(queryParamsParsed.ids) ? queryParamsParsed.ids.map((i:any) => Number(i)) : (queryParamsParsed.ids),
      name: queryParamsParsed.name || undefined,
      status: queryParamsParsed.status || undefined,
    };
  }, [queryParamsParsed]);

  const onFinish = useCallback(
    (values) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  useEffect(() => {
    formSearch.setFieldsValue(initialValues)
  }, [formSearch, initialValues])

  return (
    <StyledComponent>
      <div className="warranty-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form form={formSearch} initialValues={initialValues} layout="inline" onFinish={onFinish}>
            <div style={{ width: "100%" }}>
              <Row>
                <Col span={8}>
                  <Form.Item name="ids">
                    <NumberInput
                      format={(a: string) => {
                        if (a) {
                          return a;
                        } else {
                          return "";
                        }
                      }}
                      replace={(a: string) => replaceFormatString(a)}
                      placeholder="ID"
                      maxLength={14}
                      minLength={0}
                      style={{
                        textAlign: "left",
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="name">
                    <Input type="text" placeholder="Tên" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="status">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Trạng thái"
                      notFoundContent="Không tìm thấy kết quả">
                      {WARRANTY_REASON_STATUS.map((item, index) => (
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

export default WarrantyReasonFilter;
