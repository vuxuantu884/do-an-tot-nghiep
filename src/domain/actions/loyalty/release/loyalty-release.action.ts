import BaseAction from "base/base.action";
import BaseResponse from "base/base.response";
import { LoyaltyCardReleaseType } from "domain/types/loyalty.type";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import { LoyaltyCardReleaseResponse } from "model/response/loyalty/release/loyalty-card-release.response";

const uploadFileCreateLoyaltyCard = (
  file: File,
  name: string,
  callback: (data: BaseResponse<LoyaltyCardReleaseResponse>) => void,
) => {
  return BaseAction(LoyaltyCardReleaseType.UPLOAD, {
    name,
    file,
    callback,
  });
};

const LoyaltyCardReleaseSearch = (
  query: BaseQuery,
  setData: (data: PageResponse<LoyaltyCardReleaseResponse>) => void,
) => {
  return BaseAction(LoyaltyCardReleaseType.SEARCH_LOYALTY_CARD_RELEASE_REQUEST, { query, setData });
};

export { uploadFileCreateLoyaltyCard, LoyaltyCardReleaseSearch };
