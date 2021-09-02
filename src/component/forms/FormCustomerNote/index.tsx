import { Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import React from "react";
import * as CONSTANTS from "utils/Constants";
import { StyledComponent } from "./styles";
import { WardResponse } from "model/content/ward.model";
import { CountryResponse } from "model/content/country.model";
import { useDispatch } from "react-redux";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { RegUtil } from "utils/RegUtils";
import CustomInput from 'screens/customer/customInput';

const { Option } = Select;

type FormValueType = {
  content: string;
};

const FormCustomerShippingAddress: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const dispatch = useDispatch();
  const { modalAction, formItem, form, visible } = props;

  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [countryId] = React.useState<number>(233);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  // const DEFAULT_FORM_VALUE = {
  //   company_id: 1,
  //   company: "YODY",
  // };
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          content: formItem?.content,
        }
      : {
        content: "",
        };


  // const LIST_STATUS = bootstrapReducer.data?.order_main_status;


  React.useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  return (
    <StyledComponent>
      <Form
        form={form}
        name="form-order-processing-status"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Row gutter={20}>
          <Col span={24}>
            <CustomInput
                name="content"
                label="Ghi chú:"
                form={form}
                message="Vui lòng nhập ghi chú"
                placeholder="Nhập ghi chú"
                isRequired={true}
                maxLength={255}
              />
            
            </Col>
            </Row>
      </Form>
    </StyledComponent>
  );
};

export default FormCustomerShippingAddress;
