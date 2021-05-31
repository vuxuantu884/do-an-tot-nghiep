
import { BaseObject } from './../base.response';


export interface ColorResponse extends BaseObject {
  name:string,
  hex_code:string,
  parent_id:number
}