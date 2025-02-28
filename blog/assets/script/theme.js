
function reLoadStyle(id, url) {
    // console.log(id, url);
    var link = document.getElementById(id);
    link.href = url;
}

function onSwitchTheme(e, theme) {
    // r = document.URL.match(/.*(#.*)/);
    // window.location.href = "/?theme=" + theme + r[1];

    const themeId = 'themestyle';
    if (theme === 'dark') {
        reLoadStyle(themeId, "https://cdn.bootcdn.net/ajax/libs/docsify/4.13.1/themes/dark.min.css");
    } else if (theme === 'buble') {
        reLoadStyle(themeId, "https://cdn.bootcdn.net/ajax/libs/docsify/4.13.1/themes/buble.min.css");
    } else {
        reLoadStyle(themeId, "https://cdn.bootcdn.net/ajax/libs/docsify/4.13.1/themes/vue.min.css");
    }

    // const lightCodeTheme = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-xonokai.min.css';
    // const darkCodeTheme = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-dark.min.css';
    // const ghcolorsTheme =  'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-ghcolors.min.css';
    const codeStyleUrl = 'https://gen-w-deja.github.io/prism-themes/themes/'
    if (theme === 'dark') {
        // reLoadStyle('codestyle', codeStyleUrl + 'prism-atom-dark.css');
        reLoadStyle('codestyle', codeStyleUrl + 'prism-xonokai.css');
    } else if (theme === 'buble') {
        reLoadStyle('codestyle', codeStyleUrl + 'prism-ghcolors.css');
    } else {
        // reLoadStyle('codestyle', codeStyleUrl + 'prism-vs.css');
        reLoadStyle('codestyle', codeStyleUrl + 'prism-material-light.css');
    }

    if (e) {
        document.querySelectorAll('.theme-option').forEach(function (item) {
            item.classList.remove('selected');
        });
        e.classList.add('selected');
    }

    return false;
}

(function(){
    onSwitchTheme(null, 'light');
})();
