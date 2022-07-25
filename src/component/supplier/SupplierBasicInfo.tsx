import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Form, Input, Radio, Row, Select, Space, Switch, FormInstance } from "antd";
import { initialSupplierForm } from "../../screens/products/supplier/add/supplier-add.config";
import {
  ComponentType,
  FormFieldItem,
  FormFields,
  IFormControl,
} from "../../screens/products/supplier/add/supplier-add.type";
import { RadioChangeEvent } from "antd/lib/radio/interface";
import { SupplierResponse } from "../../model/core/supplier.model";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import { CollectionQuery, CollectionResponse } from "../../model/product/collection.model";
import { PageResponse } from "../../model/base/base-metadata.response";
import { getCollectionRequestAction } from "../../domain/actions/product/collection.action";
import { useParams } from "react-router-dom";
import { SupplierSearchAction } from "../../domain/actions/core/supplier.action";
import { validatePhoneSupplier } from "../../utils/supplier";
import BaseSelectMerchans from "../base/BaseSelect/BaseSelectMerchans";
import {useFetchMerchans} from "../../hook/useFetchMerchans";
import BaseSelectPaging from "../base/BaseSelect/BaseSelectPaging";
import BaseSelect from "../base/BaseSelect/BaseSelect";

const { Item } = Form;
const { Option } = Select;

const SupplierBasicInfo = ({
  form,
  formFields,
}: {
  form: FormInstance;
  formFields: FormFieldItem;
}) => {
  const dispatch = useDispatch();
  const params: CollectionQuery = useParams() as CollectionQuery;

  const [supplierType, setSupplierType] = useState(initialSupplierForm.type);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [isSearchingGroupProducts, setIsSearchingGroupProducts] = React.useState(false);
  const [isActiveStatus, setIsActiveStatus] = useState(initialSupplierForm.status === "active");
  const {fetchMerchans, merchans, isLoadingMerchans} = useFetchMerchans()

  const [data, setData] = useState<PageResponse<CollectionResponse>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const supplier_types = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  const scorecards = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.scorecard
  );
  const supplier_status = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_status
  );

  useEffect(() => {
    dispatch(getCollectionRequestAction({ ...params, limit: data.metadata.limit }, onGetSuccess));
    dispatch(
      SupplierSearchAction({ limit: 200 }, (response: PageResponse<SupplierResponse>) => {
        if (response) {
          setListSupplier(response?.items || []);
        }
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  }, [params]);

  const statusValue = useMemo(() => {
    if (!supplier_status) return;
    let findStatus = supplier_status.find(
      (item) => item.value === (isActiveStatus ? "active" : "inactive")
    );
    return findStatus?.name;
  }, [isActiveStatus, supplier_status]);

  const onGetSuccess = (results: PageResponse<CollectionResponse>) => {
    if (results && results.items) {
      setData(results);
      setIsSearchingGroupProducts(false);
    }
  };

  const onSearchGroupProducts = (values: any) => {
    setIsSearchingGroupProducts(true);
    dispatch(
      getCollectionRequestAction({ ...params, ...values, limit: data.metadata.limit }, onGetSuccess)
    );
  };

  const onChangeSupplierType = (e: RadioChangeEvent) => {
    setSupplierType(e.target.value);
  };

  const onChangeStatus = (checked: boolean) => {
    setIsActiveStatus(checked);
    form.setFieldsValue({
      status: checked ? "active" : "inactive",
    });
  };

  const validatePhone = (_: any, value: any, callback: any): void => {
    validatePhoneSupplier({
      value,
      callback,
      phoneList: listSupplier,
    });
  };

  const onChangeInput = (value: string, propName: string): string => {
    const fields = form.getFieldsValue()
    let { contacts,name } = fields;
    
    if (propName === FormFields.name) {
      contacts[0][FormFields.name] = value.toUpperCase();
      name = value.toUpperCase();
      // Object.assign(contacts[0], { [FormFields.name]: value })
    } else if (propName === FormFields.phone) {
      // Object.assign(contacts[0], { [FormFields.phone]: value })
      contacts[0][FormFields.phone] = value
    }
    form.setFieldsValue({
      contacts,
      name
    })
    return value
  }

  const renderSelectOptions = ({ placeholder, ...rest }: Partial<IFormControl>) => {
    return (
      <BaseSelect
        placeholder={placeholder}
        data={scorecards}
        renderItem={(item) => (
          <Option key={item.name} value={item.value}>
            {item.name}
          </Option>
        )}
      />
    );
  };

  const controlInfoRenderer: any = (control: IFormControl) => {
    const { name, label, placeholder, rules = [], disabled } = control;
    const renderers: any = {
      [ComponentType.Radio]: (
        <Item {...{ name, label, rules }}>
          <Radio.Group onChange={onChangeSupplierType}>
            {supplier_types?.map((item) => (
              <Radio value={item.value} key={item.value}>
                {item.name}
              </Radio>
            ))}
          </Radio.Group>
        </Item>
      ),
      [ComponentType.Input]: (
        <Item
          {...{ name, label }}
          rules={rules.map((rule: any) => {
            if (name === FormFields.phone) {
              if (!rule?.message) {
                return { validator: validatePhone };
              }
              return rule;
            }

            if (name === FormFields.tax_code) {
              if (!rule.pattern) {
                return { ...rule, required: supplierType === "enterprise" };
              }
              return rule;
            }
            return rule;
          })}>
          <Input {...{ placeholder, disabled }} onChange={(e) => onChangeInput(e.target.value, name)} />
        </Item>
      ),
      [ComponentType.Select]: (
        <Item {...{ name, label, rules }}>{renderSelectOptions(control)}</Item>
      ),
      [ComponentType.SelectPaging]: (
        <>
          {name === FormFields.pic_code ? (
            <Item {...{ name, label, rules }}>
              {/*Chọn merchandiser*/}
              <BaseSelectMerchans
                merchans={merchans}
                fetchMerchans={fetchMerchans}
                isLoadingMerchans={isLoadingMerchans}
              />
            </Item>
          ) : (
            <Item {...{ name, label, rules }}>
              {/*Chọn nhóm hàng*/}
              <BaseSelectPaging
                metadata={data.metadata}
                fetchData={onSearchGroupProducts}
                data={data.items}
                renderItem={(item) => (
                  <Option value={item.id} key={item.id}>
                    {item.name}
                  </Option>
                )}
                placeholder={placeholder}
                loading={isSearchingGroupProducts}
              />
            </Item>
          )}
        </>
      ),
    };
    return (
      <Col span={12} key={control.name} hidden={control.hidden}>
        {renderers[control.componentType]}
      </Col>
    );
  };

  return (
    <>
      <Card
        title={formFields.title}
        extra={
          formFields.extra && (
            <Space size={15}>
              <label className="text-default">Trạng thái</label>
              <Switch
                onChange={onChangeStatus}
                className="ant-switch-success"
                checked={isActiveStatus}
              />
              <label className={isActiveStatus ? "text-success" : "text-error"}>
                {statusValue}
              </label>
              <Item noStyle name="status" hidden>
                <Input />
              </Item>
            </Space>
          )
        }>
        {formFields.formGroups.map((group, index) => (
          <Row gutter={50} key={index}>
            {group.map(controlInfoRenderer)}
          </Row>
        ))}
      </Card>
    </>
  );
};

export default SupplierBasicInfo;
