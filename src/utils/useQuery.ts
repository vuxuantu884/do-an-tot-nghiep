import { useLocation } from "react-router-dom";

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function getQueryParams(params: URLSearchParams) {
  let paramObj = {};
  var keys = params.keys();
  for (var key of keys) {
    paramObj = {...paramObj, [key]: params.get(key)}
  }
  return paramObj;
}
