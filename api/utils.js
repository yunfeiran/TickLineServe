const fs = require('fs');
/**
 * @param {string} url
 * @returns {Object}
 */
function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

//读文件
function readFile(fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function (error, response) {
        if (error) {
            reject(error)
        }else{
            resolve(response);
        }
    });
  })
}

//读目录
function readDir(currentDirPath) {
  return new Promise(function (resolve, reject) {
    fs.readdir(currentDirPath, function (error, response) {
        if (error) {
            reject(error)
        }else{
            resolve(response);
        }
    });
  })
}

//写入文件
function writeFile(fileName,content) {
  content = "'"+content+"'";
  return new Promise(function (resolve, reject) {
    fs.writeFile(fileName,content, function (error) {
        if (error) {
            reject(error)
        }else{
            resolve(true);
        }
    });
  })
}

//判断文件是否存在
function isFileExisted(url) {
  return new Promise(function(resolve, reject) {
      fs.access(url, (err) => {
          if (err) {
              reject(err);
          } else {
              resolve(true);
          }
      })
  })
}

module.exports = {
  param2Obj,
  deepClone,
  writeFile,
  isFileExisted,
  readDir,
  readFile
}
