import React, {useEffect, useState} from "react";
import {Form, Button, Card, Tag, Input, Select, DatePicker, Divider} from "antd";

import {
  CreateCustomer,
  CustomerGroups,
  UpdateCustomer,
} from "domain/actions/customer/customer.action";
import { useDispatch } from "react-redux";
import {showSuccess, showError} from "utils/ToastUtils";
import "screens/yd-page/yd-page-customer/customer.scss";
import moment from "moment";
import YDpageCustomerAreaInfo from "screens/yd-page/component/YDpageCustomerAreaInfo";
import phonePlus from "assets/icon/phone-plus.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import {RegUtil} from "utils/RegUtils";
import AddPhoneModal from "../AddPhoneModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {GENDER_OPTIONS} from "utils/Constants";
import { CustomerModel } from "model/request/customer.request";

const YDPageCustomerCreateUpdate = (props: any) => {
  const {
    allowCreateCustomer,
    allowUpdateCustomer,
    customer,
    newCustomerInfo,
    setNewCustomerInfo,
    getCustomerWhenPhoneChange,
    customerPhone,
    customerDefaultPhone,
    customerPhones,
    customerFbName,
    addFpPhone,
    deleteFpPhone,
    setFpDefaultPhone,
  } = props;

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [status] = useState<string>("active");
  const [cityId, setCityId] = useState<any>(null);

  // get customer group
  const [customerGroups, setCustomerGroups] = React.useState<Array<any>>([]);

  useEffect(() => {
    dispatch(CustomerGroups(setCustomerGroups));
    return () => {
      setCustomerGroups([]);
    }
  }, [dispatch]);
  // end get customer group

  // // Update new customer info
  const updateNewCustomerInfo = (fieldName: string, value: any) => {
    const tempNewCustomerInfo = {...newCustomerInfo};
    tempNewCustomerInfo[fieldName] = value;
    setNewCustomerInfo && setNewCustomerInfo(tempNewCustomerInfo);
  };

  useEffect(() => {
    if (customer) {
      const formValue = {
        full_name: customer.full_name,
        phone: customer.phone,
        birthday: customer.birthday ? moment(customer.birthday) : "",
        gender: customer.gender,
        card_number: customer.card_number,
        city_id: customer.city_id,
        district_id: customer.district_id,
        ward_id: customer.ward_id,
        full_address: customer.full_address
      };
      form.setFieldsValue(formValue);
    } else {
      const formValue = {
        full_name: customerFbName || null,
        phone: customerPhone || null,
        birthday: "",
        gender: null,
        card_number: null,
        city_id: null,
        district_id: null,
        ward_id: null,
        full_address: null
      };
      form.setFieldsValue(formValue);
    }
  }, [customer, customerFbName, customerPhone, form]);

  useEffect(() => {
    if (!customer) {
      const tempNewCustomerInfo = {...newCustomerInfo};
      tempNewCustomerInfo.full_name = customerFbName;
      tempNewCustomerInfo.phone = customerPhone;
      setNewCustomerInfo(tempNewCustomerInfo);
    }
    // eslint-disable-next-line
  }, [customer, customerFbName, customerPhone]);

	useEffect(() => {
		window.parent.postMessage({
			service: 'notes',
			action: 'list',
			params: {}
		}, '*');
	}, []);

  const handleBlurName = (value: any) => {
    updateNewCustomerInfo("full_name", value.trim());
    form.setFieldsValue({ "full_name": value.trim() });
  };

  // update customer phone
  const [visiblePhoneModal, setVisiblePhoneModal] = React.useState<boolean>(false);
  const [visibleDeletePhoneModal, setVisibleDeletePhoneModal] = useState<boolean>(false);

  const [doDeletePhone, setDoDeletePhone] = React.useState<() => void>(() => () => { });


  const showPhoneModal = () => {
    setVisiblePhoneModal(true);
  };

  const hidePhoneModal = () => {
    setVisiblePhoneModal(false);
  };

  const showConfirmDeletePhone = (phone: string) => {
    setVisibleDeletePhoneModal(true);
    setDoDeletePhone(() => () => {
      deleteFpPhone(phone);
      setVisibleDeletePhoneModal(false);
    });
  };

  const onSelectPhone = (phone: any) => {
    if (phone !== customerPhone) {
      updateNewCustomerInfo("phone", phone);
      form.setFieldsValue({ phone: phone });
      getCustomerWhenPhoneChange(phone);
    }
  };
  // end update customer phone

  // handle select gender
  const onSelectGender = (value: string,) => {
    updateNewCustomerInfo("gender", value);
  };

  // handle select birthday
  const onChangeBirthDay = (date: any) => {
    updateNewCustomerInfo("birthday", date);
  };

  const isDisableForm = () => {
    return (customer && !allowUpdateCustomer) || (!customer && !allowCreateCustomer);
  }

  // handle submit
  const setResultUpdate = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Sửa thông tin khách hàng thành công");
        getCustomerWhenPhoneChange(result.phone);
      }
    },
    [getCustomerWhenPhoneChange]
  );
  const setResultCreate = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Tạo khách hàng thành công");
        getCustomerWhenPhoneChange(result.phone);

      }
    },
    [getCustomerWhenPhoneChange]
  );
  const handleSubmitOption = (values: any) => {
    if (customer) {
      handleSubmitUpdate(values);
    } else {
      handleSubmitCreate(values);
    }
  };
  const handleSubmitCreate = (values: any) => {
    const customerCreateParams = {
      ...values,
      birthday: values.birthday ? new Date(values.birthday).toUTCString() : null,
      status: status,
      city_id: cityId,
    };
    dispatch(CreateCustomer({ ...new CustomerModel(), ...customerCreateParams }, setResultCreate));
  };
  const handleSubmitUpdate = (values: any) => {
    const customerUpdateParams = {
      ...values,
      birthday: values.birthday ? new Date(values.birthday).toUTCString() : null,
      status: status,
      city_id: cityId,
      version: customer.version,
    };
    dispatch(UpdateCustomer(customer?.id, customerUpdateParams, setResultUpdate));
  };

  const handleSubmitCreateUpdate = () => {
    const fieldValue = form.getFieldsValue(true);
    if (!fieldValue.full_name) {
      showError("Vui lòng nhập tên khách hàng");
      return ;
    }
    if (!fieldValue.phone) {
      showError("Vui lòng nhập số điện thoại khách hàng");
      return ;
    }
    form.submit();
  }
  // end handle submit

	// handle note
	const [notes, setNotes] = React.useState<any>([]);
	const [note, setNote] = React.useState<string>('');
	window.addEventListener('message', async (e) => {
		const { data } = e;
		const { service, res } = data;

		if (service === 'notes') {
			setNotes(res);
		}
	}, false);

	const handleNote = {
		create: (noteContent: any) => {
			if (noteContent) {
				window.parent.postMessage({
					service: 'notes',
					action: 'add',
					params: {
						content: noteContent
					}
				}, '*');
				form.setFieldsValue({ note: "" });
				showSuccess("Thêm mới ghi chú thành công");
			}
		},
		delete: (note: any) => {
			if (note) {
				window.parent.postMessage({
					service: 'notes',
					action: 'remove',
					params: {
						noteId: note.id
					}
				}, '*');
				showSuccess("Xóa ghi chú thành công");
			}
		},
	}

  return (
    <div className="yd-page-customer-create-update">
      <Form
        form={form}
        name="customer_add"
        onFinish={handleSubmitOption}
        layout="vertical"
        style={{width: "100% !important" }}
      >
        <Card>
          {/*Customer name*/}
          <Form.Item
            name="full_name"
            rules={[{ required: true, message: "Nhập tên khách hàng"}]}
          >
            <Input
              maxLength={255}
              placeholder="Nhập tên khách hàng"
              onBlur={(value) => handleBlurName(value.target.value)}
              // onChange={(value) => handleChangeName(value.target.value)}
              className="item-input"
            />
          </Form.Item>

          {/*Customer phone*/}
          <div className="item-container">
            <Form.Item
              className="item-input"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số điện thoại",
                },
                {
                  pattern: RegUtil.PHONE,
                  message: "Số điện thoại chưa đúng định dạng",
                },
              ]}>
              <Input
                disabled={true}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>

            <div className="item-icon-button">
              <Button
                type="primary"
                icon={<img src={phonePlus} alt="" />}
                onClick={showPhoneModal}
              />
            </div>
          </div>

          {customerPhones && customerPhones.length > 0 && (
            <div className="phone-tag">
              {customerPhones &&
                customerPhones.map((phone: any, index: any) => (
                  <Tag
                    key={index}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelectPhone(phone)}>
                    {phone}
                    <img
                      alt="delete"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        showConfirmDeletePhone(phone);
                      }}
                      style={{width: 16, marginBottom: 2}}
                      src={XCloseBtn}
                    />
                  </Tag>
                ))}
            </div>
          )}

          <YDpageCustomerAreaInfo
            form={form}
            customer={customer}
            setCityId={setCityId}
            isDisable={isDisableForm()}
            newCustomerInfo={newCustomerInfo}
            setNewCustomerInfo={setNewCustomerInfo}
          />

          {/*customer card, group*/}
          <div className="item-row">
            <Form.Item
              name="card_number"
              className="left-item"
            >
              <Input
                placeholder="Mã thẻ KH"
                allowClear
                onBlur={(e) => {
                  form?.setFieldsValue({ card_number: e.target.value.trim() });
                  updateNewCustomerInfo("card_number", e.target.value.trim());
                }}
              />
            </Form.Item>

            <Form.Item
              name="customer_group_id"
              className="right-item"
            >
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder={
                  <React.Fragment>
                    {/* <TeamOutlined style={{ color: "#71767B" }} /> */}
                    <span> Nhóm khách hàng</span>
                  </React.Fragment>
                }
                className="select-with-search"
              >
                {customerGroups &&
                  customerGroups.map((group: any) => (
                    <Select.Option key={group.id} value={group.id}>
                      {group.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </div>

          {/*gender, phone*/}
          <div className="item-row">
            <Form.Item
              name="gender"
              className="left-item"
            >
              <Select
                onChange={onSelectGender}
                placeholder="Giới tính"
                allowClear
              >
                {GENDER_OPTIONS.map((gender: any) => (
                  <Select.Option key={gender.value} value={gender.value}>
                    {gender.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>


            <Form.Item
              name="birthday"
              className="right-item"
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Ngày sinh"
                format={"DD/MM/YYYY"}
                onChange={onChangeBirthDay}
              />
            </Form.Item>
          </div>

          {/*submit button*/}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              style={{ height:"32px" }}
              onClick={handleSubmitCreateUpdate}
            >
              Lưu
            </Button>
          </div>

          <Divider style={{margin: "8px 0"}} />

          {/*Ghi chú*/}
          <div><b>Ghi chú</b></div>
					<Form.Item
						name="note"
						className="note-container"
						rules={[
							{
								max: 1000,
								message: 'Vui lòng không nhập quá 1000 kí tự'
							},
						]}
					>
						<Input
							maxLength={1000}
							placeholder="Nhập ghi chú"
							onPressEnter={(e: any) => {
								handleNote.create(e.target.value)
								setNote('')
							}}
							onChange={(e: any) => setNote(e.target.value)}
							value={note}
						/>
					</Form.Item>

					<div className="customer-note-wrapper">
						{notes &&
							notes.map((note: any, index: number) => (
								<div className="customer-note-item" key={index}>
									<span key={note.id}>{note.content}</span>
									<img
										alt="delete"
										className="customer-note-btn-delete"
										onClick={() => handleNote.delete(note)}
										src={XCloseBtn}
									/>
								</div>
							))}
					</div>
				</Card>
			</Form>

      <AddPhoneModal
        visible={visiblePhoneModal}
        customerDefaultPhone={customerDefaultPhone}
        addFpPhone={addFpPhone}
        deleteFpPhone={showConfirmDeletePhone}
        setFpDefaultPhone={setFpDefaultPhone}
        customerPhones={customerPhones}
        onOk={hidePhoneModal}
        onCancel={hidePhoneModal}
      />

      <ModalDeleteConfirm
        width="400px"
        visible={visibleDeletePhoneModal}
        onOk={() => doDeletePhone()}
        onCancel={() => setVisibleDeletePhoneModal(false)}
        title="Thông báo"
        subTitle="Bạn có chắc chắn muốn xóa số điện thoại này"
      />

    </div>
  )
}

export default YDPageCustomerCreateUpdate;