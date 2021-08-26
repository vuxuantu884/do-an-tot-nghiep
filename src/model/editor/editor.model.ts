export interface keywordsModel {
  name: string;
  value: string;
  example?: string;
  isShow?: boolean;
}

export interface productKeywordsModel {
  title: string;
  key: string;
  value: string[];
}

export interface listKeywordsModel {
  name: string;
  list?: keywordsModel[];
}

export interface EditorModel {
  initialHtmlContent: string;
  onChange: (data: string) => void;
  listKeywords?: listKeywordsModel;
}

export interface EditorModalType {
  isModalVisible: boolean;
  handleCancel: () => void;
  insertKeyword: (text: string) => void;
  listKeywords?: listKeywordsModel[];
  listProductKeywords?: productKeywordsModel[];
}

export interface PrintEditorModel {
  initialValue?: string;
  onChange: (value: string) => void;
}

export interface PrintPreviewModel {
  htmlContent: string;
  listKeywords?: listKeywordsModel[];
  listProductKeywords?: productKeywordsModel[];
  previewHeaderHeight?: number;
  isShowEditor?: boolean;
  onChangeShowEditor: (isShow: boolean) => void;
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
