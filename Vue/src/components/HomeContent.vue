<script setup lang='ts'>
import { ref } from 'vue';
import type { Ref } from 'vue';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import { DxFileUploader } from 'devextreme-vue/file-uploader';
import { DxLoadPanel, DxPosition } from 'devextreme-vue/load-panel';
import { AmazonGateway } from '../services/amazon.gateway';
import { AmazonFileSystem } from '@/services/amazon.filesystem';
import type { UploadedEvent } from 'devextreme/ui/file_uploader';
import type UploadInfo from 'devextreme/file_management/upload_info';

const endpointUrl = 'https://localhost:52366/api/AmazonS3';

const onRequestExecuted = (
  { method, urlPath, queryString }: { method: string; urlPath: string; queryString: string }
) => {
  const request = { method, urlPath, queryString };
  requests.value = [request, ...requests.value];
};

const gateway: AmazonGateway = new AmazonGateway(endpointUrl, onRequestExecuted);
const amazon: AmazonFileSystem = new AmazonFileSystem(gateway);

fetch('https://localhost:52366/api/AmazonS3/getItems')
  .then((response) => response.json())
  .then((result) => {
    result.active = true;
    wrapperClassName.value = result.active ? 'show-widget' : 'show-message';
    loadPanelVisible.value = false;
  });

const uploadChunk = async (file: File, uploadInfo: UploadInfo): Promise<any> => {
  await amazon.uploadFileChunk(file, uploadInfo, undefined);
};

const onValueChangedEvent = (): void => {
  downloadPanelVisible.value = false;
  downloadFileName.value = '';
  downloadUrl.value = '';
};

const onUploaded = async (e: UploadedEvent): Promise<any> => {
  const url = await amazon.getPresignedDownloadUrl(e.file.name);
  downloadFileName.value = e.file.name;
  downloadUrl.value = url;
  downloadPanelVisible.value = true;
}

const loadPanelVisible: Ref<boolean> = ref(true);
const wrapperClassName: Ref<string> = ref('');
const downloadPanelVisible: Ref<boolean> = ref(false);
const downloadUrl: Ref<string> = ref('');
const downloadFileName: Ref<string> = ref('');
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
      <DxPosition of="#widget-area"/>
    </DxLoadPanel>
    <div id="widget-area">
      <DxFileUploader
        id="file-uploader"
        :chunk-size="5242880"
        :upload-chunk="uploadChunk"
        @valueChanged="onValueChangedEvent"
        @uploaded="onUploaded"
      />
      <div v-if="downloadPanelVisible">
        <span>Download uploaded file:</span>
        <a :href="downloadUrl" target="_blank">{{ downloadFileName }}</a>
      </div>
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
      To run the demo locally, specify your Amazon access key, secret
      key, region and bucket name in the appsettings.json file in the back-end app.
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
