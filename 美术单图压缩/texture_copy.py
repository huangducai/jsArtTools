#coding:utf-8
#文件里有非ASCII字符(中文注释)，需要在第一行或第二行指定编码声明

#Windows下把TexturePacker路径(C:\Program Files (x86)\CodeAndWeb\TexturePacker\bin)加入PATH
#分隔符使用os.sep，否则python脚本运行不正确
#安装python
#安装TexturePacker

#%0指批处理文件
#%~d0 指批处理文件所在的盘符
#%~dp0 指盘符加路径
#cd %~dp0 进入批处理文件所在目录
#texture_packer.bat
#C:/Python27/python.exe texture_packer.py
#
#pause

import os
import sys

#for i in range(0,5):
    #格式化字符串
    #imgFile1 = "GameUI%d.pvr.ccz " %(i, )
    #imgFile2 = "GameUI%d.png" %(i, )
import os
import shutil
import sys

for i in range(1, len(sys.argv)):
    print "参数", i, sys.argv[i]
exclude = ["Loading"];

def removeFileInFirstDir(targetDir):
     for file in os.listdir(targetDir): 
         targetFile = os.path.join(targetDir,  file) 
         if os.path.isfile(targetFile):
            print "删除" + targetFile
            os.remove(targetFile)


def coverFiles(sourceDir,  targetDir): 
        for file in os.listdir(sourceDir): 
            sourceFile = os.path.join(sourceDir,  file) 
            targetFile = os.path.join(targetDir,  file) 

            if os.path.isfile(sourceFile):
                print "拷贝" + sourceFile + "------->" + targetFile
                open(targetFile, "wb").write(open(sourceFile, "rb").read())
 
def generate(rootDir, plistFilePath,pngList):
    for imgName in pngList:
        names =  os.path.join(plistFilePath, imgName);
        nameArray = os.path.splitext(imgName)
        if not os.path.isdir(os.path.join(rootDir ,imgName)) and nameArray[1] == ".png":
            print "文件名字1111111---》"+ os.path.join(plistFilePath ,"1.plist") + "---->"
            cmd = 'TexturePacker ' + os.path.join(rootDir , imgName) + ' --smart-update --format cocos2d --opt RGBA5555 --allow-free-size \
                   --no-trim --disable-rotation --dither-fs-alpha --padding 0 \
                   --multipack --data ' +  os.path.join(plistFilePath ,"1.plist") + ' --sheet ' + names

            os.system(cmd)

    os.remove(os.path.join(plistFilePath ,"1.plist"));

def packetImage():
    #得到当前工作目录
    dirMu = sys.path[0]
    os.chdir(dirMu);
    rootDir = os.getcwd()
    pngList = os.listdir(rootDir)
    targetDir =  os.path.abspath('../../res')

    print "根目录" + rootDir + "目标目录" + targetDir
    #return;

    for dirName in pngList:
        if not dirName in exclude:
         
            if dirName.find("publish") != -1:
                print "文件名字---》"+ dirName
                continue
            plistFilePath = os.path.join(rootDir ,"publish" , dirName);
            if  os.path.isdir(os.path.join(rootDir , dirName)):
                if not os.path.exists(plistFilePath):
                    os.makedirs(plistFilePath)
                else:
                    if os.path.exists(plistFilePath):
                        shutil.rmtree(plistFilePath)
                        print "rm %s\n" %plistFilePath
                        os.makedirs(plistFilePath)
                generate(os.path.join(rootDir,dirName), plistFilePath, os.listdir(os.path.join(rootDir , dirName)));

    #for dirName in pngList:
     #   plistFilePath = os.path.join(rootDir ,dirName + "_Publish");
      #  if os.path.exists(plistFilePath):
       #     removeFileInFirstDir(os.path.join(targetDir , dirName))
           # coverFiles(os.path.join(rootDir , dirName), os.path.join(targetDir , dirName));
    #--opt RGBA8888 --allow-free-size --multipack --padding 0
    #--opt PVRTC4 没有--allow-free-size PVRTC4要求文件大小为2的幂次方 --padding 2
    #--premultiply-alpha在格式为PVRTC4时使用，否则会有黑影


if __name__ == '__main__':
    packetImage()
