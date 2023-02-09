import { Col, Form, Row, Tag } from "antd";
import styled from "styled-components";
import { createRef } from "react";

import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import BaseFilter from "component/filter/base.filter";
import SupplierSearchSelect from "component/filter/component/supplier-select";
import { useFetchMerchans } from "hook/useFetchMerchans";
import { PurchaseOrderReturnQuery } from "model/purchase-order/purchase-order.model";
import {
  filterPOReturnFieldsMapping,
  POReturnFilterField,
} from "screens/purchase-order/tab/PurchaseOrderReturn/helper";
import { FormInstance } from "antd/es/form/Form";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";

interface IProps {
  onFilter?: (value: PurchaseOrderReturnQuery) => void;
  onCancel?: () => void;
  visible: boolean;
  onSaveFilter?: () => void;
  params: PurchaseOrderReturnQuery;
}

const { Item } = Form;

const tagRender = (props: any) => {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose}>
      {label}
    </Tag>
  );
};

export const FilterAdvanced = (props: IProps) => {
  const { onFilter, onCancel, visible, onSaveFilter, params } = props;

  const [formAdvanceFilter] = Form.useForm<PurchaseOrderReturnQuery>();
  const { merchans, fetchMerchans, isLoadingMerchans } = useFetchMerchans();
  const formRef = createRef<FormInstance>();

  const onSave = () => {
    onFilter && onFilter(formAdvanceFilter.getFieldsValue());
    onCancel && onCancel();
  };
  const onClear = () => {
    formAdvanceFilter.resetFields();
    onFilter && onFilter(formAdvanceFilter.getFieldsValue());
    onCancel && onCancel();
  };

  return (
    <BaseFilter
      onClearFilter={onClear}
      onFilter={onSave}
      onCancel={onCancel}
      visible={visible}
      width={700}
      onSaveFilter={onSaveFilter}
      allowSave={false}
    >
      <Form form={formAdvanceFilter} ref={formRef}>
        <Row gutter={12}>
          <Col span={12}>
            <SupplierSearchSelect
              label={filterPOReturnFieldsMapping[POReturnFilterField.supplier_ids]}
              name={POReturnFilterField.supplier_ids}
              mode="multiple"
              help={false}
              maxTagCount="responsive"
              supplier_ids={params.supplier_ids}
            />
          </Col>
          <Col span={12}>
            <StyledItemForm
              name={POReturnFilterField.merchandisers}
              label="Merchandiser"
              colon={false}
            >
              <BaseSelectMerchans
                mode={"tags"}
                tagRender={tagRender}
                merchans={merchans}
                fetchMerchans={fetchMerchans}
                isLoadingMerchans={isLoadingMerchans}
              />
            </StyledItemForm>
          </Col>
          <Col span={12}>
            <StyledItemForm
              name={POReturnFilterField.created_bys}
              label={filterPOReturnFieldsMapping[POReturnFilterField.created_bys]}
              colon={false}
            >
              <BaseSelectMerchans
                mode={"tags"}
                tagRender={tagRender}
                merchans={merchans}
                fetchMerchans={fetchMerchans}
                isLoadingMerchans={isLoadingMerchans}
                placeholder={"Chọn người tạo phiếu"}
              />
            </StyledItemForm>
          </Col>
          <Col span={12}>
            <StyledItemForm label="Ngày tạo" colon={false}>
              <CustomFilterDatePicker
                fieldNameFrom={POReturnFilterField.created_date_from}
                fieldNameTo={POReturnFilterField.created_date_to}
                setActiveButton={() => {}}
                activeButton=""
                formRef={formRef}
              />
            </StyledItemForm>
          </Col>
        </Row>
      </Form>
    </BaseFilter>
  );
};

const StyledItemForm = styled(Item)`
  display: initial;
  .ant-form-item-label {
    margin-bottom: 8px;
  }
`;
