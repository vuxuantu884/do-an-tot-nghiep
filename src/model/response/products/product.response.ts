import { BaseObject } from 'model/base/base.response';


export interface ProductResponse extends BaseObject {
  name: string,
  category_id: number,
  category: string,
  material_id: number,
  material:string,
  goods:string,
  brand:string,
  brand_name:string,
  made_in_id:number,
  made_in:string,
  description:string,
  content:string,
  merchandiser_code:string,
  merchandiser:string,
  designer_code:string,
  designer:string,
  tags:string,
  status:string,
  status_name:string,
  preservation:string,
  unit:string,
  product_type:string,
}