'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var OSS = require('ali-oss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var OSS__default = /*#__PURE__*/_interopDefaultLegacy(OSS);

/**
 * 上传类。完整配置参数，自定义配置参数可覆盖默认配置参数
 * @param {number} partSize - required
 * @param {number} parallel - required
 * @param {string} region - required
 * @param {string} bucket - required
 * @param {function} getSts - required
 */

// * @param {string} path
class OssUpload {
  constructor(
    /**
     * 自定义配置参数
     */
    config = {}
  ) {
    console.log("js库：自定义配置参数", config);
    // 全部属性挂载到实例对象上
    Object.entries(config).map(cItem => {
      const key = cItem[0];
      const val = cItem[1];
      this[key] = val;
      return cItem;
    });

    /**
     * OSS Client 类参数
     * @key bucket
     * @key region
     * @key stsToken
     * @key accessKeyId
     * @key accessKeySecret
     */
    this.ossClientConfig = {
      bucket: config.bucket,
      region: config.region
    };

    if (!this.getSts) {
      throw new Error("getSts 方法缺失");
    }
  }

  /**
   * 异步函数，创建 ossClient 实例对象，用于初始化或短点续传（先检查 stsToken 是否过期）。需主动调用
   * @returns {Promise} ossClient 实例对象
   */
  async initOssClient() {
    console.log("js库：开始执行 oss 初始化");
    try {
      const { stsToken, accessKeyId, accessKeySecret } = await this.getSts();

      if (!stsToken) {
        return Promise.reject(
          new Error("缺少 stsToken 参数，没有访问 oss 权限")
        );
      }
      this.ossClientConfig = {
        ...this.ossClientConfig,
        stsToken,
        accessKeyId,
        accessKeySecret
      };

      this.ossClient = new OSS__default["default"](this.ossClientConfig);

      return Promise.resolve(this.ossClient);
    } catch (error) {
      return Promise.reject(error || "缺少 stsToken 参数，没有访问 oss 权限");
    }
  }
}

/**
 * 通过 input 节点id 获取 fileList 数组
 * @param {string} id 节点id
 * @returns {Array} fileList
 */
OssUpload.prototype.getFileListById = function (id) {
  if (id) {
    const inputDom = document.querySelector(`#${id}`);
    if (inputDom && inputDom.files) {
      if (inputDom.files.length) {
        return Array.from(inputDom.files);
      }
      throw new Error("文件不存在");
    } else {
      throw new Error("input节点不存在");
    }
  } else {
    throw new Error("缺少input节点id");
  }
};

/**
 * 分片上传
 * @param {string} path
 * @param {Buffer|File|Blob} file
 * @param {object} options
 * @returns {Promise}
 */
OssUpload.prototype.multipartUpload = async function (path, file, opt = {}) {
  if (!file) {
    return Promise.reject(new Error("文件不存在"));
  }
  console.log("js库：分片上传");

  const multipartUploadOptions = {
    parallel: this.parallel, // the number of parts to be uploaded in parallel
    partSize: this.partSize, // the suggested size for each part
    // progress(uploadProgress, uploadCheckpoint, uploadStatus) {
    //   console.log("js库：上传进度", uploadProgress);
    //   console.log("js库：上传文件", JSON.parse(JSON.stringify(uploadCheckpoint)));
    //   console.log("js库：上传状态", uploadStatus);

    //   this.tempUploadFile = uploadCheckpoint;
    // }, // the progress callback called after each successful upload of one part
    // checkpoint: "", // the checkpoint to resume upload, if this is provided, it will continue the upload from where interrupted, otherwise a new multipart upload will be created
    // meta: "",
    // mime: "",
    // callback() {
    //   console.log("js库：multipartUpload 函数 callback 回调参数", arguments);
    // }
    // headers: "",
    // timeout: "",
    // copyheaders: "",
    ...opt
  };

  try {
    return await this.ossClient.multipartUpload(
      path,
      file,
      multipartUploadOptions
    );
  } catch (error) {
    return Promise.reject(error);
  }
};

// 暂停分片上传
OssUpload.prototype.cancelUpload = function () {
  return this.ossClient.cancel();
};

/**
 * 恢复上传
 * @param {string} path
 * @param {Buffer|File|Blob} file
 * @returns {Promise}
 */
OssUpload.prototype.resumeUpload = async function (path, file, opt = {}) {
  if (!file) {
    return Promise.reject(new Error("文件不存在"));
  }

  // 重新创建 ossClient 实例对象
  await this.initOssClient();

  const resumeUpload = await this.multipartUpload(path, file, {
    // progress(uploadProgress, uploadCheckpoint, uploadStatus) {
    //   console.log("js库：重新上传进度", uploadProgress);
    //   console.log("js库：重新上传文件", JSON.parse(JSON.stringify(uploadCheckpoint)));
    //   console.log("js库：重新上传状态", uploadStatus);

    //   this.tempUploadFile = uploadCheckpoint;
    // },
    // checkpoint: this.tempUploadFile,
    ...opt
  });
  return resumeUpload;
};

/**
 * 定义并返回文件名
 * @param {*} file
 * @returns {string} fileName
 */
OssUpload.prototype.getFileName = function (file) {
  let result;

  if (!file) {
    throw new Error("文件不存在");
  }

  const timestamp = new Date().getTime();

  if (file.name) {
    const fileName = file.name;
    if (fileName.indexOf(".") === -1) {
      result = `${fileName}_${timestamp}.ybc`;
    } else {
      const startStr = fileName.slice(0, fileName.lastIndexOf("."));
      const endStr = fileName.slice(fileName.lastIndexOf(".") + 1);

      result = `${startStr}_${timestamp}.${endStr}`;
    }
  } else {
    result = `newfile_${timestamp}.ybc`;
  }
  return result;
};

exports.OssUpload = OssUpload;
