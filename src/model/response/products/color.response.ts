
import { BaseObject } from '../base.response';


export interface ColorResponse extends BaseObject {
  name:string,
  hex_code: string|null,
  parent_id: number|null
  image: string|null
}