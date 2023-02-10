import {
  createPromotionCampaignService,
  getPromotionCampaignListService,
  getPromotionCampaignDetailService,
  updatePromotionCampaignService,
} from "service/promotion/campaign/campaign.service";
import { YodyAction } from "base/base.action";
import { takeLatest } from "typed-redux-saga";
import { PromotionCampaignType } from "domain/types/promotion.type";
import { all } from "redux-saga/effects";
import { callApiSaga } from "utils/ApiUtils";

function* getPromotionCampaignListSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getPromotionCampaignListService, query);
}

function* getPromotionCampaignDetailSaga(action: YodyAction) {
  const { id, onResult } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, onResult, getPromotionCampaignDetailService, id);
}

function* updatePromotionCampaignSaga(action: YodyAction) {
  const { id, body, onResult } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, onResult, updatePromotionCampaignService, id, body);
}

function* createPromotionCampaignSaga(action: YodyAction) {
  const { body, onResult } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, onResult, createPromotionCampaignService, body);
}

export function* promotionCampaignSaga() {
  yield all([
    takeLatest(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_LIST, getPromotionCampaignListSaga),
    takeLatest(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_DETAIL, getPromotionCampaignDetailSaga),
    takeLatest(PromotionCampaignType.UPDATE_PROMOTION_CAMPAIGN, updatePromotionCampaignSaga),
    takeLatest(PromotionCampaignType.CREATE_PROMOTION_CAMPAIGN, createPromotionCampaignSaga),
  ]);
}
