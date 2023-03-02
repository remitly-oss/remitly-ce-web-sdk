const BackgroundColor = '#FBF8F2';
const DarkBlue = '#226ba4';
const easeOpen = "cubic-bezier(0.7,0,0.3,1)";
const easeClose = "cubic-bezier(0.7,0,0.3,1)";
const mobileWidth = 480;

const getIsMobile = () => window.innerWidth <= mobileWidth;

const getNextDisplayStatus = (state, action) => {
    if (action === 'close') {
        if (state.isFromButton && state.displayStatus === 'open') {
            return 'floating';
        }
        return 'hidden';
    } else if (action === 'open') {
        return 'open';
    }
}

const updateDisplayStatus = (state, action) => {
    const nextDisplayStatus = getNextDisplayStatus(state, action);
    state.displayStatus = nextDisplayStatus;
    state.onStateChange?.(nextDisplayStatus);
}

const log = (state, message) => {
    if (state.enableConsoleLogs) {
        console.log(message);
    }
}

const getConfig = (state, config) => ({
    environment: "production",
    onLoad: () => { log(state, "onLoad"); },
    onStateChange: (displayStatus) => { log(state, displayStatus); },
    onMessage: () => { log(state, "onMessage"); },
    enableConsoleLogs: false,
    ...config
});

const getMessageListener = (state) => (message) => {
    if (!state.url.includes(message.origin)) {
        return;
    }

    const event = JSON.parse(message.data);
    const topic = event?.topic;
    if (topic === "exitCE") {
        state.close?.();
        updateDisplayStatus(state, 'close');
    } else if (topic === "event") {
        state.onMessage?.(event.payload.eventType);
    } else if (topic === "hideCloseButton") {
        // We need to post the ce_login_redirect message after Narwhal is initialized and listening for events
        // Therefore we wait on the hideCloseButton event, which is fired once after Narwhal's initialization  
        const redirectPath = `${state.defaultReceiveCountry}/${state.appId}?utm_medium=channelpartner&utm_source=${state.appId}`;

        // Using '*' is fine because the redirectPath is public information
        state.iframe.contentWindow.postMessage(
            { 
                topic: 'ce_login_redirect',
                payload: redirectPath
            },
            '*',
        );
    }
};

function makeUrl(config, baseUrl) {
    const urlString = [
        baseUrl,
        config.customerCountry,
        config.customerLanguage,
        config.defaultReceiveCountry,
        config.appId
    ].filter(x => !!x).join("/")

    const url = new URL(urlString);
    const params = url.searchParams;

    params.set('utm_medium', 'channelpartner');
    params.set('utm_source', config.appId);
    if (config.customerEmail) {
        params.set('email_prefill', encodeURIComponent(config.customerEmail));
    }

    return url.href;
}

function getIframeUrl(config) {
    // For running other packages locally, uncomment either of the following.

    // For Narwhal:
    // return "http://localhost:3000";

    // For Portal:
    // return "http://remitlyweb.test:443";
    
    // For Caribou:
    // You will also need to replace 127.0.0.1 in devTemplate.html with a different address
    // by running serve:script without specifying -a 127.0.0.1
    // return "http://localhost:3001/test_component/en/us/mexico/1006c281-4db7-4eb1-920a-325321e5b180";

    if (config.environment === "development" || config.environment === "staging") {
        return makeUrl(config, "https://preprod.dev.remitly.com");
    } else {
        return makeUrl(config, "https://remitly.com");
    }
}

const centerModalStyle = {
    position: "fixed",
    top: "50%",
    right: "auto",
    bottom: "auto",
    left: "50%",
    width: "380px",
    height: "100%",
    maxHeight: "680px",
    transform: "translate(-50%, -50%)",
    borderRadius: "16px",
    opacity: "1",
    borderWidth: "0px",
}

const leftModalStyle = {
    ...centerModalStyle,
    left: "6%",
    right: "auto",
    transform: "translate(0, -50%)",
}

const rightModalStyle = {
    ...centerModalStyle,
    right: "6%",
    left: "auto",
    transform: "translate(0, -50%)",
}

const mobileModalStyle = {
    position: "fixed",
    top: "10%",
    right: "auto",
    bottom: "auto",
    left: "auto",
    width: "100%",
    height: "100%",
    maxHeight: "none",
    transform: "none",
    borderRadius: "16px 16px 0px 0px",
    opacity: "1",
    borderWidth: "0px",
}

const fabStyle = {
    position: 'fixed',
    top: 'auto',
    right: "15%",
    bottom: "15%",
    left: 'auto',
    width: '64px',
    height: '64px',
    maxHeight: "none",
    transform: "none",
    borderRadius: '32px',
    opacity: "1",
    borderWidth: "2px",
};

const bottomBarStyle = {
    position: 'fixed',
    top: 'auto',
    right: "0px",
    bottom: "0px",
    left: '0',
    width: 'auto',
    height: '64px',
    maxHeight: "none",
    transform: "none",
    borderRadius: '16px',
    opacity: "1",
    borderWidth: "0px",
};

