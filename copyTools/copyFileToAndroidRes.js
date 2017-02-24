/**
 * Created by huangducai on 16/9/12.
 */


var fs = require('fs');

var _ = require('underscore');
var resGenPath = '../../../svn/client_res';
var writePath = '../../../svn/androidRes/resCopy';

var hebingMulu = '../../../svn/androidRes/hebingMulu';
var yasuohou = '../../../svn/androidRes/yasuohou';

var shangchuanmulu = '../../../svn/androidRes/shangchuanmulu';

var writeFileName = 'copyConfig.json';

var child_process = require('child_process');

function removeDir(path, callBack) {
    if (!fs.existsSync(path)) {
        if (callBack) {
            callBack();
        }
        return;
    }

    var commond = 'rm -rf yyyy';
    commond = commond.replace('yyyy', path);
    var child = child_process.exec(commond);

    child.stdout.on('data', function (data) {
        console.log(data);
    });
    child.stderr.on('data', function (data) {
        console.log(data);
    });
    child.on('exit', function (code) {
        // console.log('生成Zip文件' + code);
        if (callBack) {
            callBack();
        }
    });
}


//md5
var crypto = require('crypto');
var async = require('async');


// 把 所有的资源 拷贝到一个副本

//遍历文件夹，获取所有文件夹里面的文件信息
function geFileList(path) {
    var filesList = [];
    readFile(path, filesList);
    return filesList;
}
//遍历读取文件
function readFile(path, filesList) {
    var files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(walk);
    function walk(file) {
        var states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            readFile(path + '/' + file, filesList);
        }
        else {
            //创建一个对象保存信息
            var obj = new Object();
            obj.size = states.size;//文件大小，以字节为单位
            obj.name = file;//文件名
            obj.path = path + '/' + file; //文件绝对路径
            obj.pathOnly = path;
            obj.states = states;
            filesList.push(obj);
            // console.log(' states = ' + JSON.stringify(states, null, 4));
            //     "dev": 16777224,
            //     "mode": 33188,
            //     "nlink": 1,
            //     "uid": 503,
            //     "gid": 20,
            //     "rdev": 0,
            //     "blksize": 4096,
            //     "ino": 15409925,
            //     "size": 372,
            //     "blocks": 8,
            //     "atime": "2016-09-09T09:36:47.000Z",
            //     "mtime": "2016-07-29T02:19:10.000Z",
            //     "ctime": "2016-07-29T02:19:10.000Z",
            //     "birthtime": "2016-07-29T02:19:10.000Z"
        }
    }
}
/**
 * 仅仅是创建目录
 * @param path
 */
function createDirByPath(path) {
    path = path.split('/');
    var genPath = '';
    _.forEach(path, function (dirName) {
        genPath += dirName;
        if (!fs.existsSync(genPath)) {
            fs.mkdirSync(genPath);
        }
        genPath += '/';
    });
}
var currFileList = geFileList(resGenPath);

//拷贝资源过去
function copyFile(copyPath, writePath) {
    //    todo copy
    var readable = fs.createReadStream(copyPath);// 创建读取流
    var writable = fs.createWriteStream(writePath); // 创建写入流
    readable.pipe(writable); // 通过管道来传输流
}

function writeFile(path, fileName, content, cb) {
    createDirByPath(path);
    var allPath = path + '/' + fileName;
    fs.writeFile(allPath, content, function (err) {
        if (err) {
            console.log("fail " + err);
        }
        if (cb) {
            cb();
        }
    });
}

function getFileMd5(path, callBack) {
    if (!fs.existsSync(path)) {
        if (callBack) {
            callBack();
        }
        return;
    }
    var md5sum = crypto.createHash('md5');
    //todo 生成文件的md5 码
    var startTime = new Date().getTime();
    var stream = fs.createReadStream(path);
    stream.on('data', function (chunk) {
        md5sum.update(chunk);
    });

    stream.on('end', function () {
        var str = md5sum.digest('hex').toUpperCase();
        var endTime = new Date().getTime();
        // console.log('文件:' + path + ',MD5签名为:' + str + '.耗时:' + (endTime - startTime) / 1000.00 + "秒");
        if (callBack) {
            callBack(str);
        }
    });
}

