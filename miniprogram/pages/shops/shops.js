const common = require('../../model/common');
const image = require('../../image/image');
const AV = require('../../utils/av-live-query-weapp-min');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (Boolean(app.globalData.userInfo)) {
      that.query_list('my_shops_' + app.globalData.userInfo.uid, 0, -1);
    } else {
      app.userInfoReadyCallback = u => {
        that.query_list('my_shops_' + u.uid, 0, -1);
      }
    }
  },

  input(e) {
    console.log(e.detail.value);
    let that = this;
    that.setData({
      value: e.detail.value,
    });
  },

  confirm() {
    let that = this;
    let add_shop_to_my_list = (key,value) => {
      console.log(key,value);
        const paramsJson = {
          key: key,
          value:value,
        };
        console.log(paramsJson);
        AV.Cloud.run('rpush', paramsJson).then((result) => {
          console.log(result);
          that.query_list('my_shops_' + app.globalData.userInfo.uid, 0, -1);
        });
    }
    
    const paramsJson = {
      key: 'shop_'+ that.data.value,
    };
    console.log(paramsJson);
    AV.Cloud.run('has_key', paramsJson).then((result) => {
      console.log(result);
      if (result==0) {
        console.log(0);
        common.showToast('未查询到您输入的小店ID');
      } else {
        console.log(1);
        console.log('my_shops_' + app.globalData.userInfo.uid, 'shop_'+ that.data.value);
        add_shop_to_my_list('my_shops_' + app.globalData.userInfo.uid, 'shop_'+ that.data.value);
      }
    });
  },
    /**
   * 查询求购卡片的信息
   */
  query_list(key, begin, end) {
    let that = this;
    const paramsJson = {
      key: key,
      begin: begin,
      end: end,
    };
    console.log(paramsJson);
    AV.Cloud.run('get_list_details_new', paramsJson).then((result) => {
      let r = result.filter(function (s) {
        return s !=null;
      });
      that.setData({
        list: r,
      });
    });
  },

  navigate(e) {
    common.navigateTo(e.currentTarget.dataset.url);
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