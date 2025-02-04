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

(function () {
    var plugin = function (hook, vm) {
      hook.beforeEach(function(markdown){
        const path = vm.route.file;
        const pwd = path.substring(0, path.lastIndexOf('/')) + "/";
        return pathProcess(markdown, pwd);
      });
    }
  
    // Add plugin to docsify's plugin array
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
  })();