function androidResCopy() {

    async.series({
        removeDir: function (callBack) {
            removeDir(hebingMulu, callBack);
        },

        createNeedPath: function (callBack) {
            /**
             * 创建需要的目录
             */
            createDirByPath(writePath);
            createDirByPath(hebingMulu);
            createDirByPath(shangchuanmulu);
            createDirByPath(yasuohou);
            callBack();
        },

        copyChangedRes: function (copyChangedResCallBack) {
            var index = 0;
            async.eachSeries(currFileList, function (currFilePathObj, callBack) {
                index++;
                if (index >= currFileList.length) {
                    setTimeout(function () {
                        copyChangedResCallBack();
                    }, 1000);
                }
                // console.log('index111111 = ' + index + 'len = ' + currFileList.length);

                if (
                    !(currFilePathObj.name.toUpperCase().indexOf('.JPG') != -1 ||
                        currFilePathObj.name.toUpperCase().indexOf('.PNG') != -1
                    )
                ) {
                    if (callBack) {
                        callBack();
                    }
                    return;
                }

                var currFilePath = currFilePathObj.pathOnly;
                createDirByPath(writePath + '/' + currFilePath.split(resGenPath)[1]);
                //保证所有的目录
                var path = currFilePathObj.path.split(resGenPath)[1];//文件路径
                // var md5List = [];
                var writeFilePath = writePath + '/' + path;
                var hebingMuluFile = hebingMulu + '/' + currFilePathObj.name;

                copyFile(currFilePathObj.path, hebingMuluFile);
                copyFile(currFilePathObj.path, writeFilePath);
                if (callBack) {
                    callBack();
                }
                // if (fs.existsSync(writeFilePath)) {
                //     async.series({
                //         getWriteMd5: function (cb) {
                //             getFileMd5(writeFilePath, function (md5Str) {
                //                 md5List.push(md5Str);
                //                 cb();
                //             });
                //         },
                //         getCopyMd5: function (cb) {
                //             getFileMd5(currFilePathObj.path, function (md5Str) {
                //                 md5List.push(md5Str);
                //                 cb();
                //             });
                //         }
                //
                //     }, function () {
                //         //
                //         console.log(currFilePathObj.path + ' -----》' + writeFilePath);
                //         if (md5List[0] != md5List[1]) {
                //             // console.log('--------- 文件不一样的 --------');
                //             copyFile(currFilePathObj.path, writeFilePath);
                //         } else {
                //             // console.log('--------- 文件一样的 --------');
                //         }
                //         if (callBack) {
                //             callBack();
                //         }
                //     })
                // } else {
                //     copyFile(currFilePathObj.path, writeFilePath);
                //     if (callBack) {
                //         callBack();
                //     }
                // }
                // console.log('index = ' + index + 'len = ' + currFileList.length);
            });
        }
    })
}

//将生成的资源 还原到 上传目录

function copyHebingToShangchuan() {
    //从压缩后的 放到 上传中去
    /**
     * 移除原来的文件
     */
    removeDir(shangchuanmulu, function () {
        createDirByPath(shangchuanmulu);
        //把所有的压缩资源 还原到对应的文件夹 怎么还原 重新读取一次呗
        //对整个工程下得 所有的文件 进行一次copy
        var yuanlaiFileList = geFileList(resGenPath);
        async.eachSeries(yuanlaiFileList, function (resObjPath, callBack) {
            var genFilePath = resObjPath.pathOnly;
            /**
             * 创建所有的文件夹
             */
            createDirByPath(shangchuanmulu + '/' + genFilePath.split(resGenPath)[1]);
            /**
             * 如果压缩后 存在这样的名字的图片的话
             */
            var filePath = yasuohou + '/' + resObjPath.name;
            if (fs.existsSync(filePath)) {
                copyFile(filePath, shangchuanmulu + '/' + resObjPath.path.split(resGenPath)[1]);
            }
            callBack();
        });
    })
}

//node ***.js 1
if (process.argv[2]) {
    switch (process.argv[2]) {
        case '1':
            androidResCopy();
            break;

        case '2':
            copyHebingToShangchuan();
            break;
    }
}








