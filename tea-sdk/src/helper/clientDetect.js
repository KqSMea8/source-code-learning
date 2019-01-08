/**
 * https://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript
 * @type {string}
 */
const parseURL = (url) => {
  const a = document.createElement('a');
  a.href = url;
  return a;
};


const parseUrlQuery = (url) => {
  let queryString = parseURL(url).search;
  queryString = queryString.slice(1);
  const queryObj = {};
  queryString.split('&').forEach((keyValue) => {
    const [key, value] = keyValue.split('=');
    queryObj[key] = decodeURIComponent(typeof value === 'undefined' ? '' : value);
  });
  return queryObj;
};


const undef = '';
const screen_width = screen.width || 0;
const screen_height = screen.height || 0;
const screen_size = `${screen_width} x ${screen_height}`;
const appVersion = navigator.appVersion;
const userAgent = navigator.userAgent;
const language = navigator.language;
const referrer = document.referrer;
const referrer_host = parseURL(referrer).hostname;
const urlQueryObj = parseUrlQuery(location.href);

let os_name = undef;
let os_version = undef;
let browser = '';
let browser_version = `${parseFloat(appVersion)}`;
let versionOffset;
let semiIndex;

if ((versionOffset = userAgent.indexOf('Opera')) !== -1) {
  browser = 'Opera';
  browser_version = userAgent.substring(versionOffset + 6);
  if ((versionOffset = userAgent.indexOf('Version')) !== -1) {
    browser_version = userAgent.substring(versionOffset + 8);
  }
}
if ((versionOffset = userAgent.indexOf('Edge')) !== -1) {
  browser = 'Microsoft Edge';
  browser_version = userAgent.substring(versionOffset + 5);
} else if ((versionOffset = userAgent.indexOf('MSIE')) !== -1) {
  browser = 'Microsoft Internet Explorer';
  browser_version = userAgent.substring(versionOffset + 5);
} else if ((versionOffset = userAgent.indexOf('Chrome')) !== -1) {
  browser = 'Chrome';
  browser_version = userAgent.substring(versionOffset + 7);
} else if ((versionOffset = userAgent.indexOf('Safari')) !== -1) {
  browser = 'Safari';
  browser_version = userAgent.substring(versionOffset + 7);
  if ((versionOffset = userAgent.indexOf('Version')) !== -1) {
    browser_version = userAgent.substring(versionOffset + 8);
  }
} else if ((versionOffset = userAgent.indexOf('Firefox')) !== -1) {
  browser = 'Firefox';
  browser_version = userAgent.substring(versionOffset + 8);
}

if ((semiIndex = browser_version.indexOf(';')) !== -1) {
  browser_version = browser_version.substring(0, semiIndex);
}
if ((semiIndex = browser_version.indexOf(' ')) !== -1) {
  browser_version = browser_version.substring(0, semiIndex);
}
if ((semiIndex = browser_version.indexOf(')')) !== -1) {
  browser_version = browser_version.substring(0, semiIndex);
}

const platform = /Mobile|htc|mini|Android|iP(ad|od|hone)/.test(appVersion)
  ? 'wap'
  : 'web';

const clientOpts = [
  {
    s: 'Windows 10',
    r: /(Windows 10.0|Windows NT 10.0)/,
  },
  {
    s: 'Windows 8.1',
    r: /(Windows 8.1|Windows NT 6.3)/,
  },
  {
    s: 'Windows 8',
    r: /(Windows 8|Windows NT 6.2)/,
  },
  {
    s: 'Windows 7',
    r: /(Windows 7|Windows NT 6.1)/,
  },
  {
    s: 'Android',
    r: /Android/,
  },
  {
    s: 'Sun OS',
    r: /SunOS/,
  },
  {
    s: 'Linux',
    r: /(Linux|X11)/,
  },
  {
    s: 'iOS',
    r: /(iPhone|iPad|iPod)/,
  },
  {
    s: 'Mac OS X',
    r: /Mac OS X/,
  },
  {
    s: 'Mac OS',
    r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/,
  },
];

for (let i = 0; i < clientOpts.length; i++) {
  const cs = clientOpts[i];
  if (cs.r.test(userAgent)) {
    os_name = cs.s;
    break;
  }
}

function getVersion(reg, ua) {
  const result = reg.exec(ua);
  if (result && result[1]) {
    return result[1];
  }
  return '';
}

if (/Windows/.test(os_name)) {
  os_version = getVersion(/Windows (.*)/, os_name);
  os_name = 'windows';
}

function getAndroidVersion(ua) {
  let version = getVersion(/Android ([\.\_\d]+)/, ua);
  if (!version) {
    // m3 note/5.1 Linux/3.10.72 Android/5.1 Release/08.05.2016 Browser/AppleWebKit537.36 Browser/Chrome40.0.2214.89 Profile/MIDP-2.0 Configuration/CLDC-1.1 MZBrowser/7.5.1 UWS/2.11.0.34 Mobile Safari/537.36
    version = getVersion(/Android\/([\.\_\d]+)/, ua);
  }
  return version;
}

switch (os_name) {
  case 'Mac OS X':
    os_version = getVersion(/Mac OS X (10[\.\_\d]+)/, userAgent);
    os_name = 'mac';
    break;
  case 'Android':
    os_version = getAndroidVersion(userAgent);
    os_name = 'android';
    break;
  case 'iOS':
    os_version = /OS (\d+)_(\d+)_?(\d+)?/.exec(appVersion);
    if (!os_version) {
      os_version = '';
    } else {
      os_version = `${os_version[1]}.${os_version[2]}.${os_version[3] | 0}`;
    }
    os_name = 'ios';
    break;
}
/**
 * update 20180205
 * screen_size pass
 * browser pass
 * browser_version pass
 * platform 不是很妥，返回了 web 和 wap 两种值， 后续可能有 hybrid；其余的都算是特殊需求，甩个用户设置
 * os_name windows, mac, android, ios ，剩余给用户自己设置
 * 与 os_name 保持一致
 *
 */
export default {
  screen_size,
  browser,
  browser_version,
  platform,
  os_name,
  os_version,
  userAgent,
  screen_width,
  screen_height,
  device_model: os_name,
  language,
  referrer,
  referrer_host,
  utm_source: urlQueryObj.utm_source,
  utm_medium: urlQueryObj.utm_medium,
  utm_campaign: urlQueryObj.utm_campaign,
  utm_term: urlQueryObj.utm_term,
  utm_content: urlQueryObj.utm_content,
};

