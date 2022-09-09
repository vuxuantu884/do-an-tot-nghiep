/// <reference types="react-scripts" />
declare module "*.mp3";
declare module "*.wav";
declare module "*.xlsx" {
  const src: string;
  export default src;
}
