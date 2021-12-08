import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form } from "antd";

import { VietNamId } from "utils/Constants";
import CustomSelect from "component/custom/select.custom";
import { ProvinceModel } from "model/content/district.model";
import {
  CityByCountryAction,
  DistrictByCityAction,
  WardGetByDistrictAction
} from "domain/actions/content/content.action";


type SelectAreaFilterProps = {
  formCustomerFilter: any;
  setProvincesListProps: any;
  setDistrictsListProps: any;
  setWardsListProps: any;
};

let tempWardsList: any[] = [];
let wardsSelectedList: any[] = [];
let districtsSelectedList: any[] = [];
let provincesSelectedList: any[] = [];

const SelectAreaFilter: React.FC<SelectAreaFilterProps> = (
  props: SelectAreaFilterProps
) => {
  const {
    formCustomerFilter,
    setProvincesListProps,
    setDistrictsListProps,
    setWardsListProps
  } = props;

  const dispatch = useDispatch();
   
  const [provincesList, setProvincesList] = useState<ProvinceModel[]>([]);
  const [districtsList, setDistrictsList] = useState<any>([]);
  const [wardsList, setWardsList] = useState<any>([]);


  const getProvince = useCallback(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setProvincesList(response);
        setProvincesListProps(response);
      })
    );
  }, [dispatch, setProvincesListProps]);
  

  useEffect(() => {
    getProvince();
  }, [getProvince]);

  // handle select province
  const updateDistrictsList = (response: any) => {
    const newDistrictsList = [...districtsList].concat(response);
    setDistrictsList(newDistrictsList);
    setDistrictsListProps(newDistrictsList);
  };

  const getDistrictByProvince = (provinceId: any) => {
    dispatch(
      DistrictByCityAction(provinceId, (response) => {
        updateDistrictsList(response);
      })
    );
  };

  const handleSelectProvince = (provinceId: any) => {
    const province = provincesList?.find(item => item.id === provinceId);
    if (province) {
      const newProvincesSelectedList = [...provincesSelectedList];
      newProvincesSelectedList.push(province);
      provincesSelectedList = newProvincesSelectedList;
    }
    
    getDistrictByProvince(provinceId);
  }
  // end

  // handle deselect province
  const removeDistrictByProvinceId = (provinceId: number) => {
    const newDistrictsList = districtsList?.filter((item: any) => item.city_id !== provinceId);
    setDistrictsList(newDistrictsList);
    setDistrictsListProps(newDistrictsList);

    const districtsDeselectedList = districtsSelectedList?.filter((item: any) => item.city_id === provinceId);
    const newDistrictsSelectedList = districtsSelectedList?.filter((item: any) => item.city_id !== provinceId);
    districtsSelectedList = newDistrictsSelectedList;

    const districtsIdSelectedList: any[] = [];
    newDistrictsSelectedList?.forEach((district: any) => {
      districtsIdSelectedList.push(district.id);
    });
    formCustomerFilter.setFieldsValue({ district: districtsIdSelectedList });

    districtsDeselectedList?.forEach((district: any) => {
      removeWardsByDistrictId(district.id);
    });
  }

  const handleDeselectProvince = (provinceId: any) => {
    provincesSelectedList = provincesSelectedList?.filter((item: any) => item.id !== provinceId);
    removeDistrictByProvinceId(provinceId);
  }

  const handleClearProvince = () => {
    formCustomerFilter.setFieldsValue({ district: undefined, ward: undefined })
    setDistrictsList([]);
    setDistrictsListProps([]);
    setWardsList([]);
    setWardsListProps([]);
    tempWardsList = [];
    wardsSelectedList = [];
    districtsSelectedList = [];
    provincesSelectedList = [];
  }
  // end
  
  // handle select District
  const updateWardsList = (response: any) => {
    const newWardsList = [...wardsList].concat(response);
    setWardsList(newWardsList);
    setWardsListProps(newWardsList);
    tempWardsList = newWardsList;
  };

  const getWardByDistrict = (districtId: any) => {
    dispatch(
      WardGetByDistrictAction(districtId, (response) => {
        updateWardsList(response);
      })
    );
  };

  const handleSelectDistrict = (districtId: any) => {
    const district = districtsList?.find((item: any) => item.id === districtId);
    if (district) {
      const newDistrictSelected = [...districtsSelectedList];
      newDistrictSelected.push(district);
      districtsSelectedList = newDistrictSelected;
    }
    
    getWardByDistrict(districtId);
  }
  // end handle select District

  // handle deselect District
  const removeWardsByDistrictId = (districtId: number) => {
    const newWardsList = tempWardsList?.filter((item: any) => item.district_id !== districtId);
    setWardsList(newWardsList);
    setWardsListProps(newWardsList);
    tempWardsList = newWardsList;

    wardsSelectedList = wardsSelectedList?.filter((item: any) => item.district_id !== districtId);
    const wardIdSelectedList: any[] = [];
    wardsSelectedList?.forEach((ward: any) => {
      wardIdSelectedList.push(ward.id);
    });
    formCustomerFilter.setFieldsValue({ ward: wardIdSelectedList });
  }
  
  const handleDeselectDistrict = (districtId: any) => {
    districtsSelectedList = districtsSelectedList?.filter((item: any) => item.id !== districtId);
    removeWardsByDistrictId(districtId);
  }
  // end handle deselect District

  const handleClearDistrict = () => {
    formCustomerFilter.setFieldsValue({ ward: undefined })
    setWardsList([]);
    setWardsListProps([]);
    tempWardsList = [];
    wardsSelectedList = [];
    districtsSelectedList = [];
  }


  // handle select Ward
  const handleSelectWard = (wardId: any) => {
    const ward = wardsList?.find((item: any) => item.id === wardId);
    if (ward) {
      const newWardSelected = [...wardsSelectedList];
      newWardSelected.push(ward);
      wardsSelectedList = newWardSelected;
    }
  }

  const handleDeselectWard = (wardId: any) => {
    wardsSelectedList = wardsSelectedList?.filter((item: any) => item.id !== wardId);
  }
  // end

  return (
    <>
      <Form.Item
        name="city_ids"
        label={<b>Tỉnh/Thành phố</b>}
      >
        <CustomSelect
          mode="multiple"
          showArrow
          allowClear
          showSearch
          placeholder="Chọn Tỉnh/Thành phố"
          notFoundContent="Không tìm thấy Tỉnh/Thành phố"
          optionFilterProp="children"
          getPopupContainer={trigger => trigger.parentNode}
          maxTagCount='responsive'
          onSelect={handleSelectProvince}
          onClear={handleClearProvince}
          onDeselect={handleDeselectProvince}
        >
          {provincesList?.map((item: any) => (
            <CustomSelect.Option key={item.id} value={item.id}>
              {item.name}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
      </Form.Item>

      <Form.Item
        name="district_ids"
        label={<b>Quận/Huyện</b>}
      >
        <CustomSelect
          mode="multiple"
          showArrow
          allowClear
          showSearch
          placeholder="Chọn Quận/Huyện"
          notFoundContent="Không tìm thấy Quận/Huyện"
          optionFilterProp="children"
          getPopupContainer={trigger => trigger.parentNode}
          maxTagCount='responsive'
          onSelect={handleSelectDistrict}
          onClear={handleClearDistrict}
          onDeselect={handleDeselectDistrict}
        >
          {districtsList?.map((item: any) => (
            <CustomSelect.Option key={item.id} value={item.id}>
              {item.name}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
      </Form.Item>
      
      <Form.Item
        name="ward_ids"
        label={<b>Phường/Xã</b>}
      >
        <CustomSelect
          mode="multiple"
          showArrow
          allowClear
          showSearch
          placeholder="Chọn Phường/Xã"
          notFoundContent="Không tìm thấy Phường/Xã"
          optionFilterProp="children"
          getPopupContainer={trigger => trigger.parentNode}
          maxTagCount='responsive'
          onSelect={handleSelectWard}
          onDeselect={handleDeselectWard}
        >
          {wardsList?.map((item: any) => (
            <CustomSelect.Option key={item.id} value={item.id}>
              {item.name}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
      </Form.Item>
    </>
  );
};

export default SelectAreaFilter;
