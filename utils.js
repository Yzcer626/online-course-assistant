const State = {
    get: (cb) => {
        if (!chrome.runtime?.id) return cb({});
        try { chrome.storage.local.get(null, (res) => cb(res || {})); }
        catch(e) { cb({}); }
    },
    set: (data, cb) => {
        if (!chrome.runtime?.id) return;
        try { chrome.storage.local.set(data, cb); }
        catch(e) {}
    }
};

const KEYS = {
    IS_ANSWERING: "cx_is_answering",
    IS_LEARN_MODE: "cx_is_learn_mode",
    IS_LEARN_RUNNING: "cx_learn_run",
    VIDEO_SPEED: "cx_video_speed"
};