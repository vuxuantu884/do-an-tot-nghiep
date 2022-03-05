import React from "react";
import useAuthorization from "hook/useAuthorization";
import { YDpagePermission } from "config/permissions/fpage.permission";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import YDPageCustomerView from "screens/yd-page/yd-page-customer/YDPageCustomerView/YDPageCustomerView";
import YDPageCustomerCreateUpdate from "screens/yd-page/yd-page-customer/YDPageCustomerCreateUpdate/YDPageCustomerCreateUpdate";


const customersReadPermission = [YDpagePermission.customers_read];
const customersCreatePermission = [YDpagePermission.customers_create];
const customersUpdatePermission = [YDpagePermission.customers_update];


const YDPageCustomer = (props: any) => {
  const {
    customer,
    setCustomer,
    isEditCustomer,
    setIsEditCustomer,
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
    customerGroups,
		setCustomerDefaultPhone
  } = props;

  const [allowCreateCustomer] = useAuthorization({
    acceptPermissions: customersCreatePermission,
    not: false,
  });
  const [allowUpdateCustomer] = useAuthorization({
    acceptPermissions: customersUpdatePermission,
    not: false,
  });


  return (
    <div className="yd-page-customer">
      <AuthWrapper acceptPermissions={customersReadPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <>
            {(customer && !isEditCustomer) &&
              <YDPageCustomerView
                allowUpdateCustomer={allowUpdateCustomer}
                setIsEditCustomer={setIsEditCustomer}
                customer={customer}
                newCustomerInfo={newCustomerInfo}
                setNewCustomerInfo={setNewCustomerInfo}
                getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
                customerPhone={customerPhone}
                customerDefaultPhone={customerDefaultPhone}
                customerPhones={customerPhones}
                addFpPhone={addFpPhone}
                deleteFpPhone={deleteFpPhone}
                setFpDefaultPhone={setFpDefaultPhone}
								setCustomerDefaultPhone={setCustomerDefaultPhone}
              />
            }

            {(!customer || (customer && isEditCustomer)) &&
              <YDPageCustomerCreateUpdate
                allowCreateCustomer={allowCreateCustomer}
                allowUpdateCustomer={allowUpdateCustomer}
                customerGroups={customerGroups}
                customer={customer}
                setCustomer={setCustomer}
                newCustomerInfo={newCustomerInfo}
                setNewCustomerInfo={setNewCustomerInfo}
                getCustomerWhenPhoneChange={getCustomerWhenPhoneChange}
                customerPhone={customerPhone}
                customerDefaultPhone={customerDefaultPhone}
                customerPhones={customerPhones}
                customerFbName={customerFbName}
                addFpPhone={addFpPhone}
                deleteFpPhone={deleteFpPhone}
                setFpDefaultPhone={setFpDefaultPhone}
								setCustomerDefaultPhone={setCustomerDefaultPhone}
              />
            }
          </>
          : <NoPermission />)}
      </AuthWrapper>
    </div>
  );
};

export default YDPageCustomer;
