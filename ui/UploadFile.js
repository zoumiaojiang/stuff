/**
 * 文件上传控件
 * 
 * @file ./UploadFile.js
 * @author [zoumiaojiang@baidu.com]
 */

define(function (require) {
    
    function UploadFile() {
        this.frameId = ''; 
    };

    function createUploadIframe(id) {

        var frameId = 'ui_upload_file_iframe' + id;
        var iframe = document.createElement('iframe');
        
        iframe.id = frameId;
        iframe.name = frameId;
        iframe.src = uri;
        iframe.style.position = 'absolute';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';

        document.body.appendChild(iframe);

        return iframe;
    }

    function createUploadForm(id, fileElementId) {
        var formId = 'ui_upload_file_form' + id;
        var fildId = 'ui_upload_file' + id;
    }

});