# Marquee9

A lightweight, zero-dependency JavaScript library for creating smooth, glitch-free infinite marquees. No jump, no stutter on loop — just buttery-smooth scrolling.

---

## Features

- Zero-flicker infinite loop
- Responsive breakpoint support
- Blurred edge fade effect
- Pause on hover
- Reverse direction
- Auto-fills content to always cover the container width
- Single-line text mode
- Fully destroyable and reinitializable

---

## Installation

### CDN (jsDelivr)

```html
<script type="module">
    import Marquee9 from "https://cdn.jsdelivr.net/gh/yourusername/marquee9@latest/marquee.js";
</script>
```

### Download

Download `marquee.js` and import it locally:

```html
<script type="module">
    import Marquee9 from "./marquee.js";
</script>
```

---

## Basic Usage

**1. Add a container element with an ID and place your items inside it:**

```html
<div id="my-marquee">
    <img src="logo-1.png" alt="Logo 1" />
    <img src="logo-2.png" alt="Logo 2" />
    <img src="logo-3.png" alt="Logo 3" />
    <img src="logo-4.png" alt="Logo 4" />
</div>
```

**2. Initialize with JavaScript:**

```js
import Marquee9 from "./marquee.js";

Marquee9.init("my-marquee");
```

That's it. Marquee9 wraps your children, fills the container, and starts scrolling.

---

## With Settings

```js
Marquee9.init("my-marquee", {
    speed: "30s",
    gap: "3rem",
    pauseOnHover: true,
    blurredEdges: true,
    direction: true,
});
```

---

## Full Settings Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `speed` | `string` | `"10s"` | Animation duration. Higher = slower. Any CSS time value (`s`, `ms`). |
| `gap` | `string` | `"6rem"` | Space between items. Any CSS length value. |
| `pauseOnHover` | `boolean` | `false` | Pauses the marquee when the user hovers over it. |
| `paused` | `boolean` | `false` | Starts the marquee in a paused state. |
| `direction` | `boolean` | `true` | `true` scrolls left (normal), `false` scrolls right (reverse). |
| `blurredEdges` | `boolean` | `false` | Fades out the left and right edges with a gradient mask. |
| `oneLineText` | `boolean` | `false` | Forces text content onto a single line. Use for text marquees. |
| `childWidthSettings` | `object` | — | Controls the width of each item. See below. |
| `responsive` | `array` | — | Breakpoint-specific setting overrides. See below. |

### `childWidthSettings`

Controls how wide each marquee item is. You can either fix the width or use a fluid `clamp()` range.

| Option | Type | Default | Description |
|---|---|---|---|
| `childrenFixedWidth` | `string` | — | Sets a fixed width for all items, overrides clamp settings. |
| `childMinWidth` | `string` | `"10rem"` | Minimum width in the clamp range. |
| `childPreferedWidth` | `string` | `"40vmin"` | Preferred (fluid) width in the clamp range. |
| `childMaxWidth` | `string` | `"30rem"` | Maximum width in the clamp range. |

### `responsive`

An array of breakpoint objects. Each overrides specific settings below a given viewport width. Only the settings you specify are overridden — everything else falls back to the default settings.

| Option | Type | Description |
|---|---|---|
| `breakpoint` | `number` | Viewport width in `px` at which these settings activate (`max-width`). |
| `settings` | `object` | Any subset of the options above (except `oneLineText`). |

---

## Full Example

```js
Marquee9.init("brand-logos", {
    speed: "40s",
    gap: "4rem",
    pauseOnHover: true,
    blurredEdges: true,
    direction: true,
    childWidthSettings: {
        childMinWidth: "8rem",
        childPreferedWidth: "15vw",
        childMaxWidth: "160px",
    },
    responsive: [
        {
            breakpoint: 1024,
            settings: {
                speed: "28s",
                gap: "2.5rem",
                blurredEdges: false,
            },
        },
        {
            breakpoint: 600,
            settings: {
                speed: "18s",
                gap: "1.5rem",
                childWidthSettings: {
                    childMinWidth: "6rem",
                    childPreferedWidth: "25vw",
                    childMaxWidth: "120px",
                },
            },
        },
    ],
});
```

---

## Text Marquee Example

For scrolling a single line of text, enable `oneLineText`:

```html
<div id="text-marquee">
    <span>Free shipping on all orders over $50 &nbsp;·&nbsp; New arrivals every Friday &nbsp;·&nbsp;</span>
</div>
```

```js
Marquee9.init("text-marquee", {
    speed: "20s",
    oneLineText: true,
    pauseOnHover: true,
});
```

---

## Instance Methods

`Marquee9.init()` returns an instance with the following methods:

```js
const marquee = Marquee9.init("my-marquee", { ... });

// Destroy the marquee and restore original HTML
marquee.destroy();
```

---

## Multiple Marquees

Each call to `Marquee9.init()` is independent. You can have as many marquees as you need on the same page:

```js
Marquee9.init("logos-marquee", { speed: "40s", direction: true });
Marquee9.init("text-marquee", { speed: "15s", oneLineText: true });
Marquee9.init("partners-marquee", { speed: "60s", blurredEdges: true });
```

---

## License

MIT
