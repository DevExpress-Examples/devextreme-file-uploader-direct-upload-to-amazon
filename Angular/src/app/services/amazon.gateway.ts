import FileSystemItem from 'devextreme/file_management/file_system_item';
import UploadInfo from 'devextreme/file_management/upload_info';
import { UploadData, Part } from './app.service.types';

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
    return this.makeRequestAsync('getItems', params, requestParams);
  }

  async createDirectory(path: string, name: string): Promise<void> {
    const params = { path, name };
    const requestParams = { method: 'PUT' };
    await this.makeRequestAsync('createDirectory', params, requestParams);
  }

  async renameItem(key: string, parentPath: string, name: string): Promise<any> {
    const params = { key, directory: parentPath, newName: name };
    const requestParams = { method: 'PUT' };
    await this.makeRequestAsync('renameItem', params, requestParams);
  }

  async deleteItem(key: string): Promise<any> {
    const params = { item: key };
    const requestParams = { method: 'POST' };
    await this.makeRequestAsync('deleteItem', params, requestParams);
  }

  async copyItem(sourceKey: string, destinationKey: string): Promise<any> {
    const params = { sourceKey, destinationKey };
    const requestParams = { method: 'PUT' };
    await this.makeRequestAsync('copyItem', params, requestParams);
  }

  async moveItem(sourceKey: string, destinationKey: string): Promise<any> {
    const params = { sourceKey, destinationKey };
    const requestParams = { method: 'POST' };
    await this.makeRequestAsync('moveItem', params, requestParams);
  }

  async downloadItems(keys: string[]): Promise<any> {
    const params = {};
    const requestParams = { method: 'POST', body: JSON.stringify(keys), headers: this.defaultHeaders };
    return this.makeRequestAsync('downloadItems', params, requestParams);
  }

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

    const etag = await this.makeRequestAsync('uploadPart', params, requestOptions);
    // partNumber must be > 0
    this.addPartToUploadData(key, { PartNumber: uploadInfo.chunkIndex + 1, ETag: etag });
  }

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

    await this.makeRequestAsync('completeUpload', params, requestOptions);
    this.removeUploadData(key);
  }

  async initUpload(fileData: File, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    const params = { key: `${destinationDirectory?.key ?? ''}${fileData.name}` };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };

    const uploadId = await this.makeRequestAsync('initUpload', params, requestOptions);
    this.initUploadData(params.key, uploadId);
  }

  async getPresignedDownloadUrl(fileName: string): Promise<any> {
    const params = { key: fileName };
    const requestOptions = {
      method: 'POST',
      headers: this.defaultHeaders,
    };
    return this.makeRequestAsync('getPresignedDownloadUrl', params, requestOptions);
  }

  async makeRequestAsync(method: string, queryParams: any, requestParams: RequestInit): Promise<any> {
    const requestUrl = this.getRequestUrl(method);
    const url = new URL(requestUrl);
    Object.keys(queryParams).forEach((key) => url.searchParams.append(key, queryParams[key]));

    if (this.onRequestExecuted) {
      const params = {
        method,
        urlPath: requestUrl,
        queryString: url.toString().replace(requestUrl, ''),
      };
      this.onRequestExecuted(params);
    }
    const response = await fetch(url.toString(), requestParams);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition?.includes('attachment')) {
      // processing downloadItems request
      return response.blob();
    }
    const contentType = response.headers.get('Content-Type');
    if (!contentType || contentType.includes('text/plain')) {
      return response.text();
    }
    return response.json();
  }
}
