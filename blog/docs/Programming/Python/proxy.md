# TCP/UDP 代理

支持 TCP-TCP、TCP-UDP、UDP-TCP、UDP-UDP 四种代理模式

[下载 iproxy.py](assets/iproxy.py)

```bash
$ python iproxy.py -h #查看帮助信息

usage: iproxy.py [-h] -l LOCAL -r REMOTE -m {uu,ut,tu,tt} [-s DST] [-t TIMEOUT] [-c CONNECTIONS]
                 [-d] [-q]

TCP/UDP Proxy Server

options:
  -h, --help            show this help message and exit
  -l LOCAL, --local LOCAL
                        local address <[LOCAL_HOST:]LOCAL_PORT>
  -r REMOTE, --remote REMOTE
                        remote address <[REMOTE_HOST:]REMOTE_PORT>
  -m {uu,ut,tu,tt}, --mode {uu,ut,tu,tt}
                        proxy mode (u - UDP, t - TCP): uu, ut, tu, tt
  -s DST, --dst DST     destination address to transfer (supported only on uu or ut mode)
  -t TIMEOUT, --timeout TIMEOUT
                        timeout in seconds (default infinity)
  -c CONNECTIONS, --connections CONNECTIONS
                        max number of connections (default 10)
  -d, --debug           debug mode
  -q, --quiet           quiet mode
```