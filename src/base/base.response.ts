interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
  response_time: string;
  errors: Array<string>;
  request_id: string;
}

export default BaseResponse;
