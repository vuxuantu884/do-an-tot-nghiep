import {
  createPromotionCampaignService,
  getPromotionCampaignListService,
  getPromotionCampaignDetailService,
  updatePromotionCampaignService,
  approvePromotionCampaignService,
  registerPromotionCampaignService,
  setupPromotionCampaignService,
  accountantConfirmRegisterService,
  getPromotionCampaignLogsDetailService,
  activePromotionCampaignService,
  updatePromotionCampaignItemService,
  disablePromotionCampaignService,
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
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    updatePromotionCampaignService,
    id,
    body,
  );
}

function* updatePromotionCampaignItemSaga(action: YodyAction) {
  const { id, body, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    updatePromotionCampaignItemService,
    id,
    body,
  );
}

function* createPromotionCampaignSaga(action: YodyAction) {
  const { body, onResult } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, onResult, createPromotionCampaignService, body);
}

function* approvePromotionCampaignSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    approvePromotionCampaignService,
    id,
    params,
  );
}

function* registerPromotionCampaignSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    registerPromotionCampaignService,
    id,
    params,
  );
}

function* accountantConfirmRegisterSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    accountantConfirmRegisterService,
    id,
    params,
  );
}

function* setupPromotionCampaignSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    setupPromotionCampaignService,
    id,
    params,
  );
}

function* activePromotionCampaignSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    activePromotionCampaignService,
    id,
    params,
  );
}

function* disablePromotionCampaignSaga(action: YodyAction) {
  const { id, params, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    disablePromotionCampaignService,
    id,
    params,
  );
}

function* getPromotionCampaignLogsDetailSaga(action: YodyAction) {
  const { id, onResult } = action.payload;
  yield callApiSaga(
    { notifyAction: "SHOW_ALL" },
    onResult,
    getPromotionCampaignLogsDetailService,
    id,
  );
}

export function* promotionCampaignSaga() {
  yield all([
    takeLatest(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_LIST, getPromotionCampaignListSaga),
    takeLatest(PromotionCampaignType.GET_PROMOTION_CAMPAIGN_DETAIL, getPromotionCampaignDetailSaga),
    takeLatest(PromotionCampaignType.UPDATE_PROMOTION_CAMPAIGN, updatePromotionCampaignSaga),
    takeLatest(
      PromotionCampaignType.UPDATE_PROMOTION_CAMPAIGN_ITEM,
      updatePromotionCampaignItemSaga,
    ),
    takeLatest(PromotionCampaignType.CREATE_PROMOTION_CAMPAIGN, createPromotionCampaignSaga),
    takeLatest(PromotionCampaignType.APPROVE_PROMOTION_CAMPAIGN, approvePromotionCampaignSaga),
    takeLatest(PromotionCampaignType.REGISTER_PROMOTION_CAMPAIGN, registerPromotionCampaignSaga),
    takeLatest(PromotionCampaignType.ACCOUNTANT_CONFIRM_REGISTER, accountantConfirmRegisterSaga),
    takeLatest(PromotionCampaignType.SETUP_PROMOTION_CAMPAIGN, setupPromotionCampaignSaga),
    takeLatest(PromotionCampaignType.ACTIVE_PROMOTION_CAMPAIGN, activePromotionCampaignSaga),
    takeLatest(PromotionCampaignType.DISABLE_PROMOTION_CAMPAIGN, disablePromotionCampaignSaga),
    takeLatest(
      PromotionCampaignType.GET_PROMOTION_CAMPAIGN_LOG_DETAIL,
      getPromotionCampaignLogsDetailSaga,
    ),
  ]);
}
