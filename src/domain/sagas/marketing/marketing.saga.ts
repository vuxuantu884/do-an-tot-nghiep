import { YodyAction } from "base/base.action";
import { takeLatest } from "redux-saga/effects";
import {
  createCampaignService,
  getBrandNameService,
  getCampaignContactService,
  getCampaignContactListService,
  getCampaignDetailService,
  getCampaignListService,
  getImportFileTemplateService,
  getMessageTemplateService,
  importFileService, updateCampaignService,
  getCampaignRefIdService,
  updateContactMessageService,
  resendContactMessageService,
} from "service/marketing/marketing.service";
import { callApiSaga } from "utils/ApiUtils";
import { MarketingType } from "domain/types/marketing.type";

/** campaign list */
function* getCampaignListSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getCampaignListService, query);
}

/** campaign detail */
function* getCampaignDetailSaga(action: YodyAction) {
  const { campaignId, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getCampaignDetailService, campaignId);
}

/** campaign ref_id */
function* getCampaignRefIdSaga(action: YodyAction) {
  const { campaignId, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getCampaignRefIdService, campaignId);
}

/** campaign for customer list */
function* getCampaignContactListSaga(action: YodyAction) {
  const { campaignId, query, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getCampaignContactListService, campaignId, query);
}

/** get brand name */
function* getBrandNameSaga(action: YodyAction) {
  const { setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getBrandNameService);
}

/** get message template */
function* getMessageTemplateSaga(action: YodyAction) {
  const { query, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getMessageTemplateService, query);
}

/** get import file template */
function* getImportFileTemplateSaga(action: YodyAction) {
  const { conditions, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getImportFileTemplateService, conditions);
}

/** import file */
function* importFileSaga(action: YodyAction) {
  const { queryParams, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, importFileService, queryParams);
}

/** get Campaign Contact */
function* getCampaignContactSaga(action: YodyAction) {
  const { campaignId, queryParams, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, getCampaignContactService, campaignId, queryParams);
}

/** update Contact Message */
function* updateContactMessageSaga(action: YodyAction) {
  const { queryParams, callback } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, callback, updateContactMessageService, queryParams);
}

/** resend Contact Message */
function* resendContactMessageSaga(action: YodyAction) {
  const { contactId, callback } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, callback, resendContactMessageService, contactId);
}

/** create campaign */
function* createCampaignSaga(action: YodyAction) {
  const { params, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, createCampaignService, params);
}

/** update campaign */
function* updateCampaignSaga(action: YodyAction) {
  const { campaignId, params, setData } = action.payload;
  yield callApiSaga({ notifyAction: "SHOW_ALL" }, setData, updateCampaignService, campaignId, params);
}


export default function* marketingSagas() {
  yield takeLatest(MarketingType.CAMPAIGN_LIST, getCampaignListSaga);
  yield takeLatest(MarketingType.CAMPAIGN_DETAIL, getCampaignDetailSaga);
  yield takeLatest(MarketingType.GET_CAMPAIGN_REF_ID, getCampaignRefIdSaga);
  yield takeLatest(MarketingType.CAMPAIGN_CONTACT_LIST, getCampaignContactListSaga);
  yield takeLatest(MarketingType.GET_BRAND_NAME, getBrandNameSaga);
  yield takeLatest(MarketingType.GET_MESSAGE_TEMPLATE, getMessageTemplateSaga);
  yield takeLatest(MarketingType.GET_IMPORT_FILE_TEMPLATE, getImportFileTemplateSaga);
  yield takeLatest(MarketingType.CAMPAIGN_IMPORT_FILE, importFileSaga);
  yield takeLatest(MarketingType.CAMPAIGN_CONTACT, getCampaignContactSaga);
  yield takeLatest(MarketingType.UPDATE_CONTACT_MESSAGE, updateContactMessageSaga);
  yield takeLatest(MarketingType.RESEND_CONTACT_MESSAGE, resendContactMessageSaga);
  yield takeLatest(MarketingType.CREATE_CAMPAIGN, createCampaignSaga);
  yield takeLatest(MarketingType.UPDATE_CAMPAIGN, updateCampaignSaga);
}
