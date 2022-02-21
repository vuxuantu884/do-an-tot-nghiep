import { PageResponse } from './../../../model/base/base-metadata.response';
import { BankType } from './../../types/bank.type';
import BaseAction from 'base/base.action';
import { BankAccountRequest, BankAccountResponse } from 'model/bank/bank.model';
import { BankAccountSearchQuery } from 'model/bank/bank.model';

export const getBankAccountAction=(query:BankAccountSearchQuery,setData:(data:PageResponse<BankAccountResponse>)=>void)=>{
    return BaseAction(BankType.GET_BANK_ACCOUNT,{query,setData});
}

export const postBankAccountAction=(param:BankAccountRequest,setData:(data:BankAccountResponse)=>void)=>{
    return BaseAction(BankType.POST_BANK_ACCOUNT,{param,setData});
}

export const putBankAccountAction=(param:BankAccountRequest, setData:(data:BankAccountResponse)=>void)=>{
    return BaseAction(BankType.PUT_BANK_ACCOUNT,{param,setData});
}

export const getIdBankAccountAction=(id:number, setData:(data:BankAccountResponse)=>void)=>{
    return BaseAction(BankType.GET_ID_BANK_ACCOUNT,{id,setData});
}

export const deleteBankAccountAction=(id:number, setData:(data:BankAccountResponse)=>void)=>{
    return BaseAction(BankType.DELETE_BANK_ACCOUNT,{id,setData});
}

export const getBankAction=(setData:(data:any)=>void)=>{
    return BaseAction(BankType.GET_BANK,{setData});
}