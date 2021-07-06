// miniprogram/pages/my/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    phoneBak: "",
    syncUserChecked: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.init == "1") {
      this.initUser();
    }
  },

  checkedEvent: function(e) {
    this.setData({
      syncUserChecked: !this.data.syncUserChecked
    })
    if(this.data.syncUserChecked) {
      this.syncInfo();
    }
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
        wx.showToast({
          title: "同步信息失败",
        })
        this.setData({
          syncUserChecked: false
        })
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
        title: '格式检查失败',
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
          wx.navigateTo({
            url: '/pages/index/index?cur=user',
          })
        })
      }
    })
  },

  initUser: function() {
    wx.cloud.callFunction({
      name: "user",
      data: {
        func: "checkInfoLogin"
      },
      success: (res) => {
        console.log(res)
      }
    })
  }
})