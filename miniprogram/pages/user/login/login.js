// miniprogram/pages/my/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    phoneBak: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  syncInfo: function() {   
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        res.userInfo.func = "updateUserInfo"
        console.log(res)
        wx.cloud.callFunction({
          name: "user",
          data: res.userInfo,
          success: function(res) {
            console.log(res)
          }
        })
      },
      fail: (res) => {
        console.log("123")
      }
    })
  },

  formInputChange: function(e) {
    this.setData({
      [e.currentTarget.dataset.field]: e.detail.value
    })
  },

  submitForm: function() {
    if(this.data.phone.length != 11 || !this.data.phone.startsWith("1")) {
      wx.showToast({
        title: '手机格式检查失败',
      })
      return;
    }
    if(this.data.phone != this.data.phoneBak) {
      wx.showToast({
        title: '两次输入不相等',
      })
      return;
    }
    wx.cloud.callFunction({
      name: "user",
      data: {
        func: "updateUserInfo", 
        phone: this.data.phone
      },
      success: function(e) {
        wx.showToast({
          title: '提交成功',
        }).then(() => {
          wx.switchTab({
            url: '/pages/user/index',
          })
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

  }
})