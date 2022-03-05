import { Input, Form, Select } from "antd";
import React, { useEffect } from "react";
import {useDispatch} from "react-redux";

import {WardResponse} from "model/content/ward.model";

import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction
} from "domain/actions/content/content.action";
import { VietNamId } from "utils/Constants";

import "screens/yd-page/yd-page-customer/customer.scss";
import {StyledCustomerAreaInfo} from "screens/yd-page/StyledYDpageAdmin";

const { Option } = Select;

const YDpageCustomerAreaInfo = (props: any) => {
  const {
    form,
    customer,
    setCityId,
    isDisable,
    newCustomerInfo,
    setNewCustomerInfo,
		updateNewCustomerInfo,
  } = props;

  const dispatch = useDispatch();

  const [areaList, setAreaList] = React.useState<Array<any>>([]);
  const [wardList, setWardList] = React.useState<Array<WardResponse>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  
  useEffect(() => {
    dispatch(DistrictGetByCountryAction(VietNamId, setAreaList));
    return () => {
      setAreaList([]);
    }
  }, [dispatch]);

  useEffect(() => {
    if (customer?.district_id) {
      setDistrictId(customer.district_id);
    }
  }, [customer?.district_id, dispatch]);

  const onSelectWard = (wardId: number) => {
    updateNewCustomerInfo("ward_id", wardId);
  };

  const handleChangeArea = (districtIdValue: string) => {
    if (districtIdValue) {
      setDistrictId(districtIdValue);
      let area = areaList.find((item: any) => item.id === districtIdValue);
      let value = form.getFieldsValue();
      value.district_id = districtIdValue;
      value.ward_id = null;
      value.full_address = "";
      form.setFieldsValue(value);

      setCityId(area?.city_id);
			const tempNewCustomerInfo = {...newCustomerInfo};
			tempNewCustomerInfo["city_id"] = area?.city_id;
			tempNewCustomerInfo["district_id"] = districtIdValue;
			tempNewCustomerInfo["ward_id"] = null;
			tempNewCustomerInfo["full_address"] = "";
			setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
    }
  };

  const handleClearArea = () => {
    setDistrictId(null);
    let value = form.getFieldsValue();
    value.district_id = null;
    value.ward_id = null;
    value.full_address = "";
    form.setFieldsValue(value);

    setCityId(null);
		const tempNewCustomerInfo = {...newCustomerInfo};
		tempNewCustomerInfo["city_id"] = null;
		tempNewCustomerInfo["district_id"] = null;
		tempNewCustomerInfo["ward_id"] = null;
		tempNewCustomerInfo["full_address"] = "";
		setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
  };

  const handleClearWard = () => {
    let value = form.getFieldsValue();
    value.ward_id = null;
    value.ward = "";
    value.full_address = "";
    form.setFieldsValue(value);

		const tempNewCustomerInfo = {...newCustomerInfo};
		tempNewCustomerInfo["ward_id"] = null;
		tempNewCustomerInfo["full_address"] = "";
		setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
  };

  const handleBlurAddress = (value: any) => {
    updateNewCustomerInfo("full_address", value.trim());
    form.setFieldsValue({ "full_address": value.trim() })
  }

  useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWardList));
    } else {
      setWardList([]);
    }
  }, [dispatch, districtId]);

  return(
    <StyledCustomerAreaInfo>
      <div className="customer-area-info">
        <Form.Item
          name="district_id"
        >
          <Select
            showSearch
            disabled={isDisable}
            placeholder="Khu vực"
            onChange={handleChangeArea}
            onClear={handleClearArea}
            allowClear
            optionFilterProp="children"
          >
            {areaList.map((area: any) => (
              <Option key={area.id} value={area.id}>
                {area.city_name + ` - ${area.name}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="ward_id"
        >
          <Select
            showSearch
            disabled={isDisable}
            allowClear
            optionFilterProp="children"
            placeholder="Phường/xã"
            onClear={handleClearWard}
            onChange={onSelectWard}
          >
            {wardList.map((ward: any) => (
              <Option key={ward.id} value={ward.id}>
                {ward.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="full_address"
          rules={[{ required: false, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input
            maxLength={500}
            placeholder={"Địa chỉ"}
            onBlur={(value) => handleBlurAddress(value.target.value)}
            disabled={isDisable}
          />
        </Form.Item>
      </div>
    </StyledCustomerAreaInfo>
  );
}

export default YDpageCustomerAreaInfo