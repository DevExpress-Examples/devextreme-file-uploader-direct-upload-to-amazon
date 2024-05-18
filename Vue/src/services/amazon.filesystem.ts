import type FileSystemItem from 'devextreme/file_management/file_system_item';
import type UploadInfo from 'devextreme/file_management/upload_info';
import { saveAs } from 'file-saver';

import type { AmazonGateway } from './amazon.gateway';

export class AmazonFileSystem {
  gateway: AmazonGateway;

  constructor(amazonGateway: AmazonGateway) {
    this.gateway = amazonGateway;
  }

  async getItems(key: string): Promise<FileSystemItem[]> {
    return this.gateway.getItems(key) as Promise<FileSystemItem[]>;
  }

  async createDirectory(key: string, name: string): Promise<any> {
    return this.gateway.createDirectory(key, name);
  }

  async renameItem(key: string, path: string, name: string, newName: string): Promise<any> {
    const parentDirectory = path.replace(new RegExp(`${name}$`), '');
    const parentPath = parentDirectory.endsWith('/') ? parentDirectory : `${parentDirectory}/`;
    return this.gateway.renameItem(key, parentPath, newName);
  }

  async deleteItem(key: string): Promise<any> {
    return this.gateway.deleteItem(key);
  }

  async copyItem(item: FileSystemItem, destinationDirectory: FileSystemItem): Promise<any> {
    return this.gateway.copyItem(item.key, `${destinationDirectory.key}${item.name}`);
  }

  async moveItem(item: FileSystemItem, destinationDirectory: FileSystemItem): Promise<any> {
    return this.gateway.moveItem(item.key, `${destinationDirectory.key}${item.name}`);
  }

  async downloadItems(items: FileSystemItem[]): Promise<void> {
    const keys = items.map((x) => x.key);
    const fileName = keys.length > 1 ? 'archive.zip' : this.getFileNameFromKey(keys[0]);
    try {
      const blob = await this.gateway.downloadItems(keys);
      saveAs(new Blob([blob], { type: 'application/octet-stream' }), fileName);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getPresignedDownloadUrl(fileName: string): Promise<any> {
    return this.gateway.getPresignedDownloadUrl(fileName);
  }

  getFileNameFromKey(key: string): string {
    const index = key.lastIndexOf('/');
    if (index === -1) {
      return key;
    }
    return key.substring(index + 1);
  }
  /* eslint-disable-next-line vue/max-len */
  async abortFileUpload(fileData: File, uploadInfo: UploadInfo, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    await this.gateway.abortFileUpload(fileData, uploadInfo, destinationDirectory);
  }
  /* eslint-disable-next-line vue/max-len */
  async uploadFileChunk(fileData: File, uploadInfo: UploadInfo, destinationDirectory: FileSystemItem | undefined): Promise<any> {
    try {
      if (uploadInfo.chunkIndex === 0) {
        await this.gateway.initUpload(fileData, destinationDirectory);
      }

      await this.gateway.uploadPart(fileData, uploadInfo, destinationDirectory);

      if (uploadInfo.chunkCount === uploadInfo.chunkIndex + 1) {
        await this.gateway.completeUpload(fileData, uploadInfo, destinationDirectory);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
