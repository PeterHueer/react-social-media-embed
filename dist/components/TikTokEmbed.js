"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokEmbed = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const react_helmet_1 = require("react-helmet");
const __1 = require("..");
require("./rsme.css");
const uuid_1 = require("./uuid");
const defaultProcessDelay = 100;
const defaultRetryInitialDelay = 1000;
const defaultRetryBackoffMaxDelay = 30000;
const TikTokEmbed = ({ url, width, height, embedPlaceholder, placeholderDisabled, processDelay = defaultProcessDelay, scriptLoadDisabled = false, retryDisabled = false, retryInitialDelay = defaultRetryInitialDelay, retryBackoffMaxDelay = defaultRetryBackoffMaxDelay, ...divProps }) => {
    // Format: https://www.tiktok.com/@epicgardening/video/7055411162212633903?is_copy_url=1&is_from_webapp=v1
    const embedId = url.replace(/[?].*$/, '').replace(/^.+\//, '');
    // console.log(embedId);
    const urlStripped = url.replace(/[?].*/, '');
    const [initialized, setInitialized] = react_1.default.useState(false);
    const [processTime, setProcessTime] = react_1.default.useState(-1);
    const [retryDelay, setRetryDelay] = react_1.default.useState(retryInitialDelay);
    const [retrying, setRetrying] = react_1.default.useState(false);
    const [retryTime, setRetryTime] = react_1.default.useState(-1);
    const uuidRef = react_1.default.useRef((0, uuid_1.generateUUID)());
    react_1.default.useEffect(() => {
        const win = typeof window !== 'undefined' ? window : undefined;
        if (win && processTime >= 0) {
            // This call will use the TikTok embed script to process all elements with the `tiktok-embed` class name.
            if (win.instgrm?.Embeds) {
                // console.log('Processing...', Date.now());
                win.instgrm.Embeds.process();
            }
            else {
                console.error('TikTok embed script not found. Unable to process TikTok embed:', url);
            }
        }
    }, [processTime, url]);
    // Initialization
    react_1.default.useEffect(() => {
        const timeout = undefined;
        if (!initialized) {
            if (typeof processDelay !== 'undefined' && processDelay > 0) {
                setTimeout(() => {
                    setProcessTime(Date.now());
                    setInitialized(true);
                }, Math.max(0, processDelay));
            }
            else if (processDelay === 0) {
                setProcessTime(Date.now());
                setInitialized(true);
            }
        }
        return () => clearTimeout(timeout);
    }, [initialized, processDelay]);
    // Exponential backoff retry
    react_1.default.useEffect(() => {
        let timeout = undefined;
        if (initialized && !retryDisabled && typeof document !== 'undefined') {
            timeout = setTimeout(() => {
                const preEmbedElement = document.getElementById(uuidRef.current);
                if (!!preEmbedElement) {
                    setProcessTime(Date.now());
                    setRetryDelay(Math.max(0, Math.min(retryDelay * 2, retryBackoffMaxDelay)));
                    setRetryTime(Date.now());
                    setRetrying(true);
                }
            }, Math.max(0, retryDelay));
        }
        return () => clearTimeout(timeout);
    }, [initialized, retryBackoffMaxDelay, retryDelay, retryDisabled, retryTime]);
    const urlWithNoQuery = url.replace(/[?].*$/, '');
    const cleanUrlWithEndingSlash = `${urlWithNoQuery}${urlWithNoQuery.endsWith('/') ? '' : '/'}`;
    const placeholder = embedPlaceholder ?? (react_1.default.createElement(__1.EmbedPlaceholder, { url: url, style: {
            width: divProps.style?.width ? '100%' : width ?? 325,
            height: divProps.style?.height ? '100%' : height ?? 500,
            borderColor: divProps.style?.borderColor ?? 'rgba(22,24,35,0.12)',
            borderRadius: divProps.style?.borderRadius ?? 8,
        } }));
    return (react_1.default.createElement("div", { ...divProps, className: (0, classnames_1.default)('rsme-embed rsme-tiktok-embed', divProps.className), style: { width: '100%', maxWidth: 605, minWidth: 325, minHeight: 500, ...divProps.style } },
        react_1.default.createElement("div", { className: (0, classnames_1.default)('tiktok-embed-container', divProps.className), style: { overflow: 'hidden', width: '100%', maxWidth: '540px' }, key: `${uuidRef}-${retryTime}` },
            !scriptLoadDisabled && (react_1.default.createElement(react_helmet_1.Helmet, { key: `tt-embed-${processTime}` }, react_1.default.createElement("script", { src: `https://www.tiktok.com/embed.js?t=${processTime}` }))),
            react_1.default.createElement("blockquote", { className: "tiktok-embed", cite: url, "data-video-id": embedId }, !placeholderDisabled ? (react_1.default.createElement("div", { style: { display: 'flex', justifyContent: 'center' } }, placeholder)) : (react_1.default.createElement("div", { style: { display: 'none' } }, "\u00A0"))))));
};
exports.TikTokEmbed = TikTokEmbed;
