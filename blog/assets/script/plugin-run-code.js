var url = 'http://localhost:65500';
var server_status = null;

(function(){
const hash = window.location.hash.substring(1);
const hashParams = new URLSearchParams(hash);
const server = hashParams.get('server');
if (server) {
    url = decodeURIComponent(server);
    if (!url.startsWith('http')) {
        url = 'http://' + url;
    }
} else {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        url = "//" + window.location.hostname + ':65500';
    }
}
})();

function testServer() {
    if (server_status !== null) {
        return server_status;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    server_status = false;
  
    try {
      xhr.send(null);
      if (xhr.status === 200) {
        server_status = true;
        return true;
      } else {
        return false;
      }
    } catch (e) {
    //   console.error(e.message);
      return false;
    }
}

async function runCode(lang, code) {
    if (lang === 'js' || lang === 'javascript') {
        try {
            const startTime = new Date().getTime();
            const output = eval(code);
            const elapsed = new Date().getTime() - startTime;
            return {success: true, output: String(output), elapsed: elapsed};
        } catch (err) {
            return {success: false, output: err.message};
        }
    } else if (lang === 'json') {
        try {
            const obj = JSON.parse(code);
            return {success: true, output: JSON.stringify(obj, null, 2)};
        } catch (err) {
            return {success: false, output: err.message};
        }
    }


    try {
        const encoder = new TextEncoder();
        const utf8Encoded = encoder.encode(code);
        const data = {lang: lang, code: btoa(String.fromCharCode(...utf8Encoded))}; 
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    } catch (err) {
        return {success:false, output:err.message}
    }
}

function fullScreen(pre) {
    var button = document.createElement('button');
    button.innerText = 'Toggle Full Screen';
    button.style.position = 'absolute';
    button.style.left = '40%';
    button.style.top = '5px';
    button.style.opacity = '0';
    button.style.visibility = 'hidden';
    pre.addEventListener('mouseover', function() {
        button.style.opacity = '0.6';
        button.style.visibility = 'visible';
    });
    pre.addEventListener('mouseout', function() {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
    });

    pre.appendChild(button);
    button.addEventListener('click', function() {
        const code_div = pre.querySelector('div[class="run-code-container"]')
        if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            if (code_div) code_div.style.maxHeight = '300px';
            return;
        }
        if (code_div) code_div.style.maxHeight = '90%';
        if (pre.requestFullscreen) {
            pre.requestFullscreen();
        } else if (pre.mozRequestFullScreen) {
            pre.mozRequestFullScreen();
        } else if (pre.webkitRequestFullscreen) {
            pre.webkitRequestFullscreen();
        } else if (pre.msRequestFullscreen) {
            pre.msRequestFullscreen();
        }
    });
}

(function () {
    const langs = ['js', 'javascript', 'python', 'py', 'python3', 'java',
        'c', 'cpp', 'go', 'rust', 'lua', 'json', 'bash', 'sh', 'shell'];
    var plugin = function (hook, vm) {
        // 每次路由切换时数据全部加载完成后调用，没有参数。
        hook.doneEach(function() {
            // 获取所有的代码块
            var preElements = document.querySelectorAll('pre[data-lang]');
            preElements.forEach(function(preElement) {
                const copyButton = preElement.querySelector('button[class="docsify-copy-code-button"]');
                if (copyButton) {
                    copyButton.querySelector('span[class="label"]').innerText = 'Copy';
                    copyButton.style.borderRadius = '10%';
                }
                fullScreen(preElement);
                const lang = preElement.dataset.lang;
                if (lang !== 'js' && lang !== 'javascript' && lang !== 'json'
                    && !testServer()) {
                    return;
                }
                if (langs.indexOf(lang) === -1) {
                    return;
                }
                const codeBlock = preElement.querySelector('code');
                const code = codeBlock.innerText;
                var div = document.createElement('div');
                var button = document.createElement('button');
                var text = document.createElement('a');
                div.className = 'run-code-container';
                div.style.width = 'auto';
                div.style.overflowX = 'auto';
                div.style.overflowY = 'hidden';
                div.style.maxHeight = '300px';
                div.style.padding = '0 5px';
                div.appendChild(button);
                button.className = 'run-code-button';
                button.innerText = 'Run';
                button.style.background = 'gray'; 
                button.style.color = 'white';
                // button.style.border = 'none';
                button.style.opacity = '0.5';
                div.onmouseover = function() {
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                };
                div.onmouseout = function() {
                    button.style.opacity = '0.5';
                };

                button.onclick = function() {
                    button.disabled = true;
                    text.innerText = 'Running';
                    var cnt = 0;
                    const intervalId = setInterval(() => {
                        text.innerText += '.';
                        if (++cnt >= 4) {
                            text.innerText = 'Running';
                            cnt = 0;
                        }
                    }, 500);
                    text.style.color = 'white';
                    div.style.background = 'black';
                    runCode(lang, code).then(data => {
                        button.disabled = false;
                        clearInterval(intervalId);
                        // console.log(data);
                        div.style.background = 'black';
                        div.style.border = '1px solid gray';
                        if (data.output && data.output.split('\n').length > 10) {
                            div.style.overflowY = 'auto';
                        }

                        if (data.success) {
                            var ts = '';
                            if (typeof data.elapsed !== 'undefined') {
                                ts = data.elapsed.toFixed(3);
                                ts = `<span style='color:yellow'>${ts} ms</span>`;
                            }
                            text.innerHTML =  ts + "\n" + data.output;
                            text.style.color = 'white';
                            if (data.data) {
                                if (data.data.fig) {
                                    var img = document.createElement('img');
                                    img.src = 'data:image/png;base64,' + data.data.fig;
                                    img.style.maxWidth = '100%';
                                    img.style.height = 'auto';
                                    div.appendChild(img);
                                    div.style.overflowY = 'auto';
                                }
                            }
                        } else {
                            text.innerText = "\n[ERROR]\n" + data.output;
                            text.style.color = 'red';
                        }
                    });
                }
                div.appendChild(text);
                text.className = 'run-code-output';
                text.style.fontSize = '12px';
                text.style.marginLeft = '10px';
                text.style.color = 'white';
                text.style.padding = '5px';
                text.innerText = '';
                preElement.appendChild(div);
            });
        });
    }
  
    // Add plugin to docsify's plugin array
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
  })();