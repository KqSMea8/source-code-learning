/* eslint-disable */
/**
 * - 构造一个对象，拥有 sdk 的全部 API，当sdk 代码未就绪时，用这个对象缓存全部操作
 * - 提供从 cdn 上异步加载 js 代码的逻辑
 */
(function(window, document, export_obj) {
    const win = window;
    // sdk 已加载完毕
    if (win[win['TeaAnalyticsObject']]) {
        win[export_obj] = win[win['TeaAnalyticsObject']];
    }
    else {
        win['TeaAnalyticsObject'] = export_obj;

        function _collect() {
            _collect.q.push(arguments);
            return _collect;
        }

        _collect.q = _collect.q || [];
        win[export_obj] = _collect;
    }
})(window, document, 'collectEvent');
