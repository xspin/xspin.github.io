const path_file_name = 'path.txt'
const home_path = 'source/Home.md'
const about_path = 'source/About.md'
const notfound_path = 'source/404.md'
var mdit;

if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      if(this.indexOf('{}') >= 0) {
        var number = 0;
        return this.replace(/{}/g, function(match) { 
            return typeof args[number] != 'undefined'
            ? args[number++]
            : match
            ;
        });
      }
      return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
}

// File Utils

function copy(a, b) {
    for(var v of b) {
        a.push(v);
    }
}

function path_join(path0, path1) {
    if(path0=='') return path1;
    if(path1[0]=='/') throw "Invalid path: " + path1;
    if(path0[path0.length-1]=='/')
        return path0 + path1;
    return path0 + '/' + path1;
}
function path_basename(path) {
    var i = path.lastIndexOf('/');
    if(i < 0) return path;
    else return path.substring(i+1, path.length);
}
function path_basename_wo_suffix(path) {
    var basename = path_basename(path);
    var i = basename.lastIndexOf('.');
    if(i <= 0) return basename;
    else return basename.substring(0, i);
}

function path_dir(path) {
    var i = path.lastIndexOf('/');
    if(i < 0) return '.';
    else return path.substring(0,i);
}

function path_suffix(path) {
    var name = path_basename(path);
    var i = path.lastIndexOf('.');
    if(i < 0) return null;
    else return path.substring(i, path.length);
}

function get_file_list(url) {
    var file_list = [];
    function process(response, status, xhr) {
        var tmp = response.split('\n');
        for(var t of tmp) {
            var tt = t.trim();
            if(tt.length > 0) {
                var i = tt.lastIndexOf('/')
                if(i>=0) tt = tt.substring(0, i);
                file_list.push(tt);
            }
        }
    }
    $.ajax({
        async: false,
        url: url,
        dataType: 'text',
        success: process
    });
    return file_list;
}

function list_paths(dir) {
    var url = path_join(dir, path_file_name);
    try{
        var file_list = get_file_list(url);
        if(file_list.length==0) return null;
    } catch(error) {
        console.log('Error: '+error);
        return null;
    } 
    // file_list = ['folder1', 'folder2', 'file1.md', 'file2.txt', path_file_name]
    var dir_list = []
    var md_list = []

    for(var f of file_list) {
        var name = path_basename(f);
        if(name == path_file_name) continue;
        var suffix = path_suffix(name);
        var file_path = path_join(dir, name);
        if(suffix == null) {
            dir_list.push(file_path);
        } else if(suffix == '.md') {
            md_list.push(file_path);
        }
    }
    return {'dir': dir_list, 'md': md_list};
}

function get_paths_tree(dir, max_depth=10) {
    if(max_depth <= 0) return null;
    var path_tree = {};
    var tmp = list_paths(dir);
    if(tmp == null) return null;
    path_tree['file'] = tmp['md'];
    for(var p of tmp['dir']) {
        var sub_tree = get_paths_tree(p, max_depth-1);
        if(sub_tree) {
            var name = path_basename(p);
            path_tree[name] = sub_tree;
        }
    }
    return path_tree;
}

function paths_tree_to_html(path_tree) {
    if(path_tree == null) return null;
    var html = '<ul>';
    for(var f of path_tree['file']) {
        html += '<li><a class="file" href="#md={0}" onclick="jump()">{1}</a></li>'.format(f, path_basename_wo_suffix(f));
    }
    for(var dir in path_tree) {
        if(dir == 'file') continue;
        var tmp = paths_tree_to_html(path_tree[dir]);
        if(tmp) {
            html += '<li><a class="folder" onclick="show_or_hide(this)">{}</a>{}</li>'.format(path_basename(dir), tmp);
        }
    }
    html += '</ul>';
    return html;
}

function process_git_url(path) {
    var url = document.URL;
    if (!url.match('github.io')) return path;
    var temp = 'https://raw.githubusercontent.com/{}/{}.github.io/master'
    var i = url.indexOf('//');
    var j = url.indexOf('.git');
    var gitname = match.substring(i+2, j);
    url = path_join(temp.format(gitname, gitname), path);
    console.log(url);
    return url;
}

