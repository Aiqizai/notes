/* 
    wish joom allegro mercado b2w kaufland walmart coupang linio cdiscount
    
*/

// obj

// wish
obj = {
    id: this.shop.id,
    shopId: this.shop.shopId,
    shopNumber: this.shop.number,
    shopName: this.shop.name,
    staffId: this.shop.shopAdmin,
    changeDate: this.shop.time,
    accessToken: this.shop.accessToken,
    refreshToken: this.shop.refreshToken,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    redirectUri: this.shop.RedirectURI,
    platform: 'Wish',
    siteId: this.shop.siteId,
    commissionRate: this.shop.commissionRate,
    expiresTime: this.shop.expiresTime
}

// joom
obj = {
    id: this.shop.id,
    shopId: this.shop.shopId,
    shopNumber: this.shop.number,
    shopName: this.shop.name,
    staffId: this.shop.shopAdmin,
    accessToken: this.shop.accessToken,
    refreshToken: this.shop.refreshToken,
    expiresTime: this.joomShop.expiresInTime,
    changeDate: this.shop.time,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    redirectUri: this.shop.RedirectURI,
    platform: "Joom",
    siteId: this.shop.siteId,
    commissionRate: this.shop.commissionRate,
    shopGroup: this.joomShop.shopGroup
}

// allegro
obj = {
    id: this.shop.id,
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    staffId: this.shop.shopAdmin,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    redirectUri: this.shop.RedirectURI,
    accessToken: this.shop.accessToken,
    refreshToken: this.shop.refreshToken,
    expiresTime: this.allegroShop.expiresInTime,
    changeDate: this.shop.time,
    commissionRate: this.allegroShop.commissionRate,
    platform: 'Allegro',
    siteId: this.allegroShop.siteId
}

// mercado
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    accessToken: this.shop.accessToken,
    refreshToken: this.shop.refreshToken,
    sellerId: this.mercadoShop.sellerId,
    expiresTime: this.mercadoShop.expiresInTime,
    commissionRate: this.mercadoShop.commissionRate,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    redirectUri: this.shop.RedirectURI,
    staffId: this.shop.shopAdmin,
    changeDate: this.shop.time,
    platform: "Mercado",
    siteId: "AR"
}

// b2w
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    staffId: this.shop.shopAdmin,
    changeDate: this.shop.time,
    accessToken: this.b2wShop.apiToken,
    userName: this.b2wShop.userName,
    clientId: this.b2wShop.xaccountmanagerKey,
    commissionRate: this.b2wShop.commissionRate,
    platform: "B2w",
    siteId: "BR"
}

// kaufland
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    redirectUri: this.shop.RedirectURI,
    staffId: this.shop.shopAdmin,
    changeDate: this.shop.time,
    commissionRate: this.kauflandShop.commissionRate,
    platform: "Kaufland",
    siteId: "DE"
}


// walmart  
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    staffId: this.shop.shopAdmin,
    changeDate: this.shop.time,
    commissionRate: this.walmartShop.commissionRate,
    platform: "Walmart",
    siteId: 'US'
}


// coupang
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    staffId: this.shop.shopAdmin,
    sellerId: this.coupangShop.sellerNumber,
    commissionRate: this.coupangShop.commissionRate,
    changeDate: this.shop.time,
    platform: "Coupang",
    siteId: 'BR'
}


// linio
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    clientSecret: this.shop.ClientSecret,
    staffId: this.shop.shopAdmin,
    userName: this.linioShop.userName,
    commissionRate: this.linioShop.commissionRate,
    changeDate: this.shop.time,
    platform: "Linio",
    siteId: this.linioShop.siteId
}

// cdiscount
obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    clientId: this.shop.ClientId,
    clientSecret: this.shop.ClientSecret,
    staffId: this.shop.shopAdmin,
    accessToken: this.cdiscountShop.token,
    refreshToken: this.shop.refreshToken,
    expiresTime: this.cdiscountShop.expiresTime,
    commissionRate: this.cdiscountShop.commissionRate,
    changeDate: this.shop.time,
    platform: "Cdiscount",
    siteId: this.cdiscountShop.siteId
}

// amazon
obj = {
    id: this.shop.id,
    shopNumber: this.shop.number,
    shopName: this.shop.name,
    currencyCode: this.shop.currency,
    staffId: this.shop.shopAdmin,
    sellerId: this.shop.sellerNumber,
    changeDate: this.shop.time,
    accessToken: this.shop.amazonToken,
    siteId: this.shop.siteId,
    commissionRate: this.shop.commissionRate,
    shopGroup: this.shop.shopGroup,
    platform: 'Amazon'
  }
  if (this.amazonShop.adAccessToken) {
    obj['adAccessToken'] = this.amazonShop.adAccessToken
  }
  if (this.amazonShop.expiresInTime) {
    obj['adExpiresTime'] = this.amazonShop.expiresInTime
  }
  if (this.amazonShop.adRefreshToken) {
    obj['adRefreshToken'] = this.amazonShop.adRefreshToken
  }

