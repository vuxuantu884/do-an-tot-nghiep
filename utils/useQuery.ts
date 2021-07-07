import { useLocation } from "react-router-dom";
import { UTC } from "./RegUtils";

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function getQueryParams(params: URLSearchParams) {
  let paramObj = {};
  var keys = params.keys();
  for (var key of keys) {
    let value = params.get(key);
    if(value != null && value.includes(',')) {
      paramObj = {...paramObj, [key]: value.split(',')}
    } else if(value != null && UTC.test(value)) {
      paramObj = {...paramObj, [key]: new Date(value)}
    } else {
      paramObj = {...paramObj, [key]: value}
    }
  }
  return paramObj;
}