function load_md(path) {
    var data = null;
    $.ajax({
        async: false,
        url: process_git_url(path),
        dataType: 'text',
        success: function (response, status, xhr) {
            data = response;
        },
        error: function (xhr, status, error) {
            data = null;
        }
    });
    return data;
}

// Event Utils
function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement; 
}

// Sidebar Control 

function show_sidebar() {
    var path_tree = get_paths_tree('source');
    var path_tree_html = paths_tree_to_html(path_tree);
    $('#menu')[0].innerHTML = path_tree_html;
}

function show_or_hide(elem) {
    parent = $(elem).parent();
    parent.children().find('li').toggle();
    // $(elem).show();
}


// Markdown Paragraph

function yaml_parser(data) {
    var dict = {};
    for(line of data.split('\n')) {
        var i = line.indexOf(':');
        var tmp;
        if(i < 0) {
            tmp = [line, ''];
        } else {
            tmp = [line.substring(0,i), line.substring(i+1)];
        }
        dict[tmp[0].trim()] = tmp[1].trim();
    }
    return dict;
}

function parser_yaml_fronter(data) {
    var dict = {};
    if(data.substring(0, 4) == '---\n') {
        var i = 4;
        var j = data.substring(i).indexOf('---\n');
        dict = yaml_parser(data.substring(i, i+j));
        data = data.substring(i+j+4);
    }
    return [dict, data];
}

function gen_header(dict) {
    var header_html = '';
    if(dict['date']) {
        header_html += '<span class="post-meta post-date">Date: {}</span>'.format(dict['date']);
    }
    if(dict['tags']) {
        header_html += '<span class="post-meta post-tags">Tags: {}</span>'.format(dict['tags']);
    }
    if(dict['title']) {
        header_html += '<p class="post-title">{}</p>'.format(dict['title']);
    }
    return header_html;
}

function url_process(html, path) {
    var dir = path_dir(path);
    function is_relative(src) {
        return src[0]!='/' && src.substring(0,4)!='http';
    }
    html = html.replace(/src=("|').*?("|')/g, function(match, n) {
        var src = match.substring(5, match.length-1);
        if(is_relative(src)) {
            return 'src="{}"'.format(path_join(dir, src));
        }
        return match;
    });
    return html;
}

async function render(path) {
    var md = load_md(path);
    if(md == null) {
        md = load_md(notfound_path);
    }
    await new Promise(r => setTimeout(r, 100));
    // $("#post")[0].innerHTML = md;
    try {
        var tmp = parser_yaml_fronter(md);
        var dict = tmp[0];
        md = tmp[1];
        var html = gen_header(dict) + mdit.render(md)
        html = url_process(html, path);
        $("#post")[0].innerHTML = html;
    } catch (error) {
        console.log(error);
        $("#post")[0].innerHTML = md;
    }
    await new Promise(r => setTimeout(r, 100));
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}


async function jump(){
    await new Promise(r => setTimeout(r, 100));
    var url = document.URL;
    var idx = url.indexOf('md=');
    var path = home_path;
    if(idx > 0) {
        path = url.substring(idx+3);
    }
    render(path);
}


function init() {
    mdit = markdownit({
        html: true,
        linkify: true,
        typographer: true,
        // langPrefix:   'hljs language-',
        highlight: function (str, lang) {
            var codes = str;
            if (lang && hljs.getLanguage(lang)) {
                try {
                    codes = hljs.highlight(lang, str, true).value;
                } catch (__) {}
            } else if (lang=='auto') {
                try {
                    codes = hljs.highlightAuto(str).value;
                } catch (__) {}
            } else if (lang.toLowerCase() == 'uml') {
                codes = '<img src={}> <div style="float:right;">{}</div>'.format(umlcompress(codes), codes);
            } 
            return '<pre class="hljs lang-{}"><code>{}</code></pre>'.format(lang, codes);
        }
    });
    hljs.initHighlightingOnLoad();
    show_sidebar();
    jump();
}