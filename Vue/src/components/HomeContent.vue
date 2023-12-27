<script setup lang='ts'>
import { ref } from 'vue';
import type { Ref } from 'vue';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import { DxFileUploader } from 'devextreme-vue/file-uploader';
import { DxLoadPanel, DxPosition } from 'devextreme-vue/load-panel';
import { AzureGateway } from '../services/azure.gateway';
import type UploadInfo from 'devextreme/file_management/upload_info';
import type { AzureResponse } from '../services/app.service.types';

const endpointUrl = 'https://localhost:7021/api/file-uploader-azure-access';

const onRequestExecuted = (
  { method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }
) => {
  const request = { method, urlPath, queryString };
  requests.value = [request, ...requests.value];
};

const gateway: AzureGateway = new AzureGateway(endpointUrl, onRequestExecuted);

fetch('https://localhost:7021/api/file-azure-status?widgetType=fileUploader')
  .then((response) => response.json())
  .then((result) => {
    wrapperClassName.value = result.active ? 'show-widget' : 'show-message';
    loadPanelVisible.value = false;
  });

const uploadChunk = (file: File, uploadInfo: UploadInfo): Promise<AzureResponse> | null => {
  let promise = null;
  if (uploadInfo.chunkIndex === 0) {
    promise = gateway.getUploadAccessUrl(file.name).then((accessUrls) => {
      uploadInfo.customData.accessUrl = accessUrls.url1;
    });
  } else {
    promise = Promise.resolve();
  }
  promise = promise.then(() =>
    gateway.putBlock(uploadInfo.customData.accessUrl, uploadInfo.chunkIndex, uploadInfo.chunkBlob)
  );
  if (uploadInfo.chunkIndex === uploadInfo.chunkCount - 1) {
    promise = promise.then(
      () => gateway.putBlockList(uploadInfo.customData.accessUrl, uploadInfo.chunkCount)
    );
  }
  return promise;
};

const loadPanelVisible: Ref<boolean> = ref(true);
const wrapperClassName: Ref<string> = ref('');
const requests: Ref<{ method: string; urlPath: string; queryString: string }[]> = ref([]);
</script>
<template>
  <div
    id="wrapper"
    :class="wrapperClassName"
  >
    <DxLoadPanel
      v-model:visible="loadPanelVisible"
    >
      <DxPosition of="#file-uploader"/>
    </DxLoadPanel>
    <div id="widget-area">
      <DxFileUploader
        id="file-uploader"
        :chunk-size="200000"
        :max-file-size="1048576"
        :upload-chunk="uploadChunk"
      />
      <div id="request-panel">
        <div
          class="request-info"
          v-for="(request, index) in requests"
          :key="index"
        >
          <div class="parameter-info">
            <div class="parameter-name">Method:</div>
            <div class="parameter-value dx-theme-accent-as-text-color">
              {{ request.method }}
            </div>
          </div>
          <div class="parameter-info">
            <div class="parameter-name">Url path:</div>
            <div class="parameter-value dx-theme-accent-as-text-color">
              {{ request.urlPath }}
            </div>
          </div>
          <div class="parameter-info">
            <div class="parameter-name">Query string:</div>
            <div class="parameter-value dx-theme-accent-as-text-color">
              {{ request.queryString }}
            </div>
          </div>
          <br>
        </div>
      </div>
    </div>
    <div id="message-box">
      To run the demo locally, specify your Azure storage account name, access
      key and container name in the appsettings.json file in your back-end app.
    </div>
  </div>
</template>
<style>
  #widget-area {
    visibility: hidden;
  }

  #message-box {
    display: none;
  }

  .show-widget #widget-area {
    visibility: visible;
  }

  .show-message #widget-area {
    display: none;
  }

  .show-message #message-box {
    display: block;
  }

  #request-panel {
    min-width: 505px;
    height: 400px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 18px;
    margin-top: 40px;
    background-color: rgba(191, 191, 191, 0.15);
  }

  #request-panel .parameter-info {
    display: flex;
  }

  .request-info .parameter-name {
    flex: 0 0 100px;
  }

  .request-info .parameter-name,
  .request-info .parameter-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
