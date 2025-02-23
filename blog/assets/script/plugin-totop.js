
function addToTop() {
    var main = document.getElementsByTagName('main');
    if (main) {
        main = main[0];
        const toTop = document.createElement('a');
        toTop.innerHTML = '&#8682;';
        toTop.style.fontSize = '1.5em';
        // toTop.style.fontWeight = 'bold';
        toTop.style.width = '40px';
        toTop.style.position = 'fixed';
        toTop.style.bottom = '10px';
        toTop.style.right = '1px';
        toTop.style.zIndex = '1000';
        toTop.style.display = 'none';
        toTop.style.opacity = '0.5';
        toTop.addEventListener('click', () => {
            window.scrollTo(0, 0);
        });
        toTop.onmouseover = function() {
            toTop.style.opacity = '1';
            toTop.style.cursor = 'pointer';
        };
        toTop.onmouseout = function() {
            toTop.style.opacity = '0.5';
        };
        main.appendChild(toTop);

        window.addEventListener('scroll', () => {
            if (document.documentElement.scrollTop > 20) {
                toTop.style.display = 'block';
            } else {
                toTop.style.display = 'none';
            }
        });
    }
}

(() => {
    var plugin = function (hook, vm) {
        hook.ready(function(){
            addToTop();
        });
    }
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
})();