from collections import deque
import socket
import argparse
import logging
import sys
import time
import threading
import signal

class MillisecondFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        ct = self.converter(record.created)
        if datefmt:
            s = time.strftime(datefmt, ct)
        else:
            t = time.strftime("%Y-%m-%d %H:%M:%S", ct)
            s = "%s.%03d" % (t, record.msecs)
        return s

logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = MillisecondFormatter('[%(asctime)s] %(levelname)s [%(funcName)s:%(lineno)s] - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

def addrfmt(addr):
    return '{}:{}'.format(*addr)

class Proxy:
    MODE = {
        'TCP_TO_TCP': (True, True),
        'TCP_TO_UDP': (True, False),
        'UDP_TO_TCP': (False, True),
        'UDP_TO_UDP': (False, False),
    }

    def __init__(self, local_addr, remote_addr, mode, dst=(), timeout=0, connections=10):
        self.thread = {}
        self.chunksize = 2048
        self.local_addr = local_addr
        self.remote_addr = remote_addr
        assert mode in Proxy.MODE, f'invalid proxy mode: {mode}'
        self.ltcp, self.rtcp = Proxy.MODE[mode]
        self.timeout = timeout
        self.connections = connections
        self.dst = dst

        logger.info(f'Proxy on {addrfmt(local_addr)} to {addrfmt(remote_addr)}'
            f' with {mode} timeout {timeout or "INF"}')
        if self.dst:
            logger.info(f'Destination: {addrfmt(dst)}')

    def get_udp_receiver(self, skt, ctx):
        def receiver():
            logger.debug(f'[{ctx["name"]}] udp recv')
            if 'res' in ctx:
                ctx['res']['semaphore'].acquire()
                data = ctx['res']['data'].popleft()
                addr = ctx['peer_address']
            else:
                data, addr = skt.recvfrom(self.chunksize)
            logger.debug(f'[{ctx["name"]}] udp recv from {addrfmt(addr)}: {data}')
            return data
        return receiver

    def get_udp_sender(self, skt, ctx):
        def sender(data):
            if not data:
                skt.close()
                return
            addr = ctx.get('dst', '')
            if not addr:
                addr = ctx['peer_address']
            logger.debug(f'[{ctx["name"]}] udp send to {addrfmt(addr)}: {data}')
            ctx['ready'] = True
            return skt.sendto(data, addr)
        return sender

    def get_tcp_receiver(self, skt, ctx):
        def receiver():
            logger.debug(f'[{ctx["name"]}] tcp recv')
            data = skt.recv(self.chunksize)
            addr = skt.getpeername()
            logger.debug(f'[{ctx["name"]}] tcp recv from {addrfmt(addr)}: {data}')
            return data
        return receiver

    def get_tcp_sender(self, skt, ctx):
        def sender(data):
            if not data:
                skt.close()
                return
            addr = skt.getpeername()
            logger.debug(f'[{ctx["name"]}] tcp send to {addrfmt(addr)}: {data}')
            ctx['ready'] = True
            return skt.sendall(data)
        return sender

    def proxy(self, forward_c2r, forward_r2c, addr, callback):
        ctx = {
            'run': True,
            'ready': False
        }

        def forward(tag, fwd, ctx):
            receive, send = fwd
            outsize = 100
            while ctx['run']:
                try:
                    data = receive()
                    if not data:
                        ctx['run'] = False
                        send(b'')
                        break
                    send(data)
                    ctx['ready'] = True
                    logger.info(f'[{tag}] proxy data ({len(data)})\nRAW: {data[:outsize]}\nHEX: {data.hex()[:outsize]}')
                except Exception as e:
                    logger.warning(f'[{tag}] Exception: {e}')
                    ctx['run'] = False
                    send(b'')
                    break
            logger.info(f'[{tag}] forward closed')
        
        thread_c2r = threading.Thread(target=forward, args=(f'{addrfmt(addr)} CLIENT_TO_REMOTE', forward_c2r, ctx))
        thread_c2r.start()
        thread_r2c = threading.Thread(target=forward, args=(f'{addrfmt(addr)} REMOTE_TO_CLIENT', forward_r2c, ctx))
        while not ctx['ready']:
            logger.debug(f'REMOTE_TO_CLIENT waiting for data')
            time.sleep(1)
        thread_r2c.start()

        thread_c2r.join()
        thread_r2c.join()
        logger.info(f"[{addrfmt(addr)}] Proxy Closed.")

        callback()

    def handle_client_thread(self, addr, local_reciever, local_sender, remote_ctx, cb=None):
        try:
            if self.rtcp:
                remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                remote_socket.connect(self.remote_addr)
                logger.info(f"Proxy TCP to {addrfmt(self.remote_addr)}")
                remote_sender = self.get_tcp_sender(remote_socket, remote_ctx)
                remote_reciever = self.get_tcp_receiver(remote_socket, remote_ctx)
            else:
                logger.info(f"Proxy UDP to {addrfmt(self.remote_addr)}")
                remote_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                remote_sender = self.get_udp_sender(remote_socket, remote_ctx)
                remote_reciever = self.get_udp_receiver(remote_socket, remote_ctx)

            if self.timeout:
                remote_socket.settimeout(self.timeout)
            forward1 = (local_reciever, remote_sender)
            forward2 = (remote_reciever, local_sender)
        except Exception as e:
            logger.warning(f'[{addrfmt(addr)}] exception: {e}')
            if cb: cb()
            return

        def callback():
            try:
                remote_socket.close()
                if cb: cb()
            finally:
                del self.thread[addr]
                logger.info(f'[{addrfmt(addr)}] Socket closed, threads: {len(self.thread)}')

        th = threading.Thread(target=self.proxy, args=(forward1, forward2, addr, callback))
        self.thread[addr] = th
        logger.info(f'[{addrfmt(addr)}] new proxy, threads: {len(self.thread)}')
        th.start()

    def new_ctx(self):
        local_ctx = {
            'name': 'CLIENT',
            'pkts': 0,
        }
        remote_ctx = {
            'name': 'REMOTE',
            'pkts': 0,
            'peer_address': self.remote_addr
        }
        local_ctx['peer'] = remote_ctx
        remote_ctx['peer'] = local_ctx
        return local_ctx, remote_ctx
        
    def handle_tcp(self):
        local_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        local_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        local_socket.bind(self.local_addr)
        logger.info(f"Listen TCP on {addrfmt(self.local_addr)}")
        local_socket.listen(self.connections)

        while True:
            try:
                conn, addr = local_socket.accept()
                logger.info(f'Accepted TCP connection from {addrfmt(addr)} to {addrfmt(conn.getsockname())}')
            except BaseException as e:
                logger.warning(f'{e.__class__.__name__}: {e}')
                local_socket.close()
                break

            if self.timeout:
                conn.settimeout(self.timeout)

            local_ctx, remote_ctx = self.new_ctx()
            local_ctx['peer_address'] = addr
            local_reciever = self.get_tcp_receiver(conn, local_ctx)
            local_sender = self.get_tcp_sender(conn, local_ctx)
            def cb():
                conn.close()
            self.handle_client_thread(addr, local_reciever, local_sender, remote_ctx, cb)
    
    def handle_udp(self):
        local_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        local_socket.bind(self.local_addr)
        # local_socket.settimeout(self.timeout)
        logger.info(f"Listen UDP on {addrfmt(self.local_addr)}")

        udp_client_dict = {
            # addr: {data:[], semaphore:}
        }
        while True:
            try:
                data, addr = local_socket.recvfrom(self.chunksize)
                logger.debug(f'recv udp from {addr}: {data}')
            except BaseException as e:
                logger.warning(f'{e.__class__.__name__}: {e}')
                for _, v in udp_client_dict.items():
                    v['data'].append('')
                    v['semaphore'].release()
                local_socket.close()
                break

            new_connection = False
            if addr not in udp_client_dict:
                if len(udp_client_dict) >= self.connections:
                    logger.warning(f'{addrfmt(addr)} refused, exceeds max connections {self.connections}')
                    continue
                new_connection = True
                udp_client_dict[addr] = {'data': deque(), 'semaphore': threading.Semaphore(0)}

            udp_client_dict[addr]['data'].append(data)
            udp_client_dict[addr]['semaphore'].release()

            if new_connection:
                logger.info(f'Accepted UDP connection from {addrfmt(addr)} to {addrfmt(local_socket.getsockname())}')
                local_ctx, remote_ctx = self.new_ctx()
                local_ctx['res'] = udp_client_dict[addr]
                local_ctx['peer_address'] = addr
                local_ctx['dst'] = self.dst
                local_reciever = self.get_udp_receiver(local_socket, local_ctx)
                local_sender = self.get_udp_sender(local_socket, local_ctx)
                def cb():
                    if addr in udp_client_dict:
                        del udp_client_dict[addr]
                    logger.info(f'[{addrfmt(addr)}] connection closed, connections: {len(udp_client_dict)}')
                self.handle_client_thread(addr, local_reciever, local_sender, remote_ctx, cb)

    def run(self):
        if self.ltcp:
            self.handle_tcp()
        else:
            self.handle_udp()

        for addr, t in self.thread.copy().items():
            t.join()
            logger.info(f'[{addrfmt(addr)}] thread stoped')

def parse_args():
    parser = argparse.ArgumentParser(
        description="TCP/UDP Proxy Server"
    )
    parser.add_argument('-l', '--local',
        type=str,
        required=True,
        help='local address <[LOCAL_HOST:]LOCAL_PORT>')
    parser.add_argument('-r', '--remote',
        type=str,
        required=True,
        help='remote address <[REMOTE_HOST:]REMOTE_PORT>')
    parser.add_argument('-m', '--mode',
        type=str,
        required=True,
        choices=['uu', 'ut', 'tu', 'tt'],
        help='proxy mode (u - UDP, t - TCP): uu, ut, tu, tt')
    parser.add_argument('-s', '--dst',
        type=str,
        required=False,
        help='destination address to transfer (supported only on uu or ut mode)')
    parser.add_argument('-t', '--timeout',
        type=int,
        default=0,
        help='timeout in seconds (default infinity)')
    parser.add_argument('-c', '--connections',
        type=int,
        default=10,
        help='max number of connections (default 10)')
    parser.add_argument('-d', '--debug',
        default = False,
        action = 'store_true',
        help='debug mode')
    parser.add_argument('-q', '--quiet',
        default = False,
        action = 'store_true',
        help='quiet mode')

    return parser.parse_args()

def get_ip_port(s):
    if ':' in s:
        ip, port = s.split(':', 1)
    else:
        port = s
        ip = '127.0.0.1'
    port = int(port)
    return ip, port

if __name__ == '__main__':
    args = parse_args()

    if args.debug:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    if args.quiet:
        logger.setLevel(logging.ERROR)

    local_ip, local_port = get_ip_port(args.local)
    remote_ip, remote_port = get_ip_port(args.remote)
    args.mode = args.mode.lower()

    if args.dst:
        dst = get_ip_port(args.dst)
        assert args.mode in ['uu', 'ut']
    else:
        dst = None

    mode_dict = {
        'uu':  'UDP_TO_UDP',
        'ut':  'UDP_TO_TCP',
        'tu':  'TCP_TO_UDP',
        'tt':  'TCP_TO_TCP',
    }

    p = Proxy((local_ip, local_port), (remote_ip, remote_port),
        mode_dict[args.mode],
        dst=dst,
        timeout=args.timeout,
        connections=args.connections)

    p.run()
