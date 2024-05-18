import type FileSystemItem from 'devextreme/file_management/file_system_item';
import type UploadInfo from 'devextreme/file_management/upload_info';
import type { UploadData, Part } from './types';

export class AmazonGateway {
  endpointUrl: string;

  uploadData: UploadData[];

  onRequestExecuted: Function | undefined;

  defaultHeaders: any = { 'Content-Type': 'application/json' };

  constructor(endpointUrl: string, onRequestExecuted?: Function) {
    this.endpointUrl = endpointUrl;
    this.onRequestExecuted = onRequestExecuted;
    this.uploadData = [];
  }

  getRequestUrl(methodName: string): string {
    return `${this.endpointUrl}/${methodName}`;
  }

  logRequest(method: string, url: URL, requestUrl: string): void {
    if (!this.onRequestExecuted) {
      return;
    }
    const params = {
      method,
      urlPath: requestUrl,
      queryString: url.toString().replace(requestUrl, ''),
    };
    this.onRequestExecuted(params);
  }

  removeUploadData(fileName: string): void {
    const index = this.uploadData.findIndex((data) => data.key === fileName);
    if (index !== -1) {
      this.uploadData.splice(index, 1);
    }
  }

  initUploadData(fileName: string, uploadId: string): void {
    this.uploadData.push({ key: fileName, uploadId, parts: [] });
  }

  addPartToUploadData(fileName: string, part: Part): void {
    this.uploadData.find((x) => x.key == fileName)?.parts.push(part);
  }

  getUploadId(fileName: string): string | undefined {
    return this.uploadData.find((x) => x.key == fileName)?.uploadId;
  }

  getParts(fileName: string): Part[] | undefined {
    return this.uploadData.find((x) => x.key == fileName)?.parts;
  }

  async getItems(path: string): Promise<any> {
    const params = { path };
    const requestParams = { method: 'GET' };
    return this.makeRequest('getItems', params, requestParams);
  }

  async createDirectory(path: string, name: string): Promise<void> {
    const params = { path, name };
    const requestParams = { method: 'PUT' };
    await this.makeRequest('createDirectory', params, requestParams);
  }

  async renameItem(key: string, parentPath: string, name: string): Promise<any> {
    const params = { key, directory: parentPath, newName: name };
    const requestParams = { method: 'PUT' };
    await this.makeRequest('renameItem', params, requestParams);
  }

  async deleteItem(key: string): Promise<any> {
    const params = { item: key };
    const requestParams = { method: 'POST' };
    await this.makeRequest('deleteItem', params, requestParams);
  }

  async copyItem(sourceKey: string, destinationKey: string): Promise<any> {
    const params = { sourceKey, destinationKey };
    const requestParams = { method: 'PUT' };
    await this.makeRequest('copyItem', params, requestParams);
  }

  async moveItem(sourceKey: string, destinationKey: string): Promise<any> {
    const params = { sourceKey, destinationKey };
    const requestParams = { method: 'POST' };
    await this.makeRequest('moveItem', params, requestParams);
  }

  async downloadItems(keys: string[]): Promise<any> {
    const params = {};
    const requestParams = { method: 'POST', body: JSON.stringify(keys), headers: this.defaultHeaders };
    return this.makeRequest('downloadItems', params, requestParams);
  }

  async getPresignedDownloadUrl(fileName: string): Promise<any> {
    const params = { key: fileName };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };
    return this.makeRequest('getPresignedDownloadUrl', params, requestOptions);
  }

  async initUpload(fileData: File, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    const params = { key: `${destinationDirectory?.key ?? ''}${fileData.name}` };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };

    const uploadId = await this.makeRequest('initUpload', params, requestOptions);
    this.initUploadData(params.key, uploadId);
  }
  /* eslint-disable-next-line vue/max-len */
  async uploadPart(fileData: File, uploadInfo: UploadInfo, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    const params = {};
    const key = `${destinationDirectory?.key ?? ''}${fileData.name}`;

    const data = new FormData();
    data.append('part', uploadInfo.chunkBlob);
    data.append('fileName', key);
    data.append('uploadId', `${this.getUploadId(key)}`);
    data.append('partNumber', `${uploadInfo.chunkIndex}`);
    data.append('partSize', `${uploadInfo.chunkBlob.size}`);

    const requestOptions = {
      method: 'POST',
      body: data,
    };

    const etag = await this.makeRequest('uploadPart', params, requestOptions);
    // partNumber must be > 0
    this.addPartToUploadData(key, { PartNumber: uploadInfo.chunkIndex + 1, ETag: etag });
  }
  /* eslint-disable-next-line vue/max-len */
  async completeUpload(fileData: File, uploadInfo: UploadInfo, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    const key = `${destinationDirectory?.key ?? ''}${fileData.name}`;
    const params = {
      key,
      uploadId: this.getUploadId(key),
    };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(this.getParts(key)),
    };

    await this.makeRequest('completeUpload', params, requestOptions);
    this.removeUploadData(key);
  }
  /* eslint-disable-next-line vue/max-len */
  async abortFileUpload(fileData: File, uploadInfo: UploadInfo, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    const key = `${destinationDirectory?.key ?? ''}${fileData.name}`;
    const uploadId = this.getUploadId(fileData.name);
    const params = { uploadId, key };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };
    return this.makeRequest('abortUpload', params, requestOptions);
  }

  async makeRequest(method: string, queryParams: any, requestParams: RequestInit): Promise<any> {
    const requestUrl = this.getRequestUrl(method);
    const url = new URL(requestUrl);
    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));

    this.logRequest(method, url, requestUrl);
    try {
      const response = await fetch(url.toString(), requestParams);
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-return */
      return await this.getResponseData(response);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  getResponseData(response: Response): Promise<any | Blob | string> {
    if (this.containsAttachment(response)) {
      return response.blob();
    }
    if (this.containsPlainText(response)) {
      return response.text();
    }
    return response.json();
  }

  containsAttachment(response: Response): boolean {
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition?.includes('attachment')) {
      return true;
    }
    return false;
  }

  containsPlainText(response: Response): boolean {
    const contentType = response.headers.get('Content-Type');
    if (!contentType || contentType.includes('text/plain')) {
      return true;
    }
    return false;
  }
}
