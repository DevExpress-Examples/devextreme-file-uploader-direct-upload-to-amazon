class AmazonFileSystem {
  gateway = null;

  constructor(baseUrl, onRequestExecuted) {
    this.gateway = new AmazonGateway(baseUrl, onRequestExecuted);
  }

  async getItems(path) {
    try {
      return await this.gateway.getItems(path);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, path, error.message);
    }
  }

  async createDirectory(key, name) {
    try {
      return await this.gateway.createDirectory(key, name);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, name, error.message);
    }
  }

  async renameItem(key, parentPath, name) {
    try {
      return await this.gateway.renameItem(key, `${parentPath}/`, name);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, key, error.message);
    }
  }

  async deleteItem(key) {
    try {
      return await this.gateway.deleteItem(key);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, key, error.message);
    }
  }

  async copyItem(item, destinationDir) {
    try {
      return await this.gateway.copyItem(item.key, `${destinationDir.key}${item.name}`);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, item.key, error.message);
    }
  }

  async moveItem(item, destinationDir) {
    try {
      return await this.gateway.moveItem(item.key, `${destinationDir.key}${item.name}`);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, item.key, error.message);
    }
  }

  async uploadFileChunk(fileData, uploadInfo, destinationDirectory) {
    try {
      if (uploadInfo.chunkIndex === 0) {
        await this.gateway.initUpload(fileData, destinationDirectory);
      }

      await this.gateway.uploadPart(fileData, uploadInfo, destinationDirectory);

      if (uploadInfo.chunkCount === uploadInfo.chunkIndex + 1) {
        await this.gateway.completeUpload(fileData, uploadInfo, destinationDirectory);
      }
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, fileData.name, error.message);
    }
  }

  async getPresignedDownloadUrl(fileName) {
    return await this.gateway.getPresignedDownloadUrl(fileName);
  }

  getFileNameFromKey(key) {
    const index = key.lastIndexOf('/');
    if (index === -1) {
      return key;
    }
    return key.substring(index + 1);
  }

  async downloadItems(items) {
    const keys = items.map((x) => x.key);
    const fileName = keys.length > 1 ? 'archive.zip' : this.getFileNameFromKey(keys[0]);
    try {
      const blob = await this.gateway.downloadItems(keys);
      saveAs(new Blob([blob], { type: 'application/octet-stream' }), fileName);
    } catch (error) {
      throw new DevExpress.fileManagement.FileSystemError(32767, fileName, error.message);
    }
  }
}
