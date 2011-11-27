//     Borrowed from Zepto.js - and remixed slightly

// ### x$.os
//
// Object containing information about browser platform
//
// *Example:*
//
//     x$.os.ios      // => true if running on Apple iOS
//     x$.os.android  // => true if running on Android
//     x$.os.webos    // => true if running on HP/Palm WebOS
//     x$.os.touchpad // => true if running on a HP TouchPad
//     x$.os.version  // => string with a version number, e.g.
//                         "4.0", "3.1.1", "2.1", etc.
//     x$.os.iphone   // => true if running on iPhone
//     x$.os.ipad     // => true if running on iPad
//     x$.os.blackberry // => true if running on BlackBerry
//
//     x$.os.device // => The name of the device or browser
//
// ### x$.browser
//
// *Example:*
//
//     x$.browser.webkit  // => true if the browser is WebKit-based
//     x$.browser.version // => WebKit version string


(function(x$){
    function detect(ua){
      var os = (this.os = {}), browser = (this.browser = {}),
        webkit = ua.match(/WebKit\/([\d.]+)/),
        android = ua.match(/(Android)\s+([\d.]+)/),
        ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
        touchpad = webos && ua.match(/TouchPad/),
        blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/);
        os.android = os.iphone = os.ipad = os.touchpad = os.webos = os.blackberry = false;

      if (webkit) browser.version = webkit[1];
      browser.webkit = !!webkit;

      if(browser.webkit) os.device = "browser";

      if (android) os.android = true, os.version = android[2], os.device = "android";
      if (iphone) os.ios = true, os.version = iphone[2].replace(/_/g, '.'), os.iphone = true, os.device = "iphone";
      if (ipad) os.ios = true, os.version = ipad[2].replace(/_/g, '.'), os.ipad = true, os.device = "ipad";
      if (webos) os.webos = true, os.version = webos[2], os.device = "webos";
      if (touchpad) os.touchpad = true, os.device = "touchpad";
      if (blackberry) os.blackberry = true, os.version = blackberry[2], os.device = "blackberry";
    }
    
  detect.call(x$, navigator.userAgent);

})(xui);