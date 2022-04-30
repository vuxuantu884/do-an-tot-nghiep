import { Input, Form, Select } from "antd";
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {useDispatch} from "react-redux";

import {WardResponse} from "model/content/ward.model";

import {
  WardGetByDistrictAction
} from "domain/actions/content/content.action";

import "screens/yd-page/yd-page-customer/customer.scss";
import {StyledCustomerAreaInfo} from "screens/yd-page/StyledYDpageAdmin";
import {findWard, handleDelayActionWhenInsertTextInSearchInput, handleFindArea} from "utils/AppUtils";

const { Option } = Select;

const YDpageCustomerAreaInfo = (props: any) => {
  const {
    form,
    formRef,
    areaList,
    customer,
    isDisable,
    newCustomerInfo,
    setNewCustomerInfo,
		updateNewCustomerInfo,
  } = props;

  const dispatch = useDispatch();

  const [wardList, setWardList] = React.useState<Array<WardResponse>>([]);
  const [loadingWardList, setLoadingWardList] = React.useState<boolean>(false);
  const [districtId, setDistrictId] = React.useState<any>(null);

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
      value.city_id = area?.city_id;
      value.district_id = districtIdValue;
      value.ward_id = null;
      form.setFieldsValue(value);

			const tempNewCustomerInfo = {...newCustomerInfo};
			tempNewCustomerInfo["city_id"] = area?.city_id;
			tempNewCustomerInfo["district_id"] = districtIdValue;
			tempNewCustomerInfo["ward_id"] = null;
			setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
    }
  };

  const handleClearArea = () => {
    setDistrictId(null);
    let value = form.getFieldsValue();
    value.city_id = null;
    value.district_id = null;
    value.ward_id = null;
    form.setFieldsValue(value);

		const tempNewCustomerInfo = {...newCustomerInfo};
		tempNewCustomerInfo["city_id"] = null;
		tempNewCustomerInfo["district_id"] = null;
		tempNewCustomerInfo["ward_id"] = null;
		setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
  };

  const handleClearWard = () => {
    let value = form.getFieldsValue();
    value.ward_id = null;
    value.ward = "";
    form.setFieldsValue(value);

		const tempNewCustomerInfo = {...newCustomerInfo};
		tempNewCustomerInfo["ward_id"] = null;
		setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
  };

  const handleBlurAddress = (value: any) => {
    form.setFieldsValue({ "full_address": value.trim() })

    const formValues = formRef.current?.getFieldsValue();
    const tempNewCustomerInfo = {
      ...newCustomerInfo,
      ...formValues,
      full_address: value.trim(),
    };
    setNewCustomerInfo(tempNewCustomerInfo);
  }

  useEffect(() => {
    if (districtId) {
      setLoadingWardList(true);
      dispatch(WardGetByDistrictAction(Number(districtId), (wardResponse) => {
        setWardList(wardResponse);
        setLoadingWardList(false);
      }));
    } else {
      setWardList([]);
    }
  }, [dispatch, districtId]);

  // handle autofill address
  const fullAddressRef = useRef()
  const newAreas = useMemo(() => {
    return areaList.map((area: any) => {
      return {
        ...area,
        city_name_normalize: area.city_name.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace("tinh ", "")
          .replace("tp. ", ""),
        district_name_normalize: area.name.normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .toLowerCase()
          .replace("quan ", "")
          .replace("huyen ", "")
          // .replace("thanh pho ", "")
          .replace("thi xa ", ""),
      }
    })
  }, [areaList]);

  const getWards = useCallback(
    (value: number) => {
      if (value) {
        dispatch(WardGetByDistrictAction(value, (data) => {
          const value = formRef.current?.getFieldValue("full_address");
          if (value) {
            const newValue = value.toLowerCase().replace("tỉnh ", "").normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/Đ/g, "D")

            const newWards = data.map((ward: any) => {
              return {
                ...ward,
                ward_name_normalize: ward.name.normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/đ/g, "d")
                  .replace(/Đ/g, "D")
                  .toLowerCase()
                  .replace("phuong ", "")
                  .replace("xa ", ""),
              }
            });
            let district = document.getElementsByClassName("YDpageCustomerInputDistrictCreateCustomer")[0].textContent?.replace("Vui lòng chọn khu vực", "") || "";
            const foundWard = findWard(district, newWards, newValue);
            formRef.current?.setFieldsValue({
              ward_id: foundWard ? foundWard.id : null,
            })

            // updateNewCustomerInfo("ward_id", foundWard ? foundWard.id : null,);
          }
          setWardList(data);
        }));
      }
    },
    [dispatch, formRef]
  );

  const checkAddress = useCallback((value) => {
    const findArea = handleFindArea(value, newAreas);
    if (findArea) {
      if (formRef.current?.getFieldValue("district_id") !== findArea.id) {
        formRef.current?.setFieldsValue({
          city_id: findArea.city_id,
          district_id: findArea.id,
          ward_id: null
        })
        getWards(findArea.id);
      }
    }
  }, [formRef, getWards, newAreas]);
  // end handle autofill address

  return(
    <StyledCustomerAreaInfo>
      <div className="customer-area-info">
        <Form.Item label="city" name="city_id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="district_id"
          className="YDpageCustomerInputDistrictCreateCustomer"
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
            disabled={isDisable || loadingWardList}
            allowClear
            loading={loadingWardList}
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
        >
          <Input
            maxLength={500}
            placeholder={"Địa chỉ"}
            allowClear
            onBlur={(value) => handleBlurAddress(value.target.value)}
            disabled={isDisable}
            onChange={(e) => handleDelayActionWhenInsertTextInSearchInput(fullAddressRef, () => {
              checkAddress(e.target.value)
            },500)}
          />
        </Form.Item>
      </div>
    </StyledCustomerAreaInfo>
  );
}

export default YDpageCustomerAreaInfo