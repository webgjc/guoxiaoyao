// miniprogram/pages/main/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    skuInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log(options)
    wx.cloud.callFunction({
      name: "sku",
      data: {
        func: "getSkuAll",
        skuId: options.sku
      },
      success: function(res) {
        console.log(res)
        that.setData({
          skuInfo: res.result
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(this.data.skuInfo.picList[0])
    return {
      title: "【果小媱】" + this.data.skuInfo.name,
      path: "/pages/main/detail/detail?sku=" + this.data.skuInfo._id,
      imageUrl: this.data.skuInfo.picList[0]
    }
  }
})