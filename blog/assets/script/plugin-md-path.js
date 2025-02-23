function isRelativePath(url) {
  const pre = /^(([a-zA-Z]*:)|\/)/;
  if (pre.test(url)) {
    return false;
  }

  return true;
}

function pathProcess(markdown, pwd) {
    const regexs = [/(src|href)="([^"]+)"/g, /(src|href)='([^']+)'/g];
    for (let regex of regexs) {
      markdown = markdown.replace(regex, (match, attribute, path) => {
        if (isRelativePath(path)) {
          const attr = `${attribute}="${pwd}${path}"`;
          return attr;
        }
        return match;
      });
    }

    const mdRegex = /\.(md|mdown|markdown|mkd)$/gi;
    // 匹配markdown链接，图片除外
    const regex = /([^!])\[([^\[\]]*)\]\(([^\(\)]*)\)/g;
    markdown = markdown.replace(regex, (match, p, tag, path) => {
      if (isRelativePath(path)) {
        path = `${pwd}${path}`;
      }
      var link = `${p}<a class="by-plug" href="${path}">${tag}</a>`
      mdRegex.lastIndex = 0;
      if (mdRegex.test(path)) {
        link = `${p}[${tag}](${path})`;
      }
      return link;
    });

  return markdown;
}

function fetchSync(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, false); // false makes the request synchronous

  try {
    xhr.send(null);
    if (xhr.status === 200) {
      return xhr.responseText;
    } else {
      throw new Error(`Request failed with status ${xhr.status}`);
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

function parseImport(markdown, pwd) {
  const lanMap = {
    "py": "python",
    "js": "javascript",
    "ts": "typescript",
    "sh": "bash",
  }
  function getLanguage(ext) {
    return lanMap[ext] || ext;
  }

  const regex = /@import\s+['"]([^'"]+)['"]/g;
  markdown = markdown.replace(regex, (match, path) => {
    // console.log(match);
    var idx = path.lastIndexOf('.');
    var ext = '';
    if (idx >= 0) {
      ext = path.substring(idx + 1);
    }
    const fname = path.split('/').pop();
    if (isRelativePath(path)) {
      path = pwd + path;
    }
    // console.log(path);
    var link = `<a class="by-plug" href="${path}">&gt;&gt; ${fname}</a>\n`
    var codeBlock = "```" + getLanguage(ext) + "\n";
    codeBlock += fetchSync(path);
    codeBlock += "\n```\n";
    return link + codeBlock;
  })

  return markdown
}

(function () {
    var plugin = function (hook, vm) {
      hook.beforeEach(function(markdown){
        const path = vm.route.file;
        const pwd = path.substring(0, path.lastIndexOf('/')) + "/";
        markdown = pathProcess(markdown, pwd);
        markdown = parseImport(markdown, pwd);
        return markdown;
      });
    }
  
    // Add plugin to docsify's plugin array
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
    // https://docsify.js.org/#/zh-cn/write-a-plugin
  })();