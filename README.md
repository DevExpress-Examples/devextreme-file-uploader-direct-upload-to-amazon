<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/800447205/23.1.3%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1233410)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
[![](https://img.shields.io/badge/💬_Leave_Feedback-feecdd?style=flat-square)](#does-this-example-address-your-development-requirementsobjectives)
<!-- default badges end -->
# DevExtreme FileUploader - Direct Upload to Amazon

The DevExtreme FileUploader component supports direct-upload to the Amazon Simple Storage Service. This example configures the [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk) property to upload large files directly to Amazon Simple Storage Service (S3) without using a web server. All APIs used to access Amazon Simple Storage Service (S3) on the client are stored in `amazon.file.system.j`s and `amazon.gateway.js` files.

**IMPORTANT**

The code snippets in this repository are for informational purposes only. Security should be your #1 priority when using Amazon S3 storage. You should consult a security expert or apply accepted best practices to maintain the highest security posture for your DevExtreme-powered web application. Remember, a secure web app demands careful consideration/understanding of potential attack vectors, the configuration of your development environment, and security posture of third-party service providers.

To implement file upload logic, use the [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk) property (to process connection requests to the storage service).

## Files to Review

- **jQuery**
    - [index.js](jQuery/src/index.js)
- **Angular**
    - [app.component.html](Angular/src/app/app.component.html)
    - [app.component.ts](Angular/src/app/app.component.ts)
- **Vue**
    - [Home.vue](Vue/src/components/HomeContent.vue)
- **React**
    - [App.tsx](React/src/App.tsx)
- **NetCore**    
    - [Index.cshtml](ASP.NET%20Core/Views/Home/Index.cshtml)

## Documentation

- [FileUploader Overview](https://js.devexpress.com/Angular/Documentation/Guide/UI_Components/FileUploader/Overview/)
- [uploadChunk](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxFileUploader/Configuration/#uploadChunk)

## More Examples

- [FileManager for DevExtreme - Amazon S3 Client-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-amazon-client-side-binding)
- [FileManager for DevExtreme - Azure Client-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-azure-client-side-binding)
- [FileManager for DevExtreme - Azure Server-Side Binding](https://github.com/DevExpress-Examples/devextreme-file-manager-azure-server-side-binding)
- [FileUploader for DevExtreme - Direct Upload to Azure](https://github.com/DevExpress-Examples/devextreme-file-uploader-direct-upload-to-azure)
<!-- feedback -->
## Does this example address your development requirements/objectives?

[<img src="https://www.devexpress.com/support/examples/i/yes-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-file-uploader-direct-upload-to-amazon&~~~was_helpful=yes) [<img src="https://www.devexpress.com/support/examples/i/no-button.svg"/>](https://www.devexpress.com/support/examples/survey.xml?utm_source=github&utm_campaign=devextreme-file-uploader-direct-upload-to-amazon&~~~was_helpful=no)

(you will be redirected to DevExpress.com to submit your response)
<!-- feedback end -->
