class AzureFileSystem {
  constructor(azureGateway) {
    this.gateway = azureGateway;
    this.EMPTY_DIR_DUMMY_BLOB_NAME = 'aspxAzureEmptyFolderBlob';
  }

  getItems(path) {
    const prefix = this.getDirectoryBlobName(path);
    return this.gateway.getBlobList(prefix)
      .then((entries) => this.getDataObjectsFromEntries(entries, prefix));
  }

  createDirectory(path, name) {
    const blobName = path ? `${path}/${name}` : name;
    return this.gateway.createDirectoryBlob(blobName);
  }

  renameFile(path, name) {
    const newPath = this.getPathWithNewName(path, name);
    return this.moveFile(path, newPath);
  }

  renameDirectory(path, name) {
    const newPath = this.getPathWithNewName(path, name);
    return this.moveDirectory(path, newPath);
  }

  getPathWithNewName(path, name) {
    const parts = path.split('/');
    parts[parts.length - 1] = name;
    return parts.join('/');
  }

  deleteFile(path) {
    return this.gateway.deleteBlob(path);
  }

  deleteDirectory(path) {
    const prefix = this.getDirectoryBlobName(path);
    return this.executeActionForEachEntry(prefix, (entry) => this.gateway.deleteBlob(entry.name));
  }

  copyFile(sourcePath, destinationPath) {
    return this.gateway.copyBlob(sourcePath, destinationPath);
  }

  copyDirectory(sourcePath, destinationPath) {
    const prefix = this.getDirectoryBlobName(sourcePath);
    const destinationKey = this.getDirectoryBlobName(destinationPath);
    // eslint-disable-next-line max-len
    return this.executeActionForEachEntry(prefix, (entry) => this.copyEntry(entry, prefix, destinationKey));
  }

  copyEntry(entry, sourceKey, destinationKey) {
    const restName = entry.name.substr(sourceKey.length);
    const newDestinationKey = destinationKey + restName;
    return this.gateway.copyBlob(entry.name, newDestinationKey);
  }

  moveFile(sourcePath, destinationPath) {
    return this.gateway.copyBlob(sourcePath, destinationPath)
      .then(() => this.gateway.deleteBlob(sourcePath));
  }

  moveDirectory(sourcePath, destinationPath) {
    const prefix = this.getDirectoryBlobName(sourcePath);
    const destinationKey = this.getDirectoryBlobName(destinationPath);
    // eslint-disable-next-line max-len
    return this.executeActionForEachEntry(prefix, (entry) => this.copyEntry(entry, prefix, destinationKey).then(() => this.gateway.deleteBlob(entry.name)));
  }

  downloadFile(path) {
    this.gateway.getBlobUrl(path).then((accessURLs) => {
      window.location.href = accessURLs.url1;
    });
  }

  executeActionForEachEntry(prefix, action) {
    return this.gateway.getBlobList(prefix).then((entries) => {
      const deferreds = entries.map((entry) => action(entry));
      return Promise.all(deferreds);
    });
  }

  getDataObjectsFromEntries(entries, prefix) {
    const result = [];
    const directories = {};
    entries.forEach((entry) => {
      const restName = entry.name.substr(prefix.length);
      const parts = restName.split('/');
      if (parts.length === 1) {
        if (restName !== this.EMPTY_DIR_DUMMY_BLOB_NAME) {
          const obj = {
            name: restName,
            isDirectory: false,
            dateModified: entry.lastModified,
            size: entry.length,
          };
          result.push(obj);
        }
      } else {
        const dirName = parts[0];
        let directory = directories[dirName];
        if (!directory) {
          directory = {
            name: dirName,
            isDirectory: true,
          };
          directories[dirName] = directory;
          result.push(directory);
        }
        if (!directory.hasSubDirectories) {
          directory.hasSubDirectories = parts.length > 2;
        }
      }
    });
    result.sort(this.compareDataObjects);
    return result;
  }

  compareDataObjects(obj1, obj2) {
    if (obj1.isDirectory === obj2.isDirectory) {
      const name1 = obj1.name.toLowerCase();
      const name2 = obj2.name.toLowerCase();
      if (name1 < name2) {
        return -1;
      }
      return name1 > name2 ? 1 : 0;
    }
    return obj1.isDirectory ? -1 : 1;
  }

  getDirectoryBlobName(path) {
    return path ? `${path}/` : path;
  }
}
