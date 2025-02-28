
function parseReference(markdown) {
    const regex = /\[\^([^\[\]]+)\]:(.*)/g;
    const refs = [];
    const matches = [...markdown.matchAll(regex)];

    matches.forEach((match) => {
        const label = match[1];
        const content = match[2].trim();
        refs.push(`- [${label}]: ${content}`);
    });
    if (refs.length > 0) {
        markdown += '\n' + refs.join('\n');
    }
    return markdown;
}

(() => {
    var plugin = function (hook, vm) {
      hook.beforeEach(function(markdown){
        markdown = parseReference(markdown);
        return markdown;
      });
    }
  
    $docsify = $docsify || {};
    $docsify.plugins = [].concat($docsify.plugins || [], plugin);
})();