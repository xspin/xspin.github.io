# KMP

## 前缀函数

### 定义
给定一个长度为 $n$ 的字符串 $s$，其前缀函数 $p(i)$ 定义为：
$$
p(i) = 
\begin{cases} 
\max_{k\in 1\dots i} \{ k \} & \text{if } \exists k: s[0 \dots k-1] = s[i-k+1 \dots i] \\
0 & \text{else}
\end{cases}
$$

如果子串 $s[0\dots i]$ 有一对最长的相等的真前缀与真后缀：
$s[0\dots k-1]$ 和 $s[i - (k - 1) \dots i]$，
那么前缀函数在 $i$ 处的值就是这个相等的前后缀的长度，也就是 $p(i)=k$；
如果没有相等的前后缀，则 $p(i)=0$。

注：真前/后缀指非自身且非空前/后缀。

示例：对于字符串`abcabcd`，其前缀函数为
- $p[0]=0$，`a` 无相等真前后缀
- $p[1]=0$，`ab` 无相等真前后缀
- $p[2]=0$，`abc` 无相等真前后缀
- $p[3]=1$，`abca` 有相等真前后缀 `a`
- $p[4]=2$，`abcab` 有相等真前后缀 `ab`
- $p[5]=3$，`abcabc` 有相等真前后缀 `abc`
- $p[6]=0$，`abcabcd` 无相等真前后缀

对于字符串`aaaaa`，前缀函数值为：$[0, 1, 2, 3, 4]$。


### 算法

#### 朴素算法
计算 $p(i)$ 时，依次遍历 $s[0\dots i]$ 的所有真前后缀，得到最长的相等前后缀长度。

```python
def prefix(s):
    n = len(s)
    p = [0] * n
    for i in range(n):
        for k in range(i, 0, -1):
            # s[0...k-1] = s[i-(k-1)...i]
            if s[0 : k] == s[i-k+1 : i+1]:
                p[i] = k
                break
    return p

print(prefix('abcabcd'))
print(prefix('aaaaa'))
```

此算法时间复杂度为 $O(n^3)$ ，显然此算法有很大优化空间。

#### 优化后算法一

可以观察到，如果有 $s[i]=s[p(j)]$，则 $p(i) = p(j) + 1$，即有

$$
p(i) = \max_{j\in 0\dots i-1} \{p(j)+1: s[i]=s[p(j)+1]\}
$$

于是算法可以优化为

```python
def prefix(s):
    n = len(s)
    p = [0] * n
    for i in range(1, n):
        for j in range(0, i):
            if s[p[j]] == s[i]:
                p[i] = max(p[i], p[j] + 1)
    return p

print(prefix('abcabcd'))
print(prefix('aaaaabb'))
print(prefix('abcdxxxabcda'))
```

此算法时间复杂度为 $O(n^2)$

#### 优化后算法二

注意到
1. $p(i)\le p(i-1)+1$
    - 证：设 $p(i)=x\gt 0$ 则 $p(i-1)\ge x-1 \Rightarrow p(i-1)+1\ge x = p(i)$
2. $s[i]=s[p(i)-1]$
    - 证：设 $p(i)=k$ 则有 $s[0\dots k-1] = s[i-k+1\dots i]$ 即 $s[k-1]=s[i]$


对于 $p(i)$，最好的情况为 $p(i) = p(i-1)+1$ 即有 $s[i]=s[p(i-1)]$；
否则，$p(i)\le p(i-1)$ ：
  - 若 $p(i) = p(i-1)$ 则有 $s[i] = s[i-1] = s[p(i-1)-1]$
    - 证：若 $p(i)=p(i-1)$ 则 $s[0\dots k]=s[?\dots i-1]=s[?\dots i]$故 $s[i]=s[i-1]$
  - 若 $p(i) = p(j)+1 < p(i-1)$ 则 $s[i]=s[j+1]$ # TODO

```python
def prefix(s):
    n = len(s)
    p = [0] * n
    for i in range(1, n):
        j = p[i-1]
        while j > 0 and s[i] != s[j]:
            j = p[j-1]
        if s[i] == s[j]:
            p[i] = j + 1
    return p

print(prefix('abcabcd'))
print(prefix('aaaaabb'))
print(prefix('abcdxxxabcda'))
print(prefix('abababababaa'))
print(prefix('aa...aaa'))
print(prefix('cbc...cbcb...cbcb'))
```
时间复杂度为 $O(n)$ 。

## Next数组

### 定义
假设存在主串 $s$ 和模式串 $t$，
$next[i]=k<i$ 表示当匹配失败时（$t[i]\ne s[j]$），需要把模式串前移从 $t[k]$ 开始匹配，
其中 $t[\dots k-1]=t[\dots i-1]=s[\dots j-1]$。 


$$
next[i] =
\begin{cases}
-1 & i=0 \\
\max_{k\in 1\dots i-1}\{ k \} & 
\text{if }\exists k: s[0\dots k-1]=s[i-k\dots i-1]\\
0 & \text{else}  
\end{cases}
$$

对比前缀函数，可以得到
$$
next[i] =
\begin{cases}
-1 & i=0 \\
p(i-1) & i>1
\end{cases}
$$

实际上，令 $next[0]=0$ 也是可以的，只需要把$s$的前移条件改一下。

## 字符串匹配

```python
def prefix(s):
    n = len(s)
    p = [0] * n
    for i in range(1, n):
        j = p[i-1]
        while j > 0 and s[i] != s[j]: j = p[j-1]
        if s[i] == s[j]: p[i] = j + 1
    return p

def get_next(s):
    p = prefix(s)
    n = [-1]
    n.extend(p[1:])
    return n

def find(pattern, text):
    s = pattern + '#' + text # 必需要拼接一个text中不可能存在的字符
    p = prefix(s)
    n = len(pattern)
    for i in range(n+1, len(s)):
        if p[i] == n:
            yield i-2*n #i-(n-1)-(n+1)

def find_kmp(pattern, text):
    nt = get_next(pattern)
    i, j = 0, 0
    n = len(pattern)
    while j < len(text):
        if text[j] == pattern[i]:
            i += 1
            j += 1
            if i == n:
                i = 0
                yield j-n
        else:
            i = nt[i]
            if i < 0:
                i, j = 0, j+1

pattern = 'abc'
text = 'abcxabcxxxabcabc'
print(list(find(pattern, text)))
print(list(find_kmp(pattern, text)))

pattern = 'aaa'
text = 'aaaaaaaaa'
print(list(find(pattern, text)))
print(list(find_kmp(pattern, text)))
```

## 参考资料
- https://oi-wiki.org/string/kmp/
- https://zhuanlan.zhihu.com/p/348914214
- https://blog.csdn.net/gmynebula/article/details/125239503
- https://blog.csdn.net/weixin_43996337/article/details/120834934