export type Nullable<T> = T | null | undefined;

export interface AzureObject {
  error?: string;
  success?: boolean;
  accessUrl?: string;
  accessUrl2?: string;
}

export type AzureResponse = AzureObject | string;

export interface FileEntry {
  etag: Nullable<string>;
  name: Nullable<string>;
  lastModified: Nullable<Date>;
  length: number;
}

export interface RequestParams {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  processData?: boolean;
  contentType?: boolean;
  body?: Blob | string;
}

export interface CommandParams {
  restype?: string;
  comp?: string;
  prefix?: string;
  blockid?: string;
}

export interface AccessUrls {
  url1?: string;
  url2?: string;
  success?: boolean;
}

export function isUrlResponse(x: AzureResponse): x is AzureObject {
  return (x as AzureObject).success !== undefined;
}
