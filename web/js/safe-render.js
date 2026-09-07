/**
 * Untrusted text / Markdown rendering boundary.
 *
 * Markdown is the only supported route to dynamic HTML. When marked or
 * DOMPurify is unavailable, unsupported, or throws, content is rendered as
 * literal text instead of falling back to unsanitized HTML.
 */
(function initializeSafeRender(globalObject) {
    'use strict';

    const MARKDOWN_SANITIZE_CONFIG = Object.freeze({
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['script', 'style', 'form', 'button', 'textarea', 'select', 'option', 'iframe', 'object', 'embed', 'link', 'meta', 'img', 'picture', 'audio', 'video', 'source', 'track'],
        FORBID_ATTR: ['style'],
        ALLOW_ARIA_ATTR: false,
        ALLOW_DATA_ATTR: false,
        SANITIZE_NAMED_PROPS: true
    });

    function markdownToSafeHtml(source, options = {}) {
        const text = source == null ? '' : String(source);
        const preprocess = typeof options.preprocess === 'function'
            ? options.preprocess
            : value => value;

        try {
            const markedObject = globalObject.marked;
            const purifier = globalObject.DOMPurify;
            if (!markedObject || typeof markedObject.parse !== 'function'
                || !purifier || purifier.isSupported !== true
                || typeof purifier.sanitize !== 'function') {
                throw new Error('Marked or DOMPurify is unavailable or unsupported.');
            }

            const prepared = String(preprocess(text));
            const parsed = markedObject.parse(prepared, { breaks: true });
            const sanitized = purifier.sanitize(parsed, MARKDOWN_SANITIZE_CONFIG);
            return { html: String(sanitized), mode: 'html' };
        } catch (error) {
            console.error('Safe Markdown rendering failed. Displaying literal text.', error);
            const escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/\r?\n/g, '<br>');
            return { html: escaped, mode: 'text' };
        }
    }

    function renderMarkdownInto(target, source, options = {}) {
        if (!(target instanceof Element)) {
            throw new TypeError('SafeRender target must be a DOM Element.');
        }

        const result = markdownToSafeHtml(source, options);
        target.classList.toggle('safe-render-fallback', result.mode === 'text');
        target.innerHTML = result.html;
        return { mode: result.mode, hasContent: target.childNodes.length > 0 };
    }

    globalObject.SafeRender = Object.freeze({
        markdownToSafeHtml,
        renderMarkdownInto
    });
}(window));
