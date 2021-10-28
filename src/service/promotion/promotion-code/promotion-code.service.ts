import {BaseQuery} from "../../../model/base/base.query";
import BaseResponse from "../../../base/base.response";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {generateQuery} from "../../../utils/AppUtils";
import BaseAxios from "../../../base/base.axios";
import {ApiConfig} from "../../../config/api.config";
import {ListDiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";

export const searchPromotionCodeList = (query: BaseQuery): Promise<BaseResponse<PageResponse<ListDiscountResponse>>> => {
  let params = generateQuery(query);
  const promise = {
    "code": 20000000,
    "message": "Thành công",
    "data": {
      "metadata": {
        "total": 2,
        "page": 1,
        "limit": 30
      },
      "items": [
        {
          "id": 1,
          "code": "CK01",
          "name": "Cấp mã Sinh nhật cho VIP R, Vip D",
          "code_amount": "100",
          "used_amount": "100",
          "start_date": "2021-06-20T08:49:31Z",
          "end_date": "2021-06-23T08:49:31Z",
          "created_by": "Ngô Bá Khá",
          "status": "APPLYING"
        },
        {
          "id": 2,
          "code": "CK02",
          "name": "Cấp mã Sinh nhật cho VIP R, Vip D",
          "code_amount": "100",
          "used_amount": "100",
          "start_date": "2021-06-20T08:49:31Z",
          "end_date": "2021-06-23T08:49:31Z",
          "created_by": "Ngô Bá Khá",
          "status": "CANCELLED"
        }
      ]
    },
    "response_time": "2021-10-28T03:19:32.099+00:00",
    "errors": null,
    "request_id": null
  }

  return Promise.resolve(promise).then();
};
