
function loadStyle(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
}

function onSwitchTheme(theme) {
    r = document.URL.match(/.*(#.*)/);
    window.location.href = "/?theme=" + theme + r[1];
    return false;
}

(function() {
if (document.URL.indexOf('theme=dark') > 0) {
    loadStyle("https://cdn.bootcdn.net/ajax/libs/docsify/4.13.1/themes/dark.min.css");
} else if (document.URL.indexOf('theme=buble') > 0) {
    loadStyle("https://cdn.bootcdn.net/ajax/libs/docsify/4.13.1/themes/buble.min.css");
} else {
    loadStyle("https://cdn.bootcdn.net/ajax/libs/docsify/4.13.1/themes/vue.min.css");
}
})()