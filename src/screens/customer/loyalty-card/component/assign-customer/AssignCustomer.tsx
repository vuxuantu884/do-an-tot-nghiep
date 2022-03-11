import { AutoComplete, Button, Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import _ from 'lodash'
import './assign-customer.scss'
import { useDispatch } from "react-redux";
import { CustomerSearch } from "domain/actions/customer/customer.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyCardAssignment } from "domain/actions/loyalty/card/loyalty-card.action";
import { showError, showSuccess } from "utils/ToastUtils";

import assignWhiteIcon from "assets/icon/assign_white.svg";

type ModalProps = {
  visible?: boolean;
  onClose: () => void;
  card: any,
  onSaveSuccess?: (data: any) => void
};

const AssignCustomer = (props: ModalProps) => {
  const { visible, card, onClose, onSaveSuccess } = props
  const [customers, setCustomers] = useState<Array<CustomerResponse>>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>()
  const [keyword, setKeyword] = useState<string>('')
  const dispatch = useDispatch()

  const fetchCustomer = _.debounce((keyword: string) => {
    let query: any = { request: keyword }
    dispatch(CustomerSearch(query, setCustomers))
  }, 300)

  useEffect(() => {
    if (!visible) {
      setKeyword('')
      setCustomers([])
      setSelectedCustomer(undefined)
    }
  }, [visible])

  const transformCustomers = useMemo(() => {
    return customers.map(customer => {
      return { label: customer.full_name + ' - ' + customer.phone, value: customer.full_name + ' - ' + customer.phone, customer: customer }
    })
  }, [customers])

  const assignmentCallback = useCallback((data: any) => {
    if (onSaveSuccess) {
      onSaveSuccess && onSaveSuccess(data);
      showSuccess('Gán thẻ khách hàng thành công!');
      onClose && onClose();
    }
  }, [onSaveSuccess, onClose])

  const cardAssignment = useCallback(() => {
    if (!selectedCustomer) {
      showError("Vui lòng chọn khách hàng!");
      return;
    }
    if (selectedCustomer && card) {
      dispatch(LoyaltyCardAssignment(card.id, { customer_id: selectedCustomer.customer.id, card_number: card.card_number }, assignmentCallback))
    }
  }, [selectedCustomer, dispatch, assignmentCallback, card])

  const onChange = (data: string) => {
    setKeyword(data);
  };

  const onSelect = (value: any, option: any) => {
    setSelectedCustomer(option)
  }

  const onClear = () => {
    setSelectedCustomer(null);
  }


  return (
    <Modal
      width="35%"
      visible={visible}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      title="Gán khách hàng"
      onCancel={onClose}
      className="assign-customer-modal"
    >
      <div>
        <div className="row-label">Tên khách hàng <span className="text-error">*</span></div>
        <div className="assignment">
          <AutoComplete
            className="dropdown-rule"
            notFoundContent={
            customers.length === 0
              ? "Không có bản ghi nào"
              : undefined
            }
            showArrow
            onSearch={fetchCustomer}
            options={transformCustomers}
            onSelect={onSelect}
            allowClear
            onClear={onClear}
            onChange={onChange}
            placeholder="Nhập số điện thoại, tên"
            value={keyword}
          >
          </AutoComplete>

          <Button
            className="assign-btn"
            type="primary"
            onClick={cardAssignment}
            icon={<img alt="" style={{ width: 18, height: 18 }}
            src={assignWhiteIcon} />}
          >
            Gán
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AssignCustomer