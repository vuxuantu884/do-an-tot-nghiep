import BaseAction from 'base/BaseAction';
import { SearchType } from 'domain/types/search.type';
import { CustomerModel } from './../../model/other/Customer/CustomerModel';

const OnSearchChange = (text: string, setData: (data: Array<CustomerModel>) => void) => {
    return BaseAction(SearchType.KEY_SEARCH_CUSTOMER_CHANGE, { key: text, setData: setData });
}

export { OnSearchChange };
