// 需求文档地址： https://docs.google.com/spreadsheets/d/1F5Fof2DqQhgi-3W1aySrnAqj2zF4TtfqPCOPEWHwZU4/edit#gid=1743078431

type TPage = { route: string }
declare const getCurrentPages: () => TPage[]
type TEventFunc = (event: string, params?: object) => void

let enterTime: number | undefined;

// 进入小程序
interface MpEnterParams {
  launch_from: string
}
export const mpEnter = (event: TEventFunc, params: MpEnterParams) => {
  enterTime = +new Date()
  event('mp_enter', {
    ...params,
  })
}

// 退出小程序
interface MpExitParams {
  duration?: number;
  page_path?: string;
}
export const mpExit = (event: TEventFunc, params: MpExitParams = {}) => {
  const pages = getCurrentPages()
  const page_path = pages[pages.length - 1].route
  const duration = enterTime === undefined ? 0 : +new Date - enterTime
  event('mp_exit', {
    duration,
    page_path,
    ...params,
  })
  enterTime = undefined
}

// 支付
interface PurchaseParams {
  content_type: string,
  content_name: string,
  content_id: string,
  content_num: number,
  payment_channel: string,
  currency: string,
  currency_amount: number,
  is_success: string,
  level: number,
}
export const purchase = (event: TEventFunc, params: PurchaseParams) => {
  event('purchase', {
    ...params,
  })
}

// 进行任务
interface QuestParams {
  quest_id: string,
  quest_type: string,
  quest_name: string,
  quest_no: number,
  is_success: string,
  description: string,
}
export const quest = (event: TEventFunc, params: QuestParams) => {
  event('quest', {
    ...params,
  })
}

// 升级
interface updateLevelParams {
  level: number,
}
export const updateLevel = (event: TEventFunc, params: updateLevelParams) => {
  event('update_level', {
    ...params,
  })
}

// 创建角色
interface createGameRoleParams {
  gamerole_id: string
}
export const createGameRole = (event: TEventFunc, params: createGameRoleParams) => {
  event('create_gamerole', {
    ...params,
  })
}

// 下单
interface checkoutParams {
  content_type: string,
  content_name: string,
  content_id: string,
  content_num: number,
  is_virtual_currency: string,
  virtual_currency: string,
  currency: string,
  currency_amount: number,
  is_success: string,
}
export const checkout = (event: TEventFunc, params: checkoutParams) => {
  event('check_out', {
    ...params,
  })
}

// 添加至收藏
interface addToFavouriteParams {
  content_type: string,
  content_name: string,
  content_id: string,
  content_num: number,
  is_success: string,
}
export const addToFavourite = (event: TEventFunc, params: addToFavouriteParams) => {
  event('add_to_favourite', {
    ...params,
  })
}
