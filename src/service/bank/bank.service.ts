import { BankAccountRequest } from './../../model/bank/bank.model';
import BaseResponse from 'base/base.response';
import { ApiConfig } from 'config/api.config';
import BaseAxios from 'base/base.axios';
import { generateQuery } from 'utils/AppUtils';
import { BankAccountSearchQuery } from 'model/bank/bank.model';
import { BankAccountResponse } from 'model/bank/bank.model';
import { PageResponse } from 'model/base/base-metadata.response';

export const getBankAccountService=(query:BankAccountSearchQuery):Promise<BaseResponse<PageResponse<BankAccountResponse>>>=>{
    let params = generateQuery(query);
    return BaseAxios.get(`${ApiConfig.ORDER}/bank-accounts?${params}`);
}

export const postBankAccountService=(param:BankAccountRequest):Promise<BaseResponse<BankAccountResponse>>=>{
    return BaseAxios.post(`${ApiConfig.ORDER}/bank-accounts`,param);
}

export const putBankAccountService=(param:BankAccountRequest):Promise<BaseResponse<BankAccountResponse>>=>{
    return BaseAxios.put(`${ApiConfig.ORDER}/bank-accounts`, param);
}

export const deleteBankAccountService=(id:number):Promise<BaseResponse<BankAccountResponse>>=>{
    return BaseAxios.delete(`${ApiConfig.ORDER}/bank-accounts/${id}`);
}

export const getIdBankAccountService=(id:number):Promise<BaseResponse<BankAccountResponse>>=>{
    return BaseAxios.get(`${ApiConfig.ORDER}/bank-accounts/${id}`);
}