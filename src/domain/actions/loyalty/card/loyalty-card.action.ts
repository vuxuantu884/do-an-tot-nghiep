import BaseAction from 'base/base.action';
import BaseResponse from 'base/base.response';
import { LoyaltyCardType } from 'domain/types/loyalty.type';
import { PageResponse } from 'model/base/base-metadata.response';
import { CustomerCardListRequest } from 'model/request/customer.request';
import { LoyaltyCardAssignmentRequest } from 'model/request/loyalty/card/CardAssignmentRequest';
import { LoyaltyCardResponse } from 'model/response/loyalty/card/loyalty-card.response';

export const LoyaltyCardSearch = (query: CustomerCardListRequest, setData: (data: PageResponse<LoyaltyCardResponse>) => void) => {
    return BaseAction(LoyaltyCardType.SEARCH_LOYALTY_CARD_REQUEST, { query, setData });
}

export const LoyaltyCardAssignment = (id: number, query: LoyaltyCardAssignmentRequest, callback: (data: BaseResponse<LoyaltyCardResponse>) => void) => {
    return BaseAction(LoyaltyCardType.ASSIGN_CUSTOMER_REQUEST, { id, query, callback });
}

export const LoyaltyCardLock = (id: number, callback: (data: BaseResponse<LoyaltyCardResponse>) => void) => {
    return BaseAction(LoyaltyCardType.LOCK_CARD_REQUEST, { id, callback });
}
