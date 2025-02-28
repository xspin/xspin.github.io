function parseFrontMatter(markdown) {
  const lines = markdown.split('\n');
  if (lines[0]!== '---') {
      // 如果第一行不是 ---，说明没有 Front Matter
      return { data: {}, content: markdown };
  }

  let frontMatterEndIndex = -1;
  for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
          frontMatterEndIndex = i;
          break;
      }
  }

  if (frontMatterEndIndex === -1) {
      // 没有找到结束的 ---，说明没有有效的 Front Matter
      return { data: {}, content: markdown };
  }

  const frontMatterLines = lines.slice(1, frontMatterEndIndex);
  const data = {};
  frontMatterLines.forEach(line => {
      const [key, value] = line.split(':').map(str => str.trim());
      if (key && value) {
          data[key] = value;
      }
  });

  const content = lines.slice(frontMatterEndIndex + 1).join('\n');
  const front = frontMatterLines.join('\n');
  return { front, data, content };
}

(function () {
    var plugin = function (hook, vm) {
      hook.beforeEach(function(markdown){
        const { front, data, content } = parseFrontMatter(markdown);
        if (front) {
          markdown = `<code class="mdfront" style="display:none;">${front}</code>\n${content}`;
        }
        return markdown;
      });

      hook.doneEach(function() {
        const mdfront = document.querySelector('.mdfront');
        if (mdfront) {
          const h1 = document.querySelector('.app-name');
          if (h1) {
            h1.addEventListener('mouseover', function() {
              document.querySelector('.mdfront').style.display = 'block';
            });
            h1.addEventListener('mouseleave', function() {
              document.querySelector('.mdfront').style.display = 'none';
            });
          };
        }
      });
    }
  
    // Add plugin to docsify's plugin array
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
  })();