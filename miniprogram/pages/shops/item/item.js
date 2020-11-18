const AV = require('../../../utils/av-live-query-weapp-min');
const common = require('../../../model/common');
const image = require('../../../image/image');
const app = getApp();
let index = 0;
let list = [];
let key;
let title;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    post:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    key = options.key;
    title = options.title;
    that.setData({
      key:key,
    });
    console.log(key,title);
    wx.setNavigationBarTitle({title: title});
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
      index++;
      let r = result.filter(function (s) {
        return s !=null;
      });
      list = list.concat(r);
      that.setData({
        list: list
      });
    });
  },

  tap_image(e) {
    console.log(e.currentTarget.dataset.url);
    let urls = [];
    urls.push(e.currentTarget.dataset.url);
    wx.previewImage({
      current: '',
      urls: urls,
    })
  },


  post(e) {
    let url = '/pages/post/post?key=' + key;
    console.log(url);
    common.navigateTo(url);
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
    let that = this;
    that.query_list(key, index * 20, index * 20 + 19);
  },

  manage(e) {
      console.log(e.currentTarget.dataset);
      let that = this;
      let {title,time,content,price=0,status,post,uid,image=null} = e.currentTarget.dataset;
      let show_modal = () => {
          wx.showModal({
            title: '复制客服微信',
            content: '您可以添加客服:sugar_cosmetic 或微信:impharaon已获得更好服务。',
            success (res) {
              if (res.confirm) {
                common.copy('sugar_cosmetic')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
      }
      if(post==1) {
        if(status==1){
            wx.showActionSheet({
              itemList: ['添加客服微信'],
              success (res) {
                  show_modal()
              },
              fail (res) {
                console.log(res.errMsg);
              }
            });
        }else if(price != 0 ) {
            if(uid == app.globalData.userInfo.uid){
              that.buy(title,Number(price),time,content,image);
            }
            else{
              common.showToast('本订单仅发布求购的用户可以购买，您可咨询客服是否有库存。')
            }
        }
        else{
            wx.showActionSheet({
              itemList: ['添加客服微信获得询价信息'],
              success (res) {
                  show_modal()
              },
              fail (res) {
                console.log(res.errMsg);
              }
            });
        }
      }else {
        if(status==1){
            wx.showActionSheet({
              itemList: ['添加客服微信获得资讯'],
              success (res) {
                  show_modal()
              },
              fail (res) {
                console.log(res.errMsg);
              }
            });
        }else{
            wx.showActionSheet({
              itemList: ['购买','添加客服微信'],
              success (res) {
                if( res.tapIndex==0 ){
                  that.buy(title,Number(price),time,content,image);
                }else{
                  show_modal()
                }
              },
              fail (res) {
                console.log(res.errMsg);
              }
            });
        }
      }
      

  },

  //创建购买订单
  buy(title,price,pid,content,image) {
    wx.showToast({
      title: '正在创建订单',
      icon: 'loading',
      duration: 10000,
      mask: true,
    });
    let paramsJson = {
      productDescription: title,//商品名称
      amount: parseInt(price * 100),//商品价格 数量是分
      uid: app.globalData.userInfo.uid,//用户的objectid
      pid: pid,//商品id
      remark:content,
      objectid:app.globalData.userInfo.objectid,
      key:'info_'+pid,
      piece:1,
      image:image,
      type:1,
    };
    console.log(paramsJson);
    AV.Cloud.run('order', paramsJson).then((data) => {
      wx.hideToast();
      data.success = () => {
        common.showToast('购买完成,您可以添加客服微信联系发货。');
        common.set_field('info_'+pid,'status',1);
        common.navigateTo('/pages/user/order/order?type=1')
      };
      data.fail = ({
        errMsg
      }) => this.setData({
        error: errMsg
      });
      wx.requestPayment(data);
    }).catch(error => {
      this.setData({
        error: error.message
      });
      wx.hideToast();
    });
  },
  setVip(objectid){
    let paramsJson = {
      key: 'user_'+objectid, //key
      field:'vip',
      value:1,
    };
    console.log(paramsJson);
    Cloud.run('setField', paramsJson).then((data) => {
      console.log(data)
    }).catch(error => {
      console.log(error);
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    index = 0;
    list = [];
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    index = 0;
    list = [];
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
      let that = this;
      that.query_list(key, index * 20, index * 20 + 19);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})