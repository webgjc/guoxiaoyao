Page({
  data: {
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    skuId: undefined,
    skuInfo: undefined
  },

  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  
  onLoad: function(options) {
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    this.setData({ isIOS })
    const that = this
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)
    })

    if(options.skuId) {
      this.setData({
        skuId: options.skuId
      })
    }
  },

  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight, platform } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({ editorHeight, keyboardHeight })
  },

  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },

  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
      that.fillContent(that.editorCtx)
    }).exec()
  },

  fillContent: function(editorCtx) {
    let that = this
    wx.cloud.callFunction({
      name: "sku", 
      data: {
        func: "getSkuAll",
        skuId: this.data.skuId
      },
      success: function(res) {
        that.setData({
          skuInfo: res.result
        })
        if(res.result.detail) {
          editorCtx.setContents({
            html: res.result.detail.detail
          })
        }
      }
    })
  },

  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    let { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)

  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },

  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    })
  },

  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    })
  },

  removeFormat() {
    this.editorCtx.removeFormat()
  },

  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },

  uploadImages: function(picList, skuName) {
    return Promise.all(picList.map((tempFilePath, index) => {
      return new Promise(function (resolve, reject) {
        wx.cloud.uploadFile({
          cloudPath: `skuDetail/${skuName}-${Date.now()}-${parseInt(Math.random() * 1000000)}.jpg`,
          filePath: tempFilePath,
          success: function (res) {
            resolve(res.fileID);
          }
        });
      });
    }));
  },

  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      success: function (res) {
        that.uploadImages([res.tempFilePaths[0]], that.data.skuInfo.name)
        .then(res=>{
          that.editorCtx.insertImage({
            src: res[0],
            width: '100%',
            success: function () {
              console.log('insert image success')
            }
          })
        })
      }
    })
  },

  submit: function() {
    let that = this
    this.editorCtx.getContents({
      success: function(data) {
        wx.cloud.callFunction({
          name: "sku",
          data: {
            func: "upinsertSkuDetail",
            skuId: that.data.skuId,
            detail: data.html
          },
          success: function(res) {
            if(res.result == true) {
              wx.showToast({
                title: '更新成功',
              })
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/manage/skulist/sku',
                })
              })
            } else {
              wx.showToast({
                title: '更新失败',
              })
            }
          }
        })
      }
    })
  }
})
