import React, { useEffect, useState } from "react";
import { Card, Col, Form, FormInstance, Input, Row, Select } from "antd";
import { initialSupplierForm } from "../../screens/products/supplier/add/supplier-add.config";
import {
  ComponentType,
  FormFieldItem,
  FormFields,
  IFormControl,
} from "../../screens/products/supplier/add/supplier-add.type";
import { CountryResponse } from "../../model/content/country.model";
import { DistrictResponse } from "../../model/content/district.model";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "../../domain/actions/content/content.action";
import { useDispatch } from "react-redux";
import BaseSelect from "../base/BaseSelect/BaseSelect";

const { Item } = Form;
const { Option } = Select;

const SupplierAddress = ({
  form,
  formFields,
}: {
  form: FormInstance;
  formFields: FormFieldItem;
}) => {
  const dispatch = useDispatch();
  const [countries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);

  useEffect(() => {
    dispatch(CountryGetAllAction(setCountries));
    dispatch(
      DistrictGetByCountryAction(initialSupplierForm.addresses[0].country_id || 0, setListDistrict)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, []);

  const onSelectDistrict = (name: number, value: number) => {
    let cityId = -1;
    listDistrict.forEach((item) => {
      if (item.id === value) {
        cityId = item.city_id;
      }
    });
    if (cityId !== -1) {
      let addresses = form.getFieldValue("addresses");
      addresses[name].city_id = cityId;
      form.setFieldsValue({
        addresses: [...addresses],
      });
    }
  };

  const controlAddressRenderer = (control: IFormControl, name: number) => {
    let data: CountryResponse[] | DistrictResponse[] | undefined = [];
    if (control.name === FormFields.country_id) {
      data = countries.map((item) => {
        return { ...item, value: item.id };
      });
    } else {
      data = listDistrict.map((item) => {
        return { ...item, value: item.id, name: `${item.city_name} - ${item.name}` };
      });
    }

    const renderers: any = {
      [ComponentType.Select]: (
        <Item rules={control.rules} label={control.label} name={[name, control.name]}>
          <BaseSelect
            data={data}
            renderItem={(item) => (
              <Option key={item.name} value={item.value || 0}>
                {item.name}
              </Option>
            )}
            placeholder={control.placeholder}
            onSelect={(value: number) =>
              control.name === FormFields.district_id && onSelectDistrict(name, value)
            }
          />
        </Item>
      ),
      [ComponentType.Input]: (
        <Item rules={control.rules} label={control.label} name={[name, control.name]}>
          <Input placeholder={control.placeholder} />
        </Item>
      ),
    };
    return (
      <Col span={control.fullWidth ? 24 : 12} key={control.name} hidden={control.hidden}>
        {renderers[control.componentType]}
      </Col>
    );
  };

  return (
    <>
      <Card title={formFields.title}>
        <Form.List name={formFields.key}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                <React.Fragment key={key}>
                  {formFields.formGroups.map((group, index) => (
                    <Row gutter={50} key={index}>
                      {group.map((control) => controlAddressRenderer(control, name))}
                    </Row>
                  ))}
                </React.Fragment>
              ))}
            </>
          )}
        </Form.List>
      </Card>
    </>
  );
};

export default SupplierAddress;
