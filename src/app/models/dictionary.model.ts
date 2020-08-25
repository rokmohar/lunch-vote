export interface Dictionary<T extends any = any> {
  [key: string]: T;
}
