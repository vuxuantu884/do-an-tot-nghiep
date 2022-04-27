import { SettingOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import useGetCities from "hook/useGetCities";
import useGetDistricts from "hook/useGetDistricts";
import { OrderSearchQuery } from "model/order/order.model";
import { GetWarrantyCentersParamModel } from "model/warranty/warranty.model";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  params: GetWarrantyCentersParamModel | any;
  actions: Array<MenuAction>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
};

function WarrantyCenterFilter(props: PropTypes): JSX.Element {
  const { params, actions, onMenuClick, onFilter, onShowColumnSetting, isLoading } = props;

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  console.log('selectedCityId', selectedCityId)

  const cities = useGetCities();
  const districts = useGetDistricts(selectedCityId);

  console.log("params", params);
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
      ...params,
      ids: Array.isArray(params.ids) ? params.ids.map((i: string) => Number(i)) : params.ids,
      city_id: params.city_id ? +params.city_id : undefined,
      district_id: params.district_id ? +params.district_id : undefined,
    };
  }, [params]);

  const onFinish = useCallback(
    (values) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  useEffect(() => {
    formSearch.setFieldsValue(initialValues);
  }, [formSearch, initialValues]);

  useEffect(() => {
    if(initialValues.city_id) {
      setSelectedCityId(+initialValues.city_id);
    }
  }, [initialValues.city_id]);

  return (
    <StyledComponent>
      <div className="warranty-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form form={formSearch} initialValues={initialValues} layout="inline" onFinish={onFinish}>
            <div style={{ width: "100%" }}>
              <Row>
              <Col span={6}>
                  <Form.Item name="name">
                    <Input type="text" placeholder="Tên trung tâm" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="phone">
                    <Input type="number" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="city_id">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Chọn tỉnh/TP"
                      notFoundContent="Không tìm thấy tỉnh/TP"
                      onChange={(value) => {
                        setSelectedCityId(+value);
                        formSearch.setFieldsValue({
                          district_id: undefined
                        })
                      }}>
                      {cities.map((item, index) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </CustomSelect>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="district_id">
                    <CustomSelect
                      className="select-with-search"
                      showSearch
                      allowClear
                      style={{ width: "100%" }}
                      placeholder="Chọn quận/huyện"
                      notFoundContent="Không tìm thấy kết quả">
                      {districts.map((item, index) => (
                        <Select.Option key={index} value={item.id}>
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

export default WarrantyCenterFilter;