/* 
   

*/


obj = {
    shopName: this.shop.name,
    shopNumber: this.shop.number,
    clientId: this.shop.ClientId
}


// shopProfit

/* 

    原：
switch (this.currentPlatForm) {
        case 'Wish':
          if (!row.hasAd) {
            return {
              'background-color': 'pink',
              'color': 'blue',
              'font-weight': 'bold'
            }
          } else if (row.changeTime) {
            return blue
          }
          break
        case 'Joom':
          if (row.changeTime === undefined || row.changeTime == null) {
            return ''
          } else {
            return blue
          }
        case 'Shopee':
          if (row.changeTime) {
            return blue
          } else {
            return ''
          }
        case 'Mall':
          if (row.changeTime) {
            return blue
          } else {
            return ''
          }
        case 'Amazon':
          if (!row.isJoin) {
            return {
              'background-color': 'pink',
              'color': 'blue',
              'font-weight': 'bold'
            }
          } else if (row.changeTime) {
            return blue
          } else {
            return ''
          }
        case 'Mercado':
          if (row.changeTime === undefined || row.changeTime == null) {
            return ''
          } else {
            return blue
          }
        case 'Aliexpress':
          if (row.changeTime === undefined || row.changeTime == null) {
            return ''
          } else {
            return blue
          }
        case 'Allegro':
          if (row.changeTime === undefined || row.changeTime == null) {
            return ''
          } else {
            return blue
          }
        case 'Lazada':
          if (row.changeTime === undefined || row.changeTime == null) {
            return ''
          } else {
            return blue
          }
        default:
          return ''  


    改：          

    const pink = {
        'background-color': 'pink',
        'color': 'blue',
        'font-weight': 'bold'
      }
      const plats = ['Joom', 'Shopee', 'Mall', 'Mercado', 'Aliexpress', 'Allegro', 'Lazada']

      if (this.currentPlatForm === 'Wish') {
        if (!row.hasAd) {
          return pink
        } else if (row.changeTime) {
          return blue
        }
      } else if (this.currentPlatForm === 'Amazon') {
        if (!row.isJoin) {
          return pink
        } else if (row.changeTime) {
          return blue
        } else {
          return ''
        }
      } else if (plats.includes(this.currentPlatForm)) {
        if (row.changeTime) {
          return blue
        } else {
          return ''
        }
      } else {
        return ''
      }


      const pink = {
          'background-color': 'pink',
          'color': 'blue',
          'font-weight': 'bold'
      }
      const plats = ['Joom', 'Shopee']

*/


/* 
      1、页面按钮 点击  ->  调用/YuanmeiShop/getAuthorizeUrl ，就会返回跳转的url 

      2、跳转到返回的url（登录页面，登录成功后）

         保存授权信息： selling_partner_id  mws_auth_token(如果存在就要保存)  spapi_oauth_code

         e.g:  https://client-example.com?state=state-example&mws_auth_token=mwsauthtokenexample&selling_partner_id=sellingpartneridexample&spapi_oauth_code=spapioauthcodeexample


      3、LWA 授权码（spapi_oauth_code）交换 LWA 刷新令牌

            https://api.amazon.com/auth/o2/token

                参数：  grant_type： 'authorization_code'

                       code:         LWA 授权码（spapi_oauth_code）

                       redirect_uri: https://yuanmeinetwork.com/API/access_token/callBack

                       client_id: 

                       client_secret:

            返回的数据： refresh_token （需要保存） ， 然后调用yuanmeiShop/add(update) 传回去

        4、设置isSPAuthorize




        新项目利润统计表格样式的修复
        amazon的sp授权（待测试）
        新项目的bug修复
*/


// const platform_array = []
      // for (let i = 0; i < res.length; i++) {
      //   for (let j = 0; j < this.platforms.length; j++) {
      //     if (this.platforms[j].text === res[i]) {
      //       // this.platform = i
      //       platform_array.push(this.platforms[j])
      //     }
      //   }
      // }
      // this.platforms = platform_array
      // console.log(this.platforms, 'plat')
      // for (let i = 0; i < this.platforms.length; i++) {
      //   this.platforms[i].is_show = true
      //   this.platforms[i].checked = ''
      // }
      // this.platforms[0].checked = 'checked'

      // const first = this.platforms[0].value
      // console.log(first, '1')

      // this.platform = first

      // this.columnsData = this.columns[first]

      // console.log(this.columnsData, '2')
      // console.log(this.platforms[this.platform].value, 'this.platforms[this.platform].value6666')