import { AutoComplete, Button, Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
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
      onSaveSuccess(data)
      showSuccess('Gán thành công')
      onClose()
    }
  }, [onSaveSuccess, onClose])

  const cardAssignment = useCallback(() => {
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
            onChange={onChange}
            placeholder="Nhập số điện thoại, tên"
            value={keyword}
          >
          </AutoComplete>
          <Button className="assign-btn" type="primary" onClick={cardAssignment}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.1493 1.70652L16.2975 0.854738C16.2654 0.822595 16.2252 0.808533 16.183 0.808533C16.1408 0.808533 16.1007 0.824604 16.0685 0.854738L14.5397 2.38353C13.8751 1.93324 13.0905 1.69316 12.2877 1.69447C11.2591 1.69447 10.2306 2.08621 9.44508 2.8717L7.39799 4.9188C7.36808 4.94901 7.3513 4.9898 7.3513 5.03231C7.3513 5.07481 7.36808 5.1156 7.39799 5.14581L12.8562 10.6041C12.8884 10.6362 12.9286 10.6503 12.9708 10.6503C13.0109 10.6503 13.0531 10.6342 13.0853 10.6041L15.1324 8.55697C16.5165 7.17081 16.6792 5.02728 15.6205 3.46434L17.1493 1.93554C17.2116 1.87126 17.2116 1.7688 17.1493 1.70652ZM14.1641 7.59068L12.9708 8.78398L9.21808 5.0313L10.4114 3.838C10.9116 3.33777 11.5786 3.06054 12.2877 3.06054C12.9969 3.06054 13.6618 3.33576 14.1641 3.838C14.6643 4.33822 14.9415 5.00518 14.9415 5.71434C14.9415 6.42349 14.6643 7.08844 14.1641 7.59068ZM10.3431 9.70005C10.3129 9.67014 10.2721 9.65336 10.2296 9.65336C10.1871 9.65336 10.1463 9.67014 10.1161 9.70005L8.77812 11.038L6.96406 9.22394L8.30401 7.88398C8.36629 7.8217 8.36629 7.71925 8.30401 7.65697L7.57276 6.92572C7.54256 6.89581 7.50177 6.87903 7.45926 6.87903C7.41675 6.87903 7.37596 6.89581 7.34575 6.92572L6.0058 8.26568L5.14196 7.40184C5.12696 7.38683 5.10909 7.375 5.08941 7.36706C5.06974 7.35912 5.04866 7.35523 5.02745 7.35563C4.98727 7.35563 4.94508 7.3717 4.91294 7.40184L2.86785 9.44894C1.4837 10.8351 1.32098 12.9786 2.37968 14.5416L0.850887 16.0704C0.820977 16.1006 0.804199 16.1414 0.804199 16.1839C0.804199 16.2264 0.820977 16.2672 0.850887 16.2974L1.70267 17.1492C1.73482 17.1813 1.77499 17.1954 1.81718 17.1954C1.85937 17.1954 1.89955 17.1793 1.93169 17.1492L3.46049 15.6204C4.13749 16.0804 4.92499 16.3094 5.71249 16.3094C6.74107 16.3094 7.76964 15.9177 8.55513 15.1322L10.6022 13.0851C10.6645 13.0228 10.6645 12.9204 10.6022 12.8581L9.73839 11.9942L11.0783 10.6543C11.1406 10.592 11.1406 10.4896 11.0783 10.4273L10.3431 9.70005ZM7.58683 14.1679C7.34095 14.415 7.04853 14.611 6.72647 14.7444C6.40441 14.8779 6.0591 14.9462 5.71049 14.9454C5.00133 14.9454 4.33638 14.6701 3.83415 14.1679C3.58701 13.922 3.39106 13.6296 3.25761 13.3076C3.12417 12.9855 3.05588 12.6402 3.05669 12.2916C3.05669 11.5824 3.33191 10.9175 3.83415 10.4152L5.02745 9.22193L8.78013 12.9746L7.58683 14.1679Z" fill="white"/>
            </svg>
            Gán
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AssignCustomer