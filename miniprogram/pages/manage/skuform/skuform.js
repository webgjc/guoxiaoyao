// miniprogram/pages/manage/skuform/skuform.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    coverImgList: [],
    skuInfo: {
      name: "",
      price: 0,
      swiper: false,
      recommend: false,
      picList: [],
      remark: ""
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    if(options.skuId) {
      this.data.skuInfo["_id"] = options.skuId
      wx.cloud.callFunction({
        name: "sku",
        data: {
          func: "getSku",
          skuId: options.skuId
        },
        success: function(e) {
          that.setData({
            skuInfo: e.result.data,
            imgList: e.result.data.picList,
            coverImgList: e.result.data.coverImage ? [e.result.data.coverImage] : []
          })
        }
      })
    }
  },

  ChooseImage(e) {
    let imgs = e.currentTarget.dataset.image == "imgList" ? this.data.imgList : this.data.coverImgList
    wx.chooseImage({
      count: 6, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (imgs.length != 0) {
          this.setData({
            [e.currentTarget.dataset.image]: imgs.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            [e.currentTarget.dataset.image]: res.tempFilePaths
          })
        }
      }
    });
  },

  DelImg(e) {
    let imgs = e.currentTarget.dataset.image == "imgList" ? this.data.imgList : this.data.coverImgList
    imgs.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      [e.currentTarget.dataset.image]: imgs
    })
  },

  deleteSku: function() {
    let that = this
    wx.showModal({
      title: "确认删除？",
      success: function(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "sku", 
            data: {
              func: "deleteSku",
              skuId: that.data.skuInfo._id
            },
            success: function(res) {
              if(res.result.stats.updated == 1) {
                wx.showToast({
                  title: '删除成功',
                })
                setTimeout(() => {
                  wx.navigateTo({
                    url: '/pages/manage/skulist/sku',
                  })
                }, 800)
              }
            }
          })
        }
      }
    })
  },

  inputChange: function(e) {
    this.data.skuInfo[e.currentTarget.dataset.field] = e.detail.value
  },

  uploadImages: function(picList, skuId) {
    return Promise.all(picList.map((tempFilePath, index) => {
      return new Promise(function (resolve, reject) {
        wx.cloud.uploadFile({
          cloudPath: `sku/${skuId}-${Date.now()}-${parseInt(Math.random() * 1000000)}.jpg`,
          filePath: tempFilePath,
          success: function (res) {
            resolve(res.fileID);
          }
        });
      });
    }));
  },

  updateSku: function() {
    wx.cloud.callFunction({
      name: "sku",
      data: {
        func: "updateSku",
        skuInfo: this.data.skuInfo
      },
      success: function(res) {
        if(res.result.stats.updated === 1) {
          wx.showToast({
            title: '更新成功',
          }).then(() => {
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/manage/skulist/sku',
              })
            }, 800)
          })
        }
      }
    })
  },

  toSkuDetail: function() {
    if(this.data.skuInfo["_id"]) {
      wx.navigateTo({
        url: '/pages/manage/skudetail/skudetail?skuId='+this.data.skuInfo["_id"],
      })
    } else {
      wx.showToast({
        title: '请先新增完商品',
      })
    }
  },

  submit: function() {
    let that = this
    that.data.skuInfo["price"] = parseFloat(that.data.skuInfo["price"])

    if(this.data.skuInfo._id) {
      // 编辑
      if(this.data.imgList.join() == this.data.skuInfo.picList.join() && this.data.skuInfo.coverImage && this.data.coverImgList[0] == this.data.skuInfo.coverImage) {
        this.updateSku()
      }else{
        let tmpList = []
        let tmpIdx = {}
        this.data.imgList.forEach((i, idx) => {
          if(!i.startsWith("cloud")) {
            tmpList.push(i)
            tmpIdx[i] = idx
          }
        })
        let coverTmp = this.data.coverImgList.length > 0 && this.data.coverImgList[0].startsWith("cloud") ? [] : this.data.coverImgList;
        this.uploadImages(coverTmp, this.data.name).then(cover => {
          if(cover.length > 0) that.data.skuInfo["coverImage"] = cover[0]
        }).then(() => {
          that.uploadImages(tmpList, this.data.skuInfo.name)
          .then(res => {
            for(let i=0;i<res.length;i++) {
              that.data.imgList[tmpIdx[tmpList[i]]] = res[i]
            }
            that.data.skuInfo["picList"] = that.data.imgList
            that.updateSku()
          })
        })
      }
      return
    }

    that.uploadImages(this.data.coverImgList, this.data.skuInfo.name)
    .then(cover => {
      that.data.skuInfo["coverImage"] = cover.length == 0 ? undefined : cover[0]
    }).then(() => {
      that.uploadImages(this.data.imgList, this.data.skuInfo.name)
      .then(results => {
        if(results.length != that.data.imgList.length) {
          wx.showToast({
            title: '有部分图片未上传成功，请重新提交',
          })
        } else {
          that.data.skuInfo["picList"] = results
          wx.cloud.callFunction({
            name: "sku", 
            data: {
              func: "addSku",
              skuInfo: that.data.skuInfo
            },
            success: function(res) {
              if(res.result._id) {
                wx.showToast({
                  title: '新建成功',
                }).then(() => {
                  setTimeout(() => {
                    wx.navigateTo({
                      url: '/pages/manage/skulist/sku',
                    })
                  }, 800)
                })
              }
            } 
          })
        }
      })
    })
  },

  ViewImage: function(e) {
    console.log(e)
    let imgs = e.currentTarget.dataset.image === "imgList" ? this.data.imgList : this.data.coverImgList
    wx.previewImage({
      urls: imgs,
      current: e.currentTarget.dataset.url
    });
  }
})