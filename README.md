## 画图板微信小程序
数字图像处理课程画图板的作业，支持简单的画图以及部分图片美化。</br>
### 主要功能
* 画图板小程序在第一版中主要包括绘图、图片涂鸦、图片美化三个功能。</br>绘图功能可以自定义画笔的大小及颜色，支持撤销和橡皮擦操作。图片涂鸦在绘图功能的基础上加入了图片上传与本地保存的功能。图片美化功能主要包括高斯模糊和黑白化，实现了对画布内容及上传图片的美化，并支持画布的本地存储。
* 第二版中加入了一个功能的悬浮框，和简单人脸识别功能。
### 存在问题
1、高斯模糊之后使用黑白化操作会导致使用撤销功能时出现闪退情况，但是这个问题在开发工具的模拟器中未出现。</br>
2、在黑白化中存在部分未渲染情况。通过采取对画布的分批处理，已经解决了这个问题。</br>
3、悬浮框移动不够流畅，没能搞定这个问题。</br>
3、项目UI存在不够美观情况，UI设计师正在努力学习提高自己的审美水平。
