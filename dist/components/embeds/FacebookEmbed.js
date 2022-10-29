"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookEmbed = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const PlaceholderEmbed_1 = require("../placeholder/PlaceholderEmbed");
const uuid_1 = require("../uuid");
const EmbedStyle_1 = require("./EmbedStyle");
const embedJsScriptSrc = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2';
const defaultEmbedWidth = 550;
const maxPlaceholderWidth = defaultEmbedWidth;
const defaultPlaceholderHeight = 372;
const borderRadius = 3;
// Embed Stages
const CHECK_SCRIPT_STAGE = 'check-script';
const LOAD_SCRIPT_STAGE = 'load-script';
const CONFIRM_SCRIPT_LOADED_STAGE = 'confirm-script-loaded';
const PROCESS_EMBED_STAGE = 'process-embed';
const CONFIRM_EMBED_SUCCESS_STAGE = 'confirm-embed-success';
const RETRYING_STAGE = 'retrying';
const EMBED_SUCCESS_STAGE = 'embed-success';
const FacebookEmbed = (_a) => {
    var _b, _c;
    var { url, width, height, linkText = 'View post on Facebook', placeholderImageUrl, placeholderSpinner, placeholderSpinnerDisabled = false, placeholderProps, embedPlaceholder, placeholderDisabled = false, scriptLoadDisabled = false, retryDelay = 5000, retryDisabled = false, debug = false } = _a, divProps = __rest(_a, ["url", "width", "height", "linkText", "placeholderImageUrl", "placeholderSpinner", "placeholderSpinnerDisabled", "placeholderProps", "embedPlaceholder", "placeholderDisabled", "scriptLoadDisabled", "retryDelay", "retryDisabled", "debug"]);
    const [stage, setStage] = react_1.default.useState(CHECK_SCRIPT_STAGE);
    const embedSuccess = react_1.default.useMemo(() => stage === EMBED_SUCCESS_STAGE, [stage]);
    const uuidRef = react_1.default.useRef((0, uuid_1.generateUUID)());
    const [processTime, setProcessTime] = react_1.default.useState(Date.now());
    const embedContainerKey = react_1.default.useMemo(() => `${uuidRef.current}-${processTime}`, [processTime]);
    // Debug Output
    react_1.default.useEffect(() => {
        debug && console.log(`[${new Date().toISOString()}]: ${stage}`);
    }, [debug, stage]);
    // === === === === === === === === === === === === === === === === === === ===
    // Embed Stages
    // === === === === === === === === === === === === === === === === === === ===
    // Check Script Stage
    react_1.default.useEffect(() => {
        var _a, _b;
        if (stage === CHECK_SCRIPT_STAGE) {
            const win = typeof window !== 'undefined' ? window : undefined;
            if ((_b = (_a = win === null || win === void 0 ? void 0 : win.FB) === null || _a === void 0 ? void 0 : _a.XFBML) === null || _b === void 0 ? void 0 : _b.parse) {
                setStage(PROCESS_EMBED_STAGE);
            }
            else if (!scriptLoadDisabled) {
                setStage(LOAD_SCRIPT_STAGE);
            }
            else {
                console.error('Facebook embed script not found. Unable to process Facebook embed:', url);
            }
        }
    }, [scriptLoadDisabled, stage, url]);
    // Load Script Stage
    react_1.default.useEffect(() => {
        if (stage === LOAD_SCRIPT_STAGE) {
            if (typeof document !== 'undefined') {
                const scriptElement = document.createElement('script');
                scriptElement.setAttribute('src', embedJsScriptSrc);
                document.head.appendChild(scriptElement);
                setStage(CONFIRM_SCRIPT_LOADED_STAGE);
            }
        }
    }, [stage]);
    // Confirm Script Loaded Stage
    react_1.default.useEffect(() => {
        let interval = undefined;
        if (stage === CONFIRM_SCRIPT_LOADED_STAGE) {
            const win = typeof window !== 'undefined' ? window : undefined;
            interval = setInterval(() => {
                var _a, _b;
                if ((_b = (_a = win === null || win === void 0 ? void 0 : win.FB) === null || _a === void 0 ? void 0 : _a.XFBML) === null || _b === void 0 ? void 0 : _b.parse) {
                    setStage(PROCESS_EMBED_STAGE);
                }
            }, 1);
        }
        return () => clearInterval(interval);
    }, [stage]);
    // Process Embed Stage
    react_1.default.useEffect(() => {
        var _a, _b;
        if (stage === PROCESS_EMBED_STAGE) {
            const win = typeof window !== 'undefined' ? window : undefined;
            const parse = (_b = (_a = win === null || win === void 0 ? void 0 : win.FB) === null || _a === void 0 ? void 0 : _a.XFBML) === null || _b === void 0 ? void 0 : _b.parse;
            if (parse) {
                parse();
                setStage(CONFIRM_EMBED_SUCCESS_STAGE);
            }
            else {
                console.error('Facebook embed script not found. Unable to process Facebook embed:', url);
            }
        }
    }, [stage, url]);
    // Confirm Embed Success Stage
    react_1.default.useEffect(() => {
        let confirmInterval = undefined;
        let retryTimeout = undefined;
        if (stage === CONFIRM_EMBED_SUCCESS_STAGE) {
            confirmInterval = setInterval(() => {
                if (typeof document !== 'undefined') {
                    const fbPostContainerElement = document.getElementById(uuidRef.current);
                    if (fbPostContainerElement) {
                        const fbPostElem = fbPostContainerElement.getElementsByClassName('fb-post')[0];
                        if (fbPostElem) {
                            if (fbPostElem.children.length > 0) {
                                setStage(EMBED_SUCCESS_STAGE);
                            }
                        }
                    }
                }
            }, 1);
            if (!retryDisabled) {
                retryTimeout = setTimeout(() => {
                    setStage(RETRYING_STAGE);
                }, retryDelay);
            }
        }
        return () => {
            clearInterval(confirmInterval);
            clearTimeout(retryTimeout);
        };
    }, [retryDisabled, retryDelay, stage]);
    // Retrying Stage
    react_1.default.useEffect(() => {
        if (stage === RETRYING_STAGE) {
            // This forces the embed container to remount
            setProcessTime(Date.now());
            setStage(PROCESS_EMBED_STAGE);
        }
    }, [stage]);
    // END Embed Stages
    // === === === === === === === === === === === === === === === === === === ===
    const isPercentageWidth = !!(width === null || width === void 0 ? void 0 : width.toString().includes('%'));
    const isPercentageHeight = !!(height === null || height === void 0 ? void 0 : height.toString().includes('%'));
    // === Placeholder ===
    const placeholderStyle = {
        maxWidth: isPercentageWidth ? undefined : maxPlaceholderWidth,
        width: typeof width !== 'undefined' ? (isPercentageWidth ? '100%' : width) : '100%',
        height: isPercentageHeight
            ? '100%'
            : typeof height !== 'undefined'
                ? height
                : typeof ((_b = divProps.style) === null || _b === void 0 ? void 0 : _b.height) !== 'undefined' || typeof ((_c = divProps.style) === null || _c === void 0 ? void 0 : _c.maxHeight) !== 'undefined'
                    ? '100%'
                    : defaultPlaceholderHeight,
        border: '1px solid #dee2e6',
        borderRadius,
    };
    const placeholder = embedPlaceholder !== null && embedPlaceholder !== void 0 ? embedPlaceholder : (react_1.default.createElement(PlaceholderEmbed_1.PlaceholderEmbed, Object.assign({ url: url, imageUrl: placeholderImageUrl, linkText: linkText, spinner: placeholderSpinner, spinnerDisabled: placeholderSpinnerDisabled }, placeholderProps, { style: Object.assign(Object.assign({}, placeholderStyle), placeholderProps === null || placeholderProps === void 0 ? void 0 : placeholderProps.style) })));
    // === END Placeholder ===
    return (react_1.default.createElement("div", Object.assign({}, divProps, { className: (0, classnames_1.default)('rsme-embed rsme-facebook-embed', divProps.className), style: Object.assign({ overflow: 'hidden', width: width !== null && width !== void 0 ? width : undefined, height: height !== null && height !== void 0 ? height : undefined, borderRadius }, divProps.style) }),
        react_1.default.createElement(EmbedStyle_1.EmbedStyle, null),
        react_1.default.createElement("div", { id: uuidRef.current, className: (0, classnames_1.default)(!embedSuccess && 'rsme-d-none') },
            react_1.default.createElement("div", { key: embedContainerKey, className: "fb-post", "data-href": url, "data-width": isPercentageWidth ? '100%' : width !== null && width !== void 0 ? width : defaultEmbedWidth, style: {
                    width: isPercentageWidth ? '100%' : width !== null && width !== void 0 ? width : defaultEmbedWidth,
                    height: isPercentageHeight ? '100%' : height !== null && height !== void 0 ? height : undefined,
                } })),
        !embedSuccess && !placeholderDisabled && placeholder));
};
exports.FacebookEmbed = FacebookEmbed;
