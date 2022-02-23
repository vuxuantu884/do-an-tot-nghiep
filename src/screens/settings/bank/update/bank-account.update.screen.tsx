import { Card, Checkbox, Col, Form, FormInstance, Input, Row, Select } from "antd";
import ContentContainer from "component/container/content.container";
import TreeStore from "component/tree-node/tree-store";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { getBankAction, getIdBankAccountAction, putBankAccountAction } from "domain/actions/bank/bank.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { BankAccountRequest, BankAccountResponse } from "model/bank/bank.model";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AddBankAccountBottombar from "../component/add-bank-account-bottombar";

const BackAccountUpdateScreen: React.FC = () => {
    const { id } = useParams<any>();
    let BankAccountId = parseInt(id);
    console.log("id param", id);

    const userReducerAccount = useSelector((state: RootReducerType) => state.userReducer.account);

    const formRef = React.createRef<FormInstance>();
    const dispatch = useDispatch();
    const [listStore, setListStore] = useState<Array<StoreResponse>>();
    const [listBank, setListBank] = useState<any>([]);
    const [isDefault, setIsDefault] = useState<boolean>(false);
    const [bankAccount, setBankAccount] = useState<BankAccountResponse>();

    let [initialValues, setInitialValues] = useState<any>({
        id: 0,
        code: "",
        account_number: "",
        account_holder: "",
        bank_code: null,
        bank_name: "",
        stores: [],
        status: 1,
        default: isDefault
    });

    useEffect(() => {
        if (BankAccountId) {
            dispatch(getIdBankAccountAction(BankAccountId, (data: BankAccountResponse) => {
                if (data) {
                    setInitialValues({
                        id: data.id,
                        code: data.code,
                        account_number: data.account_number,
                        account_holder: data.account_holder,
                        bank_code: data.bank_code,
                        bank_name: data.bank_name,
                        stores: data.stores.map(p => p.id),
                        status: data.status === true ? 1 : data.status === false ? 2 : null,
                        default: data.default
                    });
                    setBankAccount(data);
                    setIsDefault(data.default)
                }
            }))
        }
    }, [BankAccountId, dispatch]);

    useEffect(() => {
        dispatch(
            StoreGetListAction((stores) => {
                setListStore(stores);
            })
        );

        dispatch(getBankAction(setListBank));
    }, [dispatch]);

    useEffect(() => {
        formRef.current?.resetFields()
        console.log("initialValues", initialValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues])

    const onOkPress = useCallback(() => {
        formRef.current?.submit();
    }, [formRef]);

    const onSubmitForm = useCallback((value) => {
        console.log("value", value);

        let bankIndex = listBank.findIndex((p: any) => p.value === value.bank_code);
        let bankName = bankIndex !== -1 ? listBank[bankIndex].name : "";

        let storeAccess = listStore?.filter((p) => value.stores.some((single: any) => single.toString() === p.id.toString()));
        console.log("storeAccess", storeAccess);

        let stores: any = [];

        storeAccess?.map((value) => stores.push({
            store_id: value.id,
            store_code: value.code,
            store_name: value.name
        }));

        console.log("stores", stores);

        let request: BankAccountRequest = {
            ...value,
            bank_name: bankName,
            stores: stores,
            status: value.status === 1 ? true : value.status === 2 ? false : null,
            default: isDefault,

            updated_date: moment().toDate(),
            updated_by: userReducerAccount?.user_name,
            updated_name: userReducerAccount?.full_name,

            created_name: bankAccount?.created_name,
            created_by: bankAccount?.created_by,
            // created_date: moment(bankAccount?.created_date, 'DD-MM-YYYY')
        }

        dispatch(putBankAccountAction(BankAccountId, request, (data: BankAccountResponse) => {
            if (data) window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.BANK_ACCOUNT}`;
        }));

        setInitialValues({ ...value });
    }, [BankAccountId, dispatch, listBank, listStore, userReducerAccount, isDefault, bankAccount]);

    return (
        <ContentContainer
            title="Sửa tài khoản ngân hàng"
            breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name: "Tài khoản ngân hàng",
                    path: UrlConfig.BANK_ACCOUNT
                },
                {
                    name: "Sửa tài khoản ngân hàng"
                }
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
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: "Vui lòng nhập số tài khoản",
                                //     },
                                // ]}
                                rules={[
                                    () => ({
                                      validator(_, value) {
                                        if (value.trim().length === 0)
                                          return Promise.reject(new Error("Vui lòng nhập số tài khoản"));
                                        if (value.length > 100)
                                          return Promise.reject(new Error("Số tài khoản không vượt quá 100 kí tự"));
                                        return Promise.resolve();
                                      }
                                    })
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
                                    () => ({
                                        validator(_, value) {
                                            if (value.trim().length === 0)
                                                return Promise.reject(new Error("Vui lòng nhập tên chủ tài khoản"));
                                            if (value.length > 250)
                                                return Promise.reject(new Error("Tên chủ tài khoản không vượt quá 250 kí tự"));
                                            return Promise.resolve();
                                        }
                                    })
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
                                    {listBank.map((value: any, key: number) => (
                                        <Select.Option key={key} value={value.value}>{value.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col md={12}>
                            <Form.Item
                                label="Cửa hàng áp dụng"
                                name="stores"
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
                                    placeholder="Chọn trạng thái"

                                >
                                    <Select.Option key={1} value={1}>Áp dụng</Select.Option>
                                    <Select.Option key={2} value={2}>Ngưng áp dụng</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col md={12}>
                            <Form.Item
                                name="default"
                            >
                                <Checkbox onClick={(e: any) => {
                                    e.stopPropagation();
                                    console.log(e.target.checked);
                                    setIsDefault(e.target.checked);
                                }} checked={isDefault} value={isDefault}>Mặc định</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <AddBankAccountBottombar onOkPress={onOkPress} />
        </ContentContainer>
    )
}

export default BackAccountUpdateScreen;