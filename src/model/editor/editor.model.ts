export interface keywordsModel {
  title: string;
  key: string;
  value: string | string[];
  isRepeat?: boolean;
}

export type listKeywordsModel = keywordsModel[];

export interface EditorModel {
  initialHtmlContent: string;
  onChange: (data: string) => void;
  listKeywords?: listKeywordsModel;
}

export interface EditorModalType {
  isModalVisible: boolean;
  handleCancel: () => void;
  insertKeyword: (text: string) => void;
  listKeywords?: listKeywordsModel;
}

export interface PrintEditorModel {
  initialValue?: string;
  onChange: (value: string) => void;
}

export interface PrintPreviewModel {
  htmlContent: string;
  listKeywords?: listKeywordsModel;
  listProductKeywords?: listKeywordsModel;
  previewHeaderHeight?: number;
}

export type SinglePrinterContentModel = string;

export interface FormValueModel {
  tenMauIn: string;
  chiNhanhApDung: string;
  khoIn: string;
  apDung: boolean;
  formIn: SinglePrinterContentModel;
}

export interface FormPrinterModel {
  id: string | number;
  tenMauIn: string;
  chiNhanhApDung: string;
  khoIn: string;
  apDung: boolean;
  formIn?: SinglePrinterContentModel;
}