const hiddenAtBottomStyle = {
    position: "fixed",
    top: "100%",
    right: "auto",
    bottom: "0px",
    left: "auto",
    width: "100%",
    height: "100%",
    maxHeight: "none",
    transform: "none",
    borderRadius: "16px 16px 0px 0px",
    opacity: "1",
    borderWidth: "0px",
}

const hiddenLeftStyle = {
    ...leftModalStyle,
    left: "-10%",
    opacity: "0",
}

const hiddenCenterStyle = {
    ...centerModalStyle,
    opacity: "0",
}

const hiddenRightStyle = {
    ...rightModalStyle,
    right: "-10%",
    opacity: "0",
}

function getButtonShape(state) {
    const buttonContainerPos = state.buttonContainer.getBoundingClientRect();
    const { top, left, width, height } = buttonContainerPos;
    return { position: 'fixed', top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px`, borderRadius: '0px', opacity: "1", transform: "none", bottom: "auto", right: "auto" };
}

function getCurrentShape(state) {
    if (state.displayStatus === 'closed' && state.isFromButton) {
        return getButtonShape(state);
    }

    return getShape(state);
}

function getShape(state) {
    switch (state.displayStatus) {
        case "closed":
        case "hidden":
            if (state.isMobile) {
                return hiddenAtBottomStyle;
            }
            if (state.layout.modalPosition === 'left') {
                return hiddenLeftStyle;
            }
            if (state.layout.modalPosition === 'right') {
                return hiddenRightStyle;
            }
            return hiddenCenterStyle;
        
        case "floating":
            if (state.isMobile) {
                return bottomBarStyle;
            }
            return fabStyle;

        case "open":
        default:
            if (state.isMobile) {
                return mobileModalStyle;
            }

            if (state.layout.modalPosition === 'left') {
                return leftModalStyle;
            }
            if (state.layout.modalPosition === 'right') {
                return rightModalStyle;
            }

            return centerModalStyle;
    }
}

function getCurrentAndNextShapes(state, newState) {
    let currentShape = getCurrentShape(state);
    let nextShape = getShape({ ...state, ...newState });

    if (!currentShape) {
        currentShape = { ...nextShape, opacity: 0 }
    }

    return { currentShape, nextShape };
}

// TODO: Debounce OR use the animation finish event to prevent simultaneous transformations
function transformElements(state, newState, elements, duration = 600) {
    const { currentShape, nextShape } = getCurrentAndNextShapes(state, newState);
    const easing = (newState.displayStatus ?? state.displayStatus) === "open" ? easeClose : easeOpen;

    elements.forEach((element) => element.animate([
        currentShape,
        nextShape
    ], {
        duration,
        fill: "forwards",
        easing,
    }));

    state.iframe.style.borderRadius = nextShape.borderRadius;
}

function revealIframeContainer(state, duration) {
    state.iframeContainer.style.display = 'block';
    updateScrimPosition(state);
    state.scrim.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], { duration, fill: "forwards", easing: easeOpen, });
}

function hideIframeContainer(state, duration) {
    setTimeout(() => {
        state.iframeContainer.style.display = 'none';
    }, duration);
    state.scrim.animate([
        { width: '100%', opacity: 1 },
        { width: '100%', opacity: 0 }
    ], { duration, fill: "forwards", easing: easeClose, });
}

const updateScrimPosition = (state) => {
    if (state.layout.modalPosition === 'left') {
        state.scrim.style.background = 'linear-gradient(to right, #0008, #0000)';
    } else if (state.layout.modalPosition === 'right') {
        state.scrim.style.background = 'linear-gradient(to left, #0008, #0000)';
    } else {
        state.scrim.style.background = 'rgba(0, 0, 0, 0.6)';
    }
}

const openModal = (state, duration = 800) => {
    revealIframeContainer(state, duration);

    state.isMobile = getIsMobile();
    const { currentShape, nextShape } = getCurrentAndNextShapes(state, { displayStatus: 'open' });

    state.iframe.animate([
        currentShape,
        nextShape
    ], {
        duration,
        fill: "forwards",
        easing: easeOpen,
    });
}

function closeModal(state, duration = 800) {
    hideIframeContainer(state, duration);
    const { currentShape, nextShape } = getCurrentAndNextShapes(state, { displayStatus: 'closed' });

    state.iframe.animate([
        currentShape,
        nextShape
    ], {
        duration,
        fill: "forwards",
        easing: easeOpen,
    });
}

function RemitlyButton( state ) {
    state.button.addEventListener( 'click', getOpenButton(state) );

    state.buttonContainer.style.cssText = `
        background-color: ${BackgroundColor};
        border: 2px solid ${DarkBlue};
        height: 80px;
        width: 180px;
    `;

    // TODO: Colors should be determined by the config
    state.button.style.cssText = `
        background-color: rgb(0, 0, 0, 0);
        color: ${DarkBlue};
        width: 100%;
        height: 100%;
        font-size: 21;
        border: none;
        font-weight: 600;
    `;
}

const getOpenButton = (state) => () => {
    state.isFromButton = true;
    state.layout.modalPosition = 'center';
    prepareStateOnOpen(state);
    attachToParent(state);

    state.iframe.style.cssText = `
        height: 100%;
        width: 100%;
    `;

    state.close = () => { hideIframeContainer(state, 200); getCloseButton(state)(); };
    setTimeout(() => revealIframeContainer(state, 600), 200);

    transformElements(state, { displayStatus: 'open' }, [state.buttonContainer, state.iframe]);
    
    state.button.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 600,
        fill: "forwards",
        ease: easeOpen,
    });

    updateDisplayStatus(state, 'open');
}

const getCloseButton = (state) => () => {
    const nextDisplayStatus = getNextDisplayStatus(state, 'close');
    transformElements(state, { displayStatus: nextDisplayStatus }, [state.buttonContainer, state.iframe]);
    if (nextDisplayStatus === 'hidden') {
        state.isFromButton = false;
    }
}

const getOpen = (state) => (layout) => {
    if (state.isFromButton) {
        getOpenButton(state)();
        return;
    }

    prepareStateOnOpen(state);
    attachToParent(state);
    
    Object.assign(state.layout, layout);
    openModal(state);
    state.close = () => closeModal(state);

    updateDisplayStatus(state, 'open');
}

const getClose = (state) => () => {
    state.close?.();

    if (state.displayStatus === 'closed') {
        document.removeEventListener("message", state.messageListener);
        state.iframe.removeEventListener("load", state.loadListener);
        state.mediaQueryList.removeEventListener("change", state.mediaListener);
    }

    updateDisplayStatus(state, 'close');
}

function prepareStateInitial(state) {
    const iframeContainer = document.createElement("div");
    const iframe = document.createElement("iframe");
    const scrim = document.createElement("div");
    iframeContainer.appendChild(scrim);
    iframeContainer.appendChild(iframe);
    state.url = getIframeUrl(state);
    
    iframeContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    `;
    scrim.style.cssText = `
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.6);
        pointer-events: none;
    `;
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        pointer-events: auto;
    `

    const messageListener = getMessageListener(state);
    const loadListener = () => state.onLoad?.();

    const mediaQueryList = window.matchMedia(`(max-width: ${mobileWidth}px)`);
    const mediaListener = (e) => {
        if (state.displayStatus === 'floating' || state.displayStatus === 'open') {
            const newState = { isMobile: e.matches };
            const elements = [state.iframe];
            if (state.isFromButton) {
                elements.push(state.buttonContainer);
            }
            this.transformElements(state, newState, elements);
        }
        state.isMobile = e.matches;
    };

    iframe.setAttribute("frameBorder", "0");
    iframe.setAttribute("id", "RemitlyFrame");
    iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms allow-modals allow-popups allow-top-navigation");
    iframe.setAttribute("referrerpolicy", "origin");
    iframeContainer.setAttribute("id", "RemitlyFrameContainer");
    scrim.setAttribute("id", "RemitlyScrim");

    return { url: state.url, iframe, iframeContainer, scrim, mediaQueryList, mediaListener, messageListener, loadListener }
}

function prepareStateOnOpen(state) {
    state.iframe.setAttribute("src", state.url);
    window.addEventListener("message", state.messageListener);
    state.iframe.addEventListener("load", state.loadListener);
    state.mediaQueryList.addEventListener("change", state.mediaListener);
    state.isMobile = getIsMobile();
}

function attachToParent(state) {
    document.body.appendChild(state.iframeContainer);
}

function sanitizeInputConfig(config) {
    const { onLoad, onMessage, onStateChange, enableConsoleLogs, appId, environment, customerCountry, customerLanguage, defaultReceiveCountry, customerEmail } = config;

    // TODO: Validate data types; try to defend against malicious props

    return { onLoad, onMessage, onStateChange, enableConsoleLogs, appId, environment, customerCountry, customerLanguage, defaultReceiveCountry, customerEmail };
}

const outputState = {
    open: () => { console.log(`Please initialize Remitly before calling 'open'`); },
    close: () => { console.log(`Please initialize Remitly before calling 'close'`); }
}

function initializeRemitly(inputConfig) {
    inputConfig = sanitizeInputConfig(inputConfig);
    const buttonContainer = document.getElementById('remitly-button-container');
    const button = document.getElementById('remitly-button');
    const layout = { modalPosition: 'center' };
    const state = { layout, button, buttonContainer, displayStatus: 'closed', isFromButton: false, close: undefined };
    Object.assign(state, getConfig(state, inputConfig));
    Object.assign(state, prepareStateInitial(state));

    log(state, "<<<< Remitly SDK loaded >>>>");

    if (button && buttonContainer) {
        new RemitlyButton( state );
    }

    outputState.open = getOpen(state);
    outputState.close = getClose(state);
}

window.Remitly = {
    initialize: initializeRemitly,
    open: ({ modalPosition }) => outputState.open({ modalPosition }),
    close: () => outputState.close(),
}
