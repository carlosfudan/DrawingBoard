var datautil = require('../../data/keys.js');
Page({
  data: {
    key: '',
    tip: '',
    keyList: null,
    selectedTap: 0,
    colorList: null,
    penWidth: 2,
    penColor: '',
    isClear: false,
    colorIndex: 0,
    old_color: "#000000",
    color: "#000000",
    old_pandWidth: 6,
    pandWidth: 6,
    revoke: [],
    left:270,
    top:400,
    menulist: [
      {
        "id": "1",
        "url": "../../images/gauss.png",
        "title": "高斯模糊",
      },
      {
        "id": "2",
        "url": "../../images/gauss.png",
        "title": "人脸识别",
      },
      {
        "id": "3",
        "url": "../../images/blackwhite.png",
        "title": "黑白化",
      },
    ],
    mainmodel: {
      "url": "../../images/home.png",
      "title": "菜单",
    }
  },
  onLoad: function(options) {
    var that = this;
    var colorList = datautil.penColorList
    var colorIndex = this.data.colorIndex;
    this.setData({
      colorList: colorList,
      keyList: datautil.keys,
      penColor: colorList[colorIndex],
    })
    that.randomKey();
  },
  onReady: function() {
    var that = this;
    this.context = wx.createCanvasContext('myCanvas');
    this.context.setFillStyle('white')
    this.context.fillRect(0, 0, 750, 600)
    this.context.draw()
    //2.获取缓存的草稿，并画出
    var draft = wx.getStorageSync("draft");
    if (draft && draft.length > 0) {
      wx.showModal({
        title: "提示",
        content: "最近有未保存的草稿，是否要继续上次的创作？",
        confirmText: "继续",
        success: function(e) {
          if (e.confirm) {
            that.actions = draft;
            wx.drawCanvas({
              canvasId: "myCanvas",
              actions: that.actions,
              reserve: false
            });
            var key = wx.getStorageSync("guess-key");
            var tip = wx.getStorageSync("guess-tip");
            that.setData({
              key: key,
              tip: tip
            })
          } else {
            //点取消点时候删除草稿
            wx.removeStorageSync('draft')
          }
        }
      })
    }
  },
  startX: 0,
  startY: 0,
  begin: false,
  actions: [],
  touchStart: function(e) {
    this.setStyle();
    this.startX = e.changedTouches[0].x;
    this.startY = e.changedTouches[0].y;
    this.context.beginPath();
    var revoke = this.data.revoke;
    revoke.push(this.actions.length);
    this.setData({
      revoke: revoke
    });
    var actions = this.context.getActions();
    this.actions = this.actions.concat(actions);
    wx.setStorageSync('draft', this.actions)
    wx.drawCanvas({
      canvasId: "myCanvas",
      actions: actions,
      reserve: true
    })
  },
  touchMove: function(e) {
    this.context.moveTo(this.startX, this.startY);
    this.startX = e.changedTouches[0].x;
    this.startY = e.changedTouches[0].y;
    this.context.lineTo(this.startX, this.startY);
    this.context.stroke();
    var actions = this.context.getActions();
    this.actions.push(actions[0]);
    wx.drawCanvas({
      canvasId: 'myCanvas',
      reserve: true,
      actions: actions
    })
  },
  touchEnd: function(e) {
    wx.setStorageSync('draft', this.actions)
  },
  revokeCanvas: function() {
    var revoke = this.data.revoke;
    if (revoke.length != 0) {
      wx.drawCanvas({
        canvasId: "myCanvas",
        actions: [],
        reserve: false
      });
      this.actions = this.actions.slice(0, revoke[revoke.length - 1]);
      wx.drawCanvas({
        canvasId: "myCanvas",
        actions: this.actions,
        reserve: true
      })
      revoke.pop();
      wx.setStorageSync('draft', this.actions)
      this.setData({
        revoke: revoke
      })
    }
  },

  drawimage: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: "compressed",
      sourceType: ["album", "camera"],
      success: function(res) {
        var width = 0;
        var height = 0;
        const path = res.tempFilePaths[0];
        //context.drawImage(path, 0, 0, 250, 500);
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function(res) {
            width = res.width;
            height = res.height;
            if (width <= 320 && height <= 300) {
              height = height;
              width = width;
            } else if (width / height > 16 / 15) {
              height = height * 320 / width;
              width = 320;
            } else {
              width = width * 300 / height;
              height = 300;
            };
            that.context.drawImage(path, 0, 0, width, height);
            var revoke = that.data.revoke;
            revoke.push(that.actions.length);
            that.setData({
              revoke: revoke
            });
            var actions = that.context.getActions();
            that.actions.push(actions[0]);
            wx.setStorageSync('draft', that.actions)
            wx.drawCanvas({
              canvasId: "myCanvas",
              actions: actions,
              reserve: true
            })
          },
        });
      }
    })
  },
  bw: function(imgData) {
    var i, len, red, green, blue, alpha, average;
    for (i = 0, len = imgData.length; i < len; i += 4) {
      red = imgData[i];
      green = imgData[i + 1];
      blue = imgData[i + 2];
      alpha = imgData[i + 3];
      average = Math.floor((red + green + blue) / 3);
      imgData[i] = average;
      imgData[i + 1] = average;
      imgData[i + 2] = average;
    }
    return imgData;
  },
  blackwhite: function() {
    var that = this;
    wx.canvasGetImageData({
      canvasId: 'myCanvas',
      x: 0,
      y: 0,
      width: 320,
      height: 300,
      success(res) {
        const data = that.bw(res.data)

        wx.canvasPutImageData({
          canvasId: 'myCanvas',
          x: 0,
          y: 0,
          width: 320,
          height: 300,
          data: data,
          success(res) {
            var revoke = that.data.revoke;
            revoke.push(that.actions.length);
            that.setData({
              revoke: revoke
            });
            var actions = that.context.getActions();
            that.actions.push(actions[0]);
            wx.setStorageSync('draft', that.actions)
          }
        })
      }
    })
  },
  json2form: function(jsonobj) {
    var str = [];
    for (var p in jsonobj) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(jsonobj[p]));
    }
    return str.join("&");
  },
  face: function() {
    var that = this;
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: 'http://127.0.0.1:5000/upload', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'user': 'test'
          },
          success(res) {
            console.log(res.data)
            wx.downloadFile({
              url: 'http://127.0.0.1:5000/down/'+res.data, 
              success(res) {
                console.log(res.tempFilePath)
                if (res.statusCode === 200) {
                  wx.playVoice({
                    filePath: res.tempFilePath
                  })
                }
                var width = 0;
                var height = 0;
                const path = res.tempFilePath;
                wx.getImageInfo({
                  src: res.tempFilePath,
                  success: function (res) {
                    width = res.width;
                    height = res.height;
                    if (width <= 320 && height <= 300) {
                      height = height;
                      width = width;
                    } else if (width / height > 16 / 15) {
                      height = height * 320 / width;
                      width = 320;
                    } else {
                      width = width * 300 / height;
                      height = 300;
                    };
                    that.context.drawImage(path, 0, 0, width, height);
                    var actions = that.context.getActions();
                    that.actions.push(actions[0]);
                    wx.drawCanvas({
                      canvasId: "myCanvas",
                      actions: actions,
                      reserve: true
                    })
                  },
                });
              }
            })
          },
          fail:function(res){
            console.log('no')
          },
        })
      }
    })
  },
  gaussblur: function(imgData) {
    var pixes = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var gaussMatrix = [],
      gaussSum = 0,
      x, y,
      r, g, b, a,
      i, j, k, len;

    var radius = 20;
    var sigma = 1;

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    b = -1 / (2 * sigma * sigma);
    //生成高斯矩阵
    for (i = 0, x = -radius; x <= radius; x++, i++) {
      g = a * Math.exp(b * x * x);
      gaussMatrix[i] = g;
      gaussSum += g;

    }
    //归一化, 保证高斯矩阵的值在[0,1]之间
    for (i = 0, len = gaussMatrix.length; i < len; i++) {
      gaussMatrix[i] /= gaussSum;
    }
    //x 方向一维高斯运算
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = x + j;
          if (k >= 0 && k < width) { //确保 k 没超出 x 的范围
            //r,g,b,a 四个一组
            i = (y * width + k) * 4;
            r += pixes[i] * gaussMatrix[j + radius];
            g += pixes[i + 1] * gaussMatrix[j + radius];
            b += pixes[i + 2] * gaussMatrix[j + radius];
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
        // console.log(gaussSum)
        pixes[i] = r / gaussSum;
        pixes[i + 1] = g / gaussSum;
        pixes[i + 2] = b / gaussSum;
        // pixes[i + 3] = a ;
      }
    }
    //y 方向一维高斯运算
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = y + j;
          if (k >= 0 && k < height) { //确保 k 没超出 y 的范围
            i = (k * width + x) * 4;
            r += pixes[i] * gaussMatrix[j + radius];
            g += pixes[i + 1] * gaussMatrix[j + radius];
            b += pixes[i + 2] * gaussMatrix[j + radius];
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        pixes[i] = r / gaussSum;
        pixes[i + 1] = g / gaussSum;
        pixes[i + 2] = b / gaussSum;
      }
    }
    return imgData;
  },
  gauss: function() {
    var that = this;
    wx.canvasGetImageData({
      canvasId: 'myCanvas',
      x: 0,
      y: 0,
      width: 320,
      height: 300,
      success(res) {
        const data = that.gaussblur(res.data)
        wx.canvasPutImageData({
          canvasId: 'myCanvas',
          x: 0,
          y: 0,
          width: 320,
          height: 300,
          data: data,
          success(res) {
            var revoke = that.data.revoke;
            revoke.push(that.actions.length);
            that.setData({
              revoke: revoke
            });
            var actions = that.context.getActions();
            that.actions.push(actions[0]);
            wx.setStorageSync('draft', that.actions)
          }
        })
      }
    })
  },
  menuItemClick: function (res) {
    console.log(res);
    var that = this;
    //获取点击事件的信息
    let clickInfo = res.detail.iteminfo
    console.log(clickInfo);
    // 根据不同类型进行判别处理
    //事件的处理 代码
    var id = res.detail.iteminfo.id
    if(id == 1){
      that.gauss();
    }else if(id == 2){
      that.face();
    }else if(id == 3){
      that.blackwhite();
    }
  },
  setTouchStart:function(e){
    console.log(e)
  },
  setTouchMove: function (e) {
    console.log(e)
    var that = this;
    if (e.changedTouches[0].clientX < 300 && e.changedTouches[0].clientY < 400 && e.changedTouches[0].clientX > 0 && e.changedTouches[0].clientY > 0) {
    that.setData({
    left: e.changedTouches[0].clientX,
    top: e.changedTouches[0].clientY
  })
} else {
    that.setData({
    left: 270,
    top: 400
  })
}
},
  setTouchEnd:function(e){
    console.log(e)
  },

  setStyle: function() {
    this.context.setStrokeStyle(this.data.penColor)
    this.context.setLineWidth(this.data.penWidth)
    this.context.setLineCap('round') // 让线条圆润
    this.context.setLineJoin("round")
  },
  randomKey: function() {
    var keys = this.data.keyList;
    var keyNum = keys.length;
    var num = Math.floor(Math.random() * (keyNum - 1));
    this.setData({
      key: keys[num].title,
      tip: keys[num].tip
    })
    wx.setStorageSync('guess-key', keys[num].title);
    wx.setStorageSync('guess-key', keys[num].tip);

  },
  changeTap: function() {
    this.randomKey();
  },

  selectPenWidthTap: function(e) {
    var penWidth = e.currentTarget.dataset.width;
    this.setData({
      penWidth: penWidth
    })
  },
  selectPenColorTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var colorList = this.data.colorList;
    this.setData({
      isClear: false,
      colorIndex: index,
      penColor: colorList[index]
    })
  },

  onKeyTap: function() {

  },
  clearTap: function() {
    var isClear = this.data.isClear;
    var colorIndex = this.data.colorIndex;
    var colorList = this.data.colorList;
    var penColor = isClear ? colorList[colorIndex] : '#ffffff';
    this.setData({
      penColor: penColor,
      isClear: !isClear
    })
  },
  deleteTap: function() {
    var that = this;
    var colorIndex = this.data.colorIndex;
    var colorList = this.data.colorList;
    wx.showModal({
      title: '提示',
      content: '确定要清空内容吗？',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('draft')
          that.context.clearRect(0, 0, 750, 700);
          that.context.draw();
          //重新画一张白色背景，避免后续在不同机型生成图片背景有的是黑的
          this.context = wx.createCanvasContext('myCanvas');
          this.context.setFillStyle('white')
          this.context.fillRect(0, 0, 750, 700)
          this.context.draw()
        }
      }
    })
    this.setData({
      isClear: false,
      penColor: colorList[colorIndex],
    })
  },
  confirmTap: function() {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      fileType: 'jpg',
      width: 750,
      height: 700,
      destWidth: 300,
      destHeight: 300,
      canvasId: 'myCanvas',
      success: function(res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        wx.removeStorageSync('draft');
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '保存成功',
              duration: 1500,
              success: function(res) {
                console.log("savesucess");
              }
            })
          }
        })
      }
    })
  },
})