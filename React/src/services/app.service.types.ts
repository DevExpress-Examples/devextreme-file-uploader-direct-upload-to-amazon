export interface UploadData {
  key: string;
  uploadId?: string;
  parts: Part[];
}

export interface Part {
  PartNumber: number;
  ETag: string;
}
