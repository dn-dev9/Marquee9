class Marquee9 {
    static #token = Symbol();
    static marqueeInstances = [];
    static setGlobalSettingsOnceFlag = false;
    static windowResizeTimer;
    static global_style_element;

    constructor(marqueeElement, token) {
        if (token !== Marquee9.#token) {
            throw new Error("Use Marquee9.init() instead of new Marquee9()");
        }

        this.marquee = marqueeElement;
        this.style_element = null;
        this.marquee_track = null;
        this.marquee_group = null;
        this.marquee_group_duplicate = null;
        this.marquee_children = Array.from(this.marquee.children);
    }

    static init(selector = "marquee9", settings = {}) {
        selector = "#" + CSS.escape(selector);
        const marqueeElement = document.querySelector(selector);

        if (!marqueeElement) {
            throw new Error(`Marquee container not found: ${selector}`);
        }

        if (this._checkExistence(marqueeElement)) return;

        if (!this.setGlobalSettingsOnceFlag) {
            this._addGlobalCSSStyles();
            this._addWindowResizeEventListener();
            this.setGlobalSettingsOnceFlag = true;
        }

        const instance = new Marquee9(marqueeElement, Marquee9.#token);
        instance.style_element = this._addSpecificCSSStyles(selector, settings);
        instance.build();

        this.marqueeInstances.push(instance);

        return instance;
    }

    static _checkExistence(element) {
        return this.marqueeInstances.some((m) => m.marquee === element);
    }

    static _addWindowResizeEventListener() {
        window.addEventListener("resize", () => {
            clearTimeout(this.windowResizeTimer);
            this.windowResizeTimer = setTimeout(() => {
                this.marqueeInstances.forEach((marquee) => {
                    marquee._handleContentFill();
                });
            }, 150);
        });
    }

    static _addGlobalCSSStyles() {
        this.global_style_element = document.createElement("style");
        this.global_style_element.id = "marquee9-styles";

        const CSSString = `
            @keyframes marquee9Animation {
                from {
                    transform: translateX(0);
                }

                to {
                    transform: translateX(calc(-100% - var(--gap)));
                }
            }   

            .marquee9 {
                max-width: 100%;
            }

            .marquee9__track {
                display: flex;
                overflow: hidden;
            }

            .marquee9__group {
                min-width: 100%;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                animation-name: marquee9Animation;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
            }

            .marquee9__group img {max-width: 100%;}
        `;

        this.global_style_element.textContent = CSSString;
        document.head.append(this.global_style_element);
    }

    static _addSpecificCSSStyles(selector, settings) {
        const sanitizeCSSValue = (value) => {
            return String(value).replace(/[{};'"\\]/g, "");
        };

        const gap = sanitizeCSSValue(settings.gap ?? "6rem");
        let speed = sanitizeCSSValue(settings.speed ?? "10s");

        if (settings.paused) speed = "0s";

        const childrenFixedWidth = settings?.childWidthSettings?.childrenFixedWidth
            ? sanitizeCSSValue(settings?.childWidthSettings?.childrenFixedWidth)
            : null;

        const childMinWidth = sanitizeCSSValue(settings?.childWidthSettings?.childMinWidth ?? "10rem");
        const childPreferedWidth = sanitizeCSSValue(settings?.childWidthSettings?.childPreferedWidth ?? "40vmin");
        const childMaxWidth = sanitizeCSSValue(settings?.childWidthSettings?.childMaxWidth ?? "30rem");

        let childElemWidth = childrenFixedWidth
            ? childrenFixedWidth
            : `clamp(${childMinWidth}, ${childPreferedWidth}, ${childMaxWidth})`;

        if (settings.oneLineText) childElemWidth = "100%";

        const animationState = settings.pauseOnHover ? "paused" : "running";
        const animationDirection = settings.direction ? "normal" : "reverse";

        const maskImage = settings.blurredEdges
            ? "linear-gradient(to right, hsl(0 0% 0% / 0), hsl(0 0% 0% / 1) 20%, hsl(0 0% 0% / 1) 80%, hsl(0 0% 0% / 0))"
            : "none";

        let CSSString = `

            ${selector} .marquee9__track:hover .marquee9__group {
                animation-play-state: ${animationState} ;
            }

            ${selector} .marquee9__track {
                gap: ${gap};
                mask-image: ${maskImage};
            }


            ${selector} .marquee9__group {
                gap: ${gap};
                --gap: ${gap};
                animation-duration: ${speed};
                animation-direction: ${animationDirection};
            }

            ${selector} .marquee9__child {
                ${settings.oneLineText ? `white-space: nowrap;` : ""}
                width: ${childElemWidth};
            }
        `;

        if ("responsive" in settings && settings.responsive.length) {
            settings.responsive.sort((a, b) => b.breakpoint - a.breakpoint);

            for (const settingsObject of settings.responsive) {
                if (!Number(settingsObject.breakpoint)) continue;

                const responsiveSettings = settingsObject.settings;

                let responsiveCSSString = ` @media(max-width:${settingsObject.breakpoint}px) {`;

                if ("pauseOnHover" in responsiveSettings) {
                    const animationState = responsiveSettings.pauseOnHover ? "paused" : "running";
                    responsiveCSSString += ` ${selector} .marquee9__track:hover .marquee9__group {
                        animation-play-state: ${animationState} ;
                    } `;
                }

                if ("childWidthSettings" in responsiveSettings) {
                    const childrenFixedWidth = responsiveSettings.childWidthSettings?.childrenFixedWidth
                        ? sanitizeCSSValue(responsiveSettings.childWidthSettings.childrenFixedWidth)
                        : null;

                    const childMinWidth = sanitizeCSSValue(
                        responsiveSettings.childWidthSettings?.childMinWidth ?? "10rem",
                    );
                    const childPreferedWidth = sanitizeCSSValue(
                        responsiveSettings.childWidthSettings?.childPreferedWidth ?? "40vmin",
                    );
                    const childMaxWidth = sanitizeCSSValue(
                        responsiveSettings.childWidthSettings?.childMaxWidth ?? "30rem",
                    );

                    let childElemWidth = childrenFixedWidth
                        ? childrenFixedWidth
                        : `clamp(${childMinWidth}, ${childPreferedWidth}, ${childMaxWidth})`;

                    responsiveCSSString += ` ${selector} .marquee9__child {
                            width: ${childElemWidth};
                        }
                    `;
                }

                let trackCSS = ` ${selector} .marquee9__track {`;
                let groupCSS = ` ${selector} .marquee9__group {`;

                if ("gap" in responsiveSettings) {
                    const gap = sanitizeCSSValue(responsiveSettings.gap);
                    trackCSS += `gap: ${gap};`;
                    groupCSS += `gap: ${gap}; --gap: ${gap};`;
                }

                if ("blurredEdges" in responsiveSettings) {
                    const maskImage = responsiveSettings.blurredEdges
                        ? "linear-gradient(to right, hsl(0 0% 0% / 0), hsl(0 0% 0% / 1) 20%, hsl(0 0% 0% / 1) 80%, hsl(0 0% 0% / 0))"
                        : "none";
                    trackCSS += `mask-image: ${maskImage};`;
                }

                if ("speed" in responsiveSettings || responsiveSettings.paused) {
                    let speed = responsiveSettings.paused ? "0s" : sanitizeCSSValue(responsiveSettings.speed);
                    groupCSS += `animation-duration: ${speed};`;
                }

                if ("direction" in responsiveSettings) {
                    const animationDirection = responsiveSettings.direction ? "normal" : "reverse";
                    groupCSS += `animation-direction: ${animationDirection};`;
                }

                trackCSS += "}";
                groupCSS += "}";

                responsiveCSSString += trackCSS;
                responsiveCSSString += groupCSS;
                responsiveCSSString += "}";

                CSSString += responsiveCSSString;
            }
        }

        const style = document.createElement("style");
        style.textContent = CSSString;
        document.head.append(style);
        return style;
    }

    build() {
        this._wrapChildren();
        this._createDOM();
        this._fillGroup();
        this._duplicateGroup();
    }

    _createDOM() {
        this.marquee.innerHTML = "";
        this.marquee.classList.add(`marquee9`);

        const marquee_track = document.createElement("div");
        marquee_track.classList.add(`marquee9__track`);
        this.marquee_track = marquee_track;

        const marquee_group = document.createElement("div");
        marquee_group.classList.add(`marquee9__group`);
        this.marquee_group = marquee_group;

        marquee_track.append(marquee_group);
        this.marquee.append(marquee_track);
    }

    _wrapChildren() {
        this.marquee_children = this.marquee_children.map((child) => {
            const marquee_child = document.createElement("div");
            marquee_child.classList.add(`marquee9__child`);
            marquee_child.append(child);
            return marquee_child;
        });
    }

    destroy() {
        this.style_element?.remove();
        Marquee9.marqueeInstances = Marquee9.marqueeInstances.filter((m) => m !== this);

        if (Marquee9.marqueeInstances.length === 0) {
            Marquee9.global_style_element?.remove();
            Marquee9.setGlobalSettingsOnceFlag = false;
        }

        const original_children = this.marquee_children.map((child) => child.firstElementChild);
        this.marquee.innerHTML = "";
        this.marquee.classList.remove("marquee9");
        this.marquee.append(...original_children);
    }

    _fillGroup() {
        this.marquee_group.innerHTML = "";
        this.marquee_group.append(...this.marquee_children);

        const marqueeWidth = this.marquee.offsetWidth;
        let groupWidth = 0;

        for (const child of this.marquee_children) {
            groupWidth += child.offsetWidth;
        }
        const style = getComputedStyle(this.marquee_group);
        const gap = parseFloat(style.gap) || 0;
        groupWidth += (this.marquee_children.length - 1) * gap;

        const remainingFreeSpace = marqueeWidth - groupWidth;

        if (remainingFreeSpace > 0 && groupWidth > 0) {
            this._duplicateChildren(remainingFreeSpace, gap);
        }
    }

    _duplicateChildren(remainingFreeSpace, gap) {
        let loopAroundIndx = 0;
        while (remainingFreeSpace > 0) {
            const duplicate = this.marquee_children[loopAroundIndx].cloneNode(true);
            this.marquee_group.appendChild(duplicate);
            const duplicateSize = duplicate.offsetWidth + gap;

            if (duplicateSize <= 0) break;
            remainingFreeSpace -= duplicateSize;
            loopAroundIndx++;
            loopAroundIndx %= this.marquee_children.length;
        }
    }

    _duplicateGroup() {
        if (!this.marquee_group_duplicate) {
            this.marquee_group_duplicate = this.marquee_group.cloneNode(true);
            this.marquee_track.append(this.marquee_group_duplicate);
        } else {
            this.marquee_group_duplicate.replaceChildren(...this.marquee_group.cloneNode(true).childNodes);
        }
    }

    _handleContentFill() {
        this._fillGroup();
        this._duplicateGroup();
    }
}

export default Marquee9;
