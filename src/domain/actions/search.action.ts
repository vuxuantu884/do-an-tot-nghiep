import { VariantModel } from './../../model/other/ProductModel';
import BaseAction from "base/BaseAction";
import { SearchType } from "domain/types/search.type";

const OnSearchChange = (text: string, setData: (data: Array<VariantModel>) => void) => {
  return BaseAction(SearchType.KEY_SEARCH_CHANGE, {key: text, setData: setData} );
}

const OnSearchGift = (text: string, setData: (arrResult: Array<VariantModel>) => void) => {
  return BaseAction(SearchType.SEARCH_GIFT, {key: text, setData: setData});
}

const UpdateResultSearch = (list: Array<VariantModel>) => {
  return BaseAction(SearchType.UPDATE_RESULT_SEARCH, {data: list});
}

const SearchBarCode = (barcode: string) => {
  return BaseAction(SearchType.SEARCH_BAR_CODE, {barcode: barcode});
}

const clearResult = () => {
  return BaseAction(SearchType.CLEAR_RESULT, null);
}

export {OnSearchChange, UpdateResultSearch, clearResult, SearchBarCode, OnSearchGift};

