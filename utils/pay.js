const WXAPI = require('apifm-wxapi')
const i18n = require("../i18n/index")
const $t = i18n.$t()

/**
 * type: order 支付订单 recharge 充值 paybill 优惠买单
 * data: 扩展数据对象，用于保存参数
 */
function wxpay(type, money, orderId, redirectUrl, data) {
  const postData = {
    token: wx.getStorageSync('token'),
    money: money,
    remark: "在线充值",
  }
  if (type === 'order') {
    postData.remark = "支付订单 ：" + orderId;
    postData.nextAction = {
      type: 0,
      id: orderId
    };
  }
  if (type === 'paybill') {
    postData.remark = $t.my.youhuimaidan + " ：" + data.money;
    postData.nextAction = {
      type: 4,
      uid: wx.getStorageSync('uid'),
      money: data.money
    };
  }
  postData.payName = postData.remark;
  if (postData.nextAction) {
    postData.nextAction = JSON.stringify(postData.nextAction);  
  }
  WXAPI.wxpay(postData).then(function (res) {
    if (res.code == 0) {
      // 发起支付
      wx.requestPayment({
        timeStamp: res.data.timeStamp,
        nonceStr: res.data.nonceStr,
        package: res.data.package,
        signType: res.data.signType,
        paySign: res.data.paySign,
        fail: function (aaa) {
          console.error(aaa)
          wx.showToast({
            title: aaa
          })
          if (redirectUrl) {
            wx.redirectTo({
              url: redirectUrl,
            })
          }
        },
        success: function () {
          // 提示支付成功
          wx.showToast({
            title: $t.asset.success
          })
          if (redirectUrl) {
            wx.redirectTo({
              url: redirectUrl,
            })
          }
        }
      })
    } else {
      wx.showModal({
        confirmText: $t.common.confirm,
        cancelText: $t.common.cancel,
        content: JSON.stringify(res),
        showCancel: false
      })      
    }
  })
}

module.exports = {
  wxpay: wxpay
}