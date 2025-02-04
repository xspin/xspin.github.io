# Python 实现简易 DNS 服务器



## 安装依赖



```bash
# pip install dnspython
```



## 代码实现

```python
import sys
import os
import socket
import socketserver
import logging
import threading
import dns.message
import dns.rdatatype
import dns.rdataclass
import dns.rcode
import dns.resolver

# pip install dnspython

logger = logging.getLogger()
handler = logging.StreamHandler()
formatter = logging.Formatter('[%(asctime)s][%(levelname)s] %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


dns_table = {
    'www.test.com': {
        'A': ['12.0.0.1', '12.0.0.2'],
        'AAAA': ['2022::1'],
    },
    'www.test6.com': {
        'AAAA': ['2001:db8::2'],
    },
    'test.com': {
        'A': [],
        'AAAA': [],
        'CNAME': 'www.test.com',
    },
    'ftp.example.com': {
        'A': ['192.168.1.3'],
        'AAAA': [],
        'CNAME': [],
    },
    'p.store.qq.com': {
        'CNAME': 'test.qq.com'
    },
    'www.a.com': {
        'A': ['12.0.0.31', '12.0.0.32'],
        'AAAA': ['2022::fe', '2022::ff'],
    },
    'dd.com': {
        'A': ['1.0.0.1', '1.0.0.2'],
        'AAAA': ['2022::1', '2022::2'],
    },
    'ff.com': {
        'A': ['1.0.1.1', '1.0.1.2'],
        'AAAA': ['2023::1', '2023::2'],
    },
    'ee.com': {
        'CNAME': 'ff.com'
    },
    't0.cc': {
        'A': ['10.0.1.1', '10.0.1.2'],
        'AAAA': ['2024::1', '2024::2'],
    },
    't1.cc': {
        'CNAME': 't0.cc'
    },
    't2.cc': {
        'CNAME': 't1.cc'
    },
    't3.cc': {
        'CNAME': 't2.cc'
    },
    't4.cc': {
        'CNAME': 't3.cc'
    },
    't5.cc': {
        'CNAME': 't4.cc'
    },
    't6.cc': {
        'CNAME': 't5.cc'
    },
    't7.cc': {
        'CNAME': 't6.cc'
    },
    't8.cc': {
        'CNAME': 't7.cc'
    },

    # 记录不存在时的默认记录
    '*': {
        'A': ['10.255.0.1', '10.255.0.2'],
        'AAAA': ['2023:ff::1', '2023:ff::2'],
    }
}

def dnsRecordsDisplay():
    s = ''
    for domain, record in dns_table.items():
        for qt, addrs in record.items():
            if isinstance(addrs, str):
                addrs = [addrs]
            for addr in addrs:
                s += f'  {domain:24s} {qt:5s}    {addr:16s}\n'
    logger.info(f'DNS Records:\n{s}')


class DNSHandler(socketserver.BaseRequestHandler):
    lock = threading.Lock()
    reqCnt = 0

    def __init__(self, request, client_address, server):
        super().__init__(request, client_address, server)

    def handle(self):
        with DNSHandler.lock:
            try:
                logger.info(f"Received DNS request from {self.client_address}")
                data = self.request[0]
                sock = self.request[1]
                request = dns.message.from_wire(data)
                response = self.process_request(request)
                sock.sendto(response.to_wire(), self.client_address)
                logger.info('Responded.\n')
            except Exception as e:
                logger.error(f'Exception: {e}')
                raise e

        DNSHandler.reqCnt += 1
        if DNSHandler.reqCnt % 5 == 0:
            dnsRecordsDisplay()

    def process_request(self, request):
        response = dns.message.make_response(request)
        for question in request.question:
            qname = str(question.name)
            qtype = question.rdtype
            qclass = question.rdclass
            qtype_str = dns.rdatatype.to_text(qtype)
            qclass_str = dns.rdataclass.to_text(qclass)
            t_qname = qname[:-1]
            
            logger.info(f"Query Name: {qname}")
            logger.info(f"Query Type: {qtype_str}")
            logger.info(f"Query Class: {qclass_str}")

            records = self.dnsLookup(t_qname, qtype_str) or self.dnsResolve(t_qname, qtype_str)
            if records:
                for qn, qt, answer in records:
                    qtp = dns.rdatatype.from_text(qt)
                    response.answer.append(dns.rrset.from_text(qn, 300, dns.rdataclass.IN, qtp, answer))
                    logger.info(f"Answer: {qn} {qt} {answer}")
            else:
                response.set_rcode(dns.rcode.NXDOMAIN)
                logger.warning(f"Domain not found!")
                logger.info(f"Answer: NXDOMAIN")

        return response

    def dnsLookup(self, host, qtype):
        answers = []

        if qtype != 'CNAME':
            cname = host
            while cname and cname in dns_table:
                cname = dns_table[cname].get('CNAME', None)
                if cname:
                    answers.append((host + '.', 'CNAME', cname + '.'))
                    host = cname

        records = dns_table.get(host, {}).get(qtype, [])
        if host not in dns_table:
            records = dns_table.get('*', {}).get(qtype, [])
            if records:
                logger.warning(f'No such domain: {host}, using default {qtype} records')

        if isinstance(records, str):
            records = [records]

        for record in records:
            if qtype == 'CNAME':
                record = record + '.'
            answers.append((host + '.', qtype, record))
        return answers

    def dnsResolve(self, host, qtype):
        answers = []
        try:
            logger.info(f"Resolve: {host} {qtype}")
            for answer in dns.resolver.resolve(host, qtype):
                ans = answer.to_text()
                answers.append((host + '.', qtype, ans))
        except Exception as e:
            logger.warning(f'{e}')
            # if qtype == 'A':
            #     answers.append((host + '.', qtype, "127.0.0.2"))
            # elif qtype == 'AAAA':
            #     answers.append((host + '.', qtype, "::2"))
        return answers


def usage():
    name = os.path.basename(sys.argv[0])
    logger.info(f'Usage: {name} [IP:[PORT]]')

if __name__ == '__main__':
    host, port = '0.0.0.0', 53
    if len(sys.argv) == 1:
        pass
    elif len(sys.argv) >= 2:
        host = sys.argv[1]
        if len(sys.argv) >= 3:
            port = int(sys.argv[2])
    else:
        usage()
        exit(-1)

    dnsRecordsDisplay()

    if ':' in host:
        socketserver.UDPServer.address_family = socket.AF_INET6

    logger.info(f"DNS server started on {host} {port}")
    with socketserver.ThreadingUDPServer((host, port), DNSHandler) as server:
        server.daemon_threads = True 
        server.serve_forever()


```

