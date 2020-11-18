const AV = require('../utils/av-live-query-weapp-min');
const {User,Query,Cloud} = require('../utils/av-live-query-weapp-min');
var app = getApp();



/**
 * 生成时间字符串
 */
function get_full_time(d) {
    return String(d.getFullYear()) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2);
}

/**
 * 
 * 获取用户的手机号码
 */
function getPhoneNumber(e) {
    console.log(app.globalData.userInfo.objectid);
    if (app.globalData.userInfo.objectid) {
      const paramsJson = {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: app.globalData.userInfo.session_key,
          openid: app.globalData.userInfo.objectid
      };
      console.log(paramsJson);
      return AV.Cloud.run('getPhoneNumber', paramsJson).then(function (data) {
          console.log('云函数回应' + data.phoneNumber);
          return data.phoneNumber;
      }).catch(console.error);
    }else{
        //如果没有获取到用户objectid的流程
        console.log('还没有拿到用户的objectid');
    }
  }

  
/**
 * 
 * 获取用户的手机号码
 */
function query_user_status(status) {
    let that = this;
    if(status==0){  
        that.navigateTo('/pages/user/login/login');
    }else if(status==1){
        that.navigateTo('/pages/user/login/login');
    }else if(status==2){
    }else if(status==3){

    }else if(status==-1){
        that.navigateTo('/pages/user/login/band');
    }
}

/**
 * 
 */
function navigateTo(url) {
    wx.navigateTo({url: url});
}

/**
 * 
 */
function switchTab(url) {
    wx.switchTab({url: url});
}

/**
 * 返回页面delta：1
 */
function navigateBack(delta) {
    wx.navigateBack({delta: delta});
}


//////////////////////////////////////////////////////////////////////
/**
 * 以下存放，客户端与业务无关代码
 */
//弹出模态弹窗
function showModal(c, t, func) {
    if (!t)
        t = '提示'
    wx.showModal({
        title: t,
        content: c,
        showCancel: false,
        success: func
    })
}

//弹出模态弹窗
function showToast(c,func) {
    wx.showToast({
        title: c,
        icon: 'none',
        duration: 2000,
        success: func
    })
}
/**
 * 请求模板消息发放资格
 */
function request_subs() {
    let set_code = (tmpids) => {
            console.log(tmpids);
            wx.requestSubscribeMessage({
                tmplIds: tmpids,
                success(res) {
                    console.log(res);
                    for (const i of tmpids) {
                        if (res[i] == 'accept') {
                            console.log(i);
                            const paramsJson = {
                                key: 'service_notice_' + i,
                                field: app.globalData.userInfo.objectid,
                                value: 1,
                            };
                            console.log(paramsJson);
                            return AV.Cloud.run('increField', paramsJson).then((x) => {
                                console.log('result:', x);
                            });
                        }
                    }
                },
                fail(res){
                    console.log(res);
                }
            });
            wx.requestSubscribeMessage()
    }
    let query_tmpids = () => {
        const paramsJson = {
            key: 'service_notice_model',
        };
        console.log(paramsJson);
        return AV.Cloud.run('get_list_details_strings', paramsJson).then((tmpids) => {
            console.log(tmpids);
            set_code(tmpids);
        });
    }
    query_tmpids();
}

/**
 * login  重新login以更新用户的信息
 */
function login() {
    let u = {};
    wx.login({
      success: res => {
        let paramsJson = {
          code: res.code,
          app_name:'shop',
        };
        AV.Cloud.run('login', paramsJson).then(function (user) {
          let {phoneNumber=null,wechatid=null,shop=0,invitation_code=null,sharer=null,status=0} = user;
          u = user;
          u.phoneNumber = phoneNumber;
          u.wechatid = wechatid;
          u.shop = shop;
          u.invitation_code = invitation_code;
          u.sharer = sharer;
          u.status = status;
          app.globalData.userInfo = u;
          console.log(user)
        }).then(() => {
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            this.userInfoReadyCallback(u);
          }
        }).catch(console.error);
      }
    });
}
/**
 * 修改用户的某些数据
 */
function set_user_field(field,value) {
    const paramsJson = {
    uid:app.globalData.userInfo.uid,
    code:app.globalData.userInfo.code,
    field: field,
    value: value,
    };
    AV.Cloud.run('set_users_field', paramsJson).then((result) => {
    }).catch(console.error);
}

/**
 * 修改用户的某些数据
 */
function copy(data) {
    wx.setClipboardData({
      data: data,
      success: (result)=>{
        console.log('复制的内容：',data,result);
      },
      fail: ()=>{},
      complete: ()=>{}
    });
}


module.exports.getPhoneNumber = getPhoneNumber;
module.exports.query_user_status = query_user_status;
module.exports.login = login;
module.exports.set_user_field = set_user_field;

module.exports.copy = copy;
///////////////////////////////////////////////////////////
//以下与业务无关，前端展示的代码
module.exports.showModal = showModal;
module.exports.showToast = showToast;
module.exports.get_full_time = get_full_time;

module.exports.navigateTo = navigateTo;
module.exports.switchTab = switchTab;
module.exports.navigateBack = navigateBack;
//////////////////////////////////////////////////////////////////////
module.exports.request_subs = request_subs;
