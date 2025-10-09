// client/common-components.js

/**
 * Fetches HTML from a source URL and injects its content into a target selector.
 * @param {string} sourceURL The URL to fetch HTML from.
 * @param {string} targetSelector The CSS selector of the element to inject into.
 */
async function fetchAndInject(sourceURL, targetSelector) {
    try {
        const response = await fetch(sourceURL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const sourceContent = doc.body.innerHTML;
        document.querySelector(targetSelector).innerHTML = sourceContent;
    } catch (error) {
        console.error(`Failed to fetch and inject ${targetSelector}:`, error);
    }
}

/**
 * Loads the main app script after the header is injected.
 */
async function loadMainScript() {
    await fetchAndInject('header.html', '#header-container');
    const mainScript = document.createElement('script');
    mainScript.src = 'script.js';
    mainScript.onload = () => {
        if (window.initializeApp) {
            window.initializeApp();
        }
    };
    document.body.appendChild(mainScript);
}

// Start the process of loading the page components
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMainScript);
} else {
    loadMainScript();
}