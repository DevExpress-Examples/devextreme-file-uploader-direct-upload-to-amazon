class AmazonFileSystem {
  gateway = null;

  constructor(baseUrl, onRequestExecuted) {
    this.gateway = new AmazonGateway(baseUrl, onRequestExecuted);
  }

  getItems(path) {
    return this.gateway.getItems(path);
  }

  createDirectory(key, name) {
    return this.gateway.createDirectory(key, name);
  }

  renameItem(key, parentPath, name) {
    return this.gateway.renameItem(key, `${parentPath}/`, name);
  }

  deleteItem(key) {
    return this.gateway.deleteItem(key);
  }

  copyItem(item, destinationDir) {
    return this.gateway.copyItem(item.key, `${destinationDir.key}${item.name}`);
  }

  moveItem(item, destinationDir) {
    return this.gateway.moveItem(item.key, `${destinationDir.key}${item.name}`);
  }

  async abortFileUpload(fileData, uploadInfo, destinationDirectory) {
    await this.gateway.abortFileUpload(fileData, uploadInfo, destinationDirectory);
  }

  async uploadFileChunk(fileData, uploadInfo, destinationDirectory) {
    if (uploadInfo.chunkIndex === 0) {
      await this.gateway.initUpload(fileData, destinationDirectory);
    }
    // upload part even if a chunk is first or last
    await this.gateway.uploadPart(fileData, uploadInfo, destinationDirectory);

    if (uploadInfo.chunkCount === uploadInfo.chunkIndex + 1) {
      await this.gateway.completeUpload(fileData, uploadInfo, destinationDirectory);
    }
  }

  /* eslint-disable-next-line spellcheck/spell-checker */
  async getPresignedDownloadUrl(fileName) {
    /* eslint-disable-next-line spellcheck/spell-checker */
    return this.gateway.getPresignedDownloadUrl(fileName);
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
    const blob = await this.gateway.downloadItems(keys);
    saveAs(new Blob([blob], { type: 'application/octet-stream' }), fileName);
  }
}
