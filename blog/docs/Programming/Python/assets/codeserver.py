import re
import http.server
import socketserver
import subprocess
import json
import os
import logging
import time
import base64

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s [%(funcName)s:%(lineno)s] - %(message)s')
logger = logging.getLogger(__name__)

class CodeRunner():
    def __init__(self, lang: str, code: str):
        self.lang = self._getLang(lang)
        self.code = code
    
    def _getLang(self, lang):
        lang = lang.lower()
        if lang in ['python', 'py', 'python3']:
            return 'py'
        elif lang in ['c', 'cc']:
            return 'c'
        elif lang in ['cpp', 'cxx', 'c++']:
            return 'cpp'
        elif lang in ['go', 'golang']:
            return 'go'
        elif lang in ['rust']:
            return 'rs'
        elif lang in ['java']:
            return 'java'
        elif lang in ['lua']:
            return 'lua'
        elif lang in ['sh', 'bash', 'shell']:
            return 'sh'
        else:
            return None

    def _runCmd(self, cmd, shell=False):
        try:
            logger.info('Run: ' + str(cmd)[:100])
            result = subprocess.run(cmd, 
                                    capture_output=True, 
                                    text=True, timeout=10, shell=shell, cwd='/tmp')
            if result.returncode == 0:
                return True, result.stdout
            else:
                return False, result.stdout + result.stderr + f'\n[code: {result.returncode}]'

        except subprocess.TimeoutExpired as e:
            logger.warning(str(e))
            return False, f'{e.stdout or ''}{e.stderr or ''} \n[Execution timed out]'

    def _remove(self, path):
        if os.path.exists(path):
            os.remove(path)

    def _tempFile(self, name):
        return f'/tmp/{name}'
    
    def _writeFile(self, path, content):
        with open(path, 'w', encoding='utf8') as f:
            f.write(self.code)

    def _get_compile_params(self, lang, code):
        compile_params = []
        if lang == 'c' or lang == 'cpp':
            if lang == 'c':
                compile_params.append('-std=c11')
            else:
                compile_params.append('-std=c++14')
            libevent_pattern = r'#include\s*<.*event.h>'
            libevent_used = re.search(libevent_pattern, code) is not None
            if libevent_used:
                compile_params.append('-levent')
            
            libev_pattern = r'#include\s*<ev.h>'
            libev_used = re.search(libev_pattern, code) is not None
            if libev_used:
                compile_params.append('-lev')

            libuv_pattern = r'#include\s*<uv.h>'
            libuv_used = re.search(libuv_pattern, code) is not None
            if libuv_used:
                compile_params.append('-luv')
            
            pthread_pattern = r'#include\s*<pthread.h>'
            pthread_used = re.search(pthread_pattern, code) is not None
            if pthread_used:
                compile_params.append('-lpthread')
        return compile_params

    def run(self):
        if not self.lang:
            return False, 'Unsupported language', None

        data = None
        if self.lang == 'sh':
            source_path = self._tempFile('_temp.sh')
            self._writeFile(source_path, self.code)
            ret, output = self._runCmd(['sh', '-n', source_path])
            if not ret:
                return ret, f'Syntax error:\n{output}', None
            ret, output = self._runCmd(['sh', source_path])
        elif self.lang == 'py':
            ret, output = self._runCmd(['python3', '-c', self.code])
            plot_fig_path = self._tempFile('plot.png')
            if os.path.exists(plot_fig_path):
                with open(plot_fig_path, 'rb') as f:
                    data = f.read()
                    plot_fig = base64.b64encode(data).decode()
                    data = {'fig': plot_fig}
                self._remove(plot_fig_path)

        elif self.lang in ['c', 'cpp', 'rs']:
            source_path = self._tempFile(f'_temp.{self.lang}')
            exe_path = self._tempFile('_temp')
            compiler_dict = {
                'c': 'gcc',
                'cpp': 'g++',
                'rs': 'rustc'
            }
            compiler = compiler_dict[self.lang]
            self._writeFile(source_path, self.code)
            compile_params = self._get_compile_params(self.lang, self.code)
            ret, output = self._runCmd([compiler, source_path, '-o', exe_path, *compile_params])
            # self._remove(source_path)
            if not ret:
                return ret, f'Compilation failed:\n{output}', None
            ret, output = self._runCmd([exe_path])
            # self._remove(exe_path)
        elif self.lang == 'go':
            source_path = self._tempFile('temp.go')
            self._writeFile(source_path, self.code)
            ret, output = self._runCmd(['go', 'run', source_path])
            # self._remove(source_path)
        elif self.lang == 'java':
            ret, output = self._runJava(self.code)
        elif self.lang == 'lua':
            source_path = self._tempFile('temp.lua')
            self._writeFile(source_path, self.code)
            ret, output = self._runCmd(['lua', source_path])
        else:
            raise Exception('Unsupported language')
        return ret, output, data

    def _runJava(self, code):
        pattern = r'^public\s+class\s+(\w+)'
        matches = re.findall(pattern, code)
        logger.info(f'Find classes: {matches}')
        if not matches:
            return False, 'No public class found'
        class_name = matches[0]
        source_path = self._tempFile(f'{class_name}.java')
        self._writeFile(source_path, code)
        ret, output = self._runCmd(['javac', source_path])
        if not ret:
            return ret, f'Compilation failed:\n{output}'
        ret, output = self._runCmd(['java', '-cp', '/tmp', class_name])
        self._remove(class_name + '.class')
        return ret, output

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {'message': 'This is a GET request response'}
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode())
            logger.info(f'POST: {post_data[:100]}')
            lang = data.get('lang')
            code = data.get('code')
            code = code and base64.b64decode(code).decode()
            if not lang or not code:
                self.send_response(400)
                self._set_cors_headers()
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'success': False, 'output': 'Missing lang or code parameter'}
                self.wfile.write(json.dumps(response).encode())
                return


            start_time = time.perf_counter()
            ret, output, data = CodeRunner(lang, code).run()
            elapsed = time.perf_counter() - start_time
            response = {'success': ret,
                        'output': output,
                        'data': data,
                        'elapsed': elapsed * 1000}
            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode())

        except Exception as e:
            logger.error(str(e))
            self.send_response(400)
            self._set_cors_headers()
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {'success': False, 'output': str(e)}
            self.wfile.write(json.dumps(response).encode())


if __name__ == "__main__":
    PORT = 65500
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHandler) as httpd:
        logger.info(f"Serving at port {PORT}")
        try:
            httpd.serve_forever()
        except:
            pass
        httpd.server_close()