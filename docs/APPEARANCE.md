# Appearance preferences

Use **Theme** in the public header or workspace header. The same picker is also
available under **Settings & account → Appearance**. Choose Signature Plum,
Forest & Sand, Atlantic Blue, Midnight, or Follow device. The standalone HTML
edition has a Theme selector in its header.

The preference applies to the public site, sign-in, workspace, knowledge centre,
forms, charts and document dialogs. It is saved per browser profile, independently
of accounts and workspace data; it does not synchronise between devices. Storage
changes update other tabs. Follow device reacts to the operating system's light
or dark setting. When storage is unavailable, the picker remains usable for the
current page session and explains that the choice was not saved.

`src/theme.ts` owns the accepted choices and storage behaviour. The tiny generated
`public/assets/theme-init.js` restores the choice in the document head before rendering.
`scripts/build-theme.mjs` regenerates it during `npm run build`; the standalone
build embeds it and the same palettes without external dependencies.
`src/themes.css` defines semantic colour roles, and legacy surfaces use CSS
`light-dark()` for compatibility with the dark palette in modern browsers.
Print styling uses a light palette for readable exports.

Browser coverage checks persistence, early restoration, cross-tab changes,
device-setting changes, unavailable storage, keyboard controls, account settings,
mobile width, offline operation, and text contrast on the main surfaces and
controls. Theme preferences do not require a database migration or provider key.
