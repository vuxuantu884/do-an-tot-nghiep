import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Form, Input, Radio, Row, Select, Space, Switch, FormInstance } from "antd";
import { initialSupplierForm } from "../../screens/products/supplier/add/supplier-add.config";
import {
  ComponentType,
  FormFieldItem,
  FormFields,
  IFormControl,
} from "../../screens/products/supplier/add/supplier-add.type";
import AccountSearchPaging from "../custom/select-search/account-select-paging";
import SelectSearchPaging from "../custom/select-search/select-search-paging";
import { RadioChangeEvent } from "antd/lib/radio/interface";
import { RegUtil } from "../../utils/RegUtils";
import { SupplierResponse } from "../../model/core/supplier.model";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import { CollectionQuery, CollectionResponse } from "../../model/product/collection.model";
import { PageResponse } from "../../model/base/base-metadata.response";
import { getCollectionRequestAction } from "../../domain/actions/product/collection.action";
import { useParams } from "react-router-dom";
import { SupplierSearchAction } from "../../domain/actions/core/supplier.action";

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
  const [status, setStatus] = useState<string>(initialSupplierForm.status);

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
    let findStatus = supplier_status.find((item) => item.value === status);
    return findStatus?.name;
  }, [status, supplier_status]);

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
    setStatus(checked ? "active" : "inactive");
    form.setFieldsValue({
      status: checked ? "active" : "inactive",
    });
  };

  const validatePhone = (rule: any, value: any, callback: any): void => {
    if (value) {
      if (!RegUtil.PHONE.test(value)) {
        callback(`Số điện thoại không đúng định dạng`);
      } else {
        listSupplier.forEach((supplier: SupplierResponse) => {
          if (supplier?.phone === value) {
            callback(`Số điện thoại đã tồn tại`);
          }
        });
        callback();
      }
    } else {
      callback();
    }
  };

  const renderSelectOptions = ({ placeholder, ...rest }: Partial<IFormControl>) => {
    return (
      <Select allowClear placeholder={placeholder}>
        {scorecards?.map((item) => (
          <Option key={item.name} value={item.value || 0}>
            {item.name}
          </Option>
        ))}
      </Select>
    );
  };

  const renderGroupProductItem = (item: CollectionResponse) => {
    return (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
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
          <Input {...{ placeholder, disabled }} />
        </Item>
      ),
      [ComponentType.Select]: (
        <Item {...{ name, label, rules }}>{renderSelectOptions(control)}</Item>
      ),
      [ComponentType.SelectPaging]: (
        <>
          {name === FormFields.pic_code ? (
            <Item {...{ name, label, rules }}>
              <AccountSearchPaging placeholder="Chọn Merchandiser" />
            </Item>
          ) : (
            <Item {...{ name, label, rules }}>
              <SelectSearchPaging
                data={data.items}
                renderItem={renderGroupProductItem}
                onSearch={onSearchGroupProducts}
                isLoading={isSearchingGroupProducts}
                metadata={data.metadata}
                placeholder={placeholder}
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

  const renderExtra = () => {
    if (!formFields.extra) return;
    return (
      <Space size={15}>
        <label className="text-default">Trạng thái</label>
        <Switch
          onChange={onChangeStatus}
          className="ant-switch-success"
          checked={status === "active"}
        />
        <label className={status === "active" ? "text-success" : "text-error"}>{statusValue}</label>
        <Item noStyle name="status" hidden>
          <Input />
        </Item>
      </Space>
    );
  };

  return (
    <>
      <Card title={formFields.title} extra={renderExtra}>
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
