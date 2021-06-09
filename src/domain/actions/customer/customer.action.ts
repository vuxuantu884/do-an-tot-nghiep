import { CustomerSearchQuery } from 'model/query/customer.query';
import BaseAction from 'base/BaseAction';
import { CustomerType } from 'domain/types/customer.type';
import { CustomerResponse } from 'model/response/customer/customer.response';

export const OnCustomerSearchChange = (query: CustomerSearchQuery, setData: (data: Array<CustomerResponse>) => void) => {
    return BaseAction(CustomerType.KEY_SEARCH_CUSTOMER_CHANGE, { query, setData: setData });
}
