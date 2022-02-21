import { Card, Checkbox, Col, Form, Input, Row, Select,FormInstance } from "antd";
import ContentContainer from "component/container/content.container";
import TreeStore from "component/tree-node/tree-store";
import UrlConfig from "config/url.config";
import { getBankAction, postBankAccountAction } from "domain/actions/bank/bank.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AddBankAccountBottombar from "../component/add-bank-account-bottombar";
import {BankAccountRequest, BankAccountResponse} from 'model/bank/bank.model'
import { showSuccess } from "utils/ToastUtils";

const BankAccountCreateScreen: React.FC = () => {

  const initialValues = {
    account_number: "",
    account_holder: "",
    bank_code: null,
    bank_name: "",
    store: [],
    status: "true",
    default: false
  }

  const formRef = React.createRef<FormInstance>();
  const dispatch = useDispatch();
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [listBank,setListBank]= useState<any>([]);

  useEffect(() => {
    dispatch(
      StoreGetListAction((stores) => {
        setListStore(stores);
      })
    );

    dispatch(getBankAction(setListBank));
  }, [dispatch]);

  const onSubmitForm = useCallback((value: any) => {
    console.log("value",value);
    let bankIndex=listBank.findIndex((p:any)=>p.value===value.bank_code);
    let bankName=bankIndex!==-1?listBank[bankIndex].name:"";

    let storeAccess=listStore?.filter((p)=>value.store.some((single:any)=>single.toString()===p.id.toString()));
    console.log("storeAccess",storeAccess);
    
    let stores:any=[];

    storeAccess?.map((value)=>stores.push({
      store_id:value.id,
      store_code:value.code,
      store_name:value.name
    }));
    
    console.log("stores",stores);
    
    let request:BankAccountRequest={
      ...value,
      bank_name:bankName,
      stores:stores
    }

    dispatch(postBankAccountAction(request,(data:BankAccountResponse)=>{
      if(data)showSuccess("Thêm tài khoản ngân hàng thành công");
    }));
    
  }, [dispatch, listBank, listStore])

  const onOkPress = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);

  return (
    <ContentContainer
      title="Thêm tài khoản ngân hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Tài khoản ngân hàng",
        },
        {
          name: "Thêm tài khoản ngân hàng",
        },
      ]}
    >
      <Card>
        <Form
          layout="vertical"
          initialValues={initialValues}
          onFinish={onSubmitForm}
          ref={formRef}
        >
          <Row gutter={24}>
            <Col md={12}>
              <Form.Item
                label="Số tài khoản"
                name="account_number"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số tài khoản",
                  },
                ]}
              >
                <Input placeholder="Nhập số tài khoản" />
              </Form.Item>
            </Col>

            <Col md={12}>
              <Form.Item
                label="Chủ tài khoản"
                name="account_holder"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên chủ tài khoản",
                  },
                ]}
              >
                <Input placeholder="Nhập tên chủ tài khoản" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col md={12}>
              <Form.Item
                label="Ngân hàng"
                name="bank_code"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngân hàng",
                  },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn ngân hàng"

                >
                  {listBank.map((value:any, key:number)=>(
                    <Select.Option key={key} value={value.value}>{value.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col md={12}>
              <Form.Item
                label="Cửa hàng áp dụng"
                name="store"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng áp dụng",
                  },
                ]}
              >
                <TreeStore listStore={listStore} placeholder="Chọn cửa hàng áp dụng" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24} style={{ alignItems: "end" }}>
            <Col md={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
              >
                <Select
                  placeholder="Chọn ngân hàng"

                >
                  <Select.Option key={"true"} value={"true"}>active</Select.Option>
                  <Select.Option key={"false"} value={"false"}>isactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col md={12}>
              <Form.Item
                name="default"
              >
                <Checkbox onClick={e => e.stopPropagation()}>Mặc định</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <AddBankAccountBottombar onOkPress={onOkPress} />
    </ContentContainer>
  )
}

export default BankAccountCreateScreen;