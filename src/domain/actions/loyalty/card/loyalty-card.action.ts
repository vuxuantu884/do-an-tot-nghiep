import BaseAction from 'base/base.action';
import { LoyaltyCardType } from 'domain/types/loyalty.type';
import { PageResponse } from 'model/base/base-metadata.response';
import { BaseQuery } from 'model/base/base.query';
import { LoyaltyCardResponse } from 'model/response/loyalty/card/loyalty-card.response';

export const LoyaltyCardSearch = (query: BaseQuery, setData: (data: PageResponse<LoyaltyCardResponse>) => void) => {
    return BaseAction(LoyaltyCardType.SEARCH_LOYALTY_CARD_REQUEST, { query, setData });
}
