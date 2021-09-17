import { AutoComplete, Button, Input, Modal } from "antd";
import { useCallback, useMemo, useState } from "react";
import _ from 'lodash'
import './assign-customer.scss'
import { useDispatch } from "react-redux";
import { CustomerSearch } from "domain/actions/customer/customer.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyCardAssignment } from "domain/actions/loyalty/card/loyalty-card.action";
import { showSuccess } from "utils/ToastUtils";

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
  const dispatch = useDispatch()

  const fetchCustomer = _.debounce((keyword: string) => {
    let query: any = { request: keyword }
    dispatch(CustomerSearch(query, setCustomers))
  }, 300)

  const transformCustomers = useMemo(() => {
    return customers.map(customer => {
      return { label: customer.full_name + ' - ' + customer.phone, value: customer.full_name + ' - ' + customer.phone, customer: customer }
    })
  }, [customers])

  const assignmentCallback = useCallback((data: any) => {
    if (onSaveSuccess) {
      onSaveSuccess(data)
      showSuccess('Gán thành công')
      onClose()
    }
  }, [onSaveSuccess, onClose])

  const cardAssignment = useCallback(() => {
    if (selectedCustomer) {
      dispatch(LoyaltyCardAssignment(card.id, { customer_id: selectedCustomer.customer.id, customer_name: selectedCustomer.customer.full_name }, assignmentCallback))
    }
  }, [selectedCustomer, dispatch, assignmentCallback, card?.id])

  return (
    <Modal
      width="35%"
      visible={visible}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
      title="Gán khách hàng"
      onCancel={onClose}
    >
      <div className="assign-customer-modal">
        <div className="row-label">Tên khách hàng <span className="text-error">*</span></div>
        <div className="assignment">
          <AutoComplete
            className="dropdown-rule"
            notFoundContent={
            customers.length === 0
              ? "Không có bản ghi nào"
              : undefined
            }
            onSearch={fetchCustomer}
            options={transformCustomers}
            onSelect={(value: any, option: any) => setSelectedCustomer(option)}
          >
            <Input
              placeholder="Nhập số điện thoại, tên"
            />
          </AutoComplete>
          <Button className="assign-btn" type="primary" onClick={cardAssignment}>Gán</Button>
        </div>
      </div>
    </Modal>
  )
}

export default AssignCustomer