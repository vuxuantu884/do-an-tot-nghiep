interface BaseResponse<T> {
  code: number;
  message: String;
  data: T;
  response_time: string;
  errors: Array<string>;
  request_id: String;
}

export default BaseResponse;
