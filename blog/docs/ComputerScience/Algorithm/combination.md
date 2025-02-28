---
title: 组合数求解
date: 2018-10-09 20:26:45
tags: [algorithm, combination]
---

# 组合数求解

## 方法一：Pascal公式打表
[**Pascal公式**](http://mathworld.wolfram.com/PascalsFormula.html)如下
$$
{n\choose k} = {n-1 \choose k-1} + {n-1\choose k}
$$

为计算${n\choose k}$，根据上面递推公式，依次计算一个二维数组$C[n+1][k+1]$即可。
另外，根据等式 ${n\choose k}={n\choose n-k}$ 可以压缩数组大小为 $C[n+1][\min(k,n-k)+1]$。
进一步，对任意 $n,k$ 上式都成立，于是只要储存$C[i][j]$（$ｊ\le i/2$）即可。

时空复杂度为 $O(n\times\min(k,n-k))$

```python
def pascal_triangle(n, k):
    k = min(k, n-k)
    c = [[0]*(k+1) for _ in range(n+1)]
    for i in range(n+1):
        for j in range(min(i, k)+1):
            if j == 0 or j == i:
                c[i][j] = 1
            else:
                c[i][j] = c[i-1][j-1] + c[i-1][j]
    return c[n][k]

for i in range(11):
    print(pascal_triangle(10, i))

print(pascal_triangle(100, 5))
```

## 方法二：逆元法

**逆元**
> 对于正整数$a$和$p$，如果 $ax\equiv 1 \mod p$，则 $x$ 的最小正整数解为 $a\mod p$ 的逆元。

模运算($\%$)对 $+,-,\times$ 都满足分配律，除了 $\div$。对于 
$$
\frac{a}{b} \equiv m  \mod p
$$
假设 
$ ax\equiv m  \mod p$

同乘$b$得
$$
\begin{align}
a \equiv mb  \mod p\\
axb \equiv mb \mod p
\end{align}
$$

于是
$$a \equiv axb \mod p$$
则有
$$xb \equiv 1\mod p$$
那么$x$是$b$的逆元，于是有
$$
a/b \equiv ax \mod p
$$

为求解取模组合数
$$
{n\choose k}\% p = \frac{n!}{k!(n-k)!} \% p
$$

算法如下：
1. $x = n! \%p$
2. 分别计算 $k!$ 和 $(n-k)!$ 的逆元 $t_1,t_2$
3. $x = x*t_1 \%p$ 得到 $n!/k!\%p$
4. $x = x*t_2 \%p$ 得到 $n!/k!(n-k)!\%p$

时间复杂度：$O(n+\log{p})$。
最大可计算的$n$为$10^6$左右[^1]。

### 费马小定理

[**费马小定理**](https://en.wikipedia.org/wiki/Fermat%27s_little_theorem)
> 若 $p$ 是素数，那么对于任意整数 $a$ 
> $$a^p \equiv a \mod p$$
> 如果 $p\nmid a$，上式等价于
> $$a^{p-1} \equiv 1 \mod p$$


若$p$是素数且$p\nmid a$，根据费马小定理有 $a^{p-1}\%p=1$，可得其逆元为 $a^{p-2}\%p$。

```python
def mpow(a, n, p):
    ans = 1

    while n:
        if n & 1:
            ans = (ans * a) % p
        a = (a * a) % p
        n >>= 1
    return ans

def inverse(a, p):
    return mpow(a, p-2, p)

def factorial(n, p):
    ans = 1
    for i in range(2, n+1):
        ans = (ans * i) % p
    return ans

def times(p, *args):
    ans = 1
    for a in args:
        ans = (ans * a) % p
    return ans

def comb(n, k):
    p = 10**9 + 7
    x = factorial(n, p)
    t1 = inverse(factorial(k, p), p)
    t2 = inverse(factorial(n-k, p), p)
    return times(p, x, t1, t2)

print(comb(10, 1))
print(comb(10, 2))
print(comb(10, 5))
print(comb(10**4, 10**3))
print(comb(10**5, 10))
print(comb(10**6, 5))
```

### 拓展欧几里得算法
[拓展欧几里得算法](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm)

## Lucas定理求解大组合数
[**Lucas定理**](https://en.wikipedia.org/wiki/Lucas%27s_theorem)
> For non-negative integers $m$ and $n$ and a prime $p$, the following congruence relation holds:
> $${n\choose m}\equiv\prod_{i=0}^k{n_i\choose m_i}\mod p$$
> where $m=m_kp^k+\cdots+m_1p+m_0$
> and $n=n_kp^k+\cdots+n_1p+n_0$

对较大的$n$，根据Lucas定理分解${n\choose k}$，然后对每项用前面的方法求解组合数。

对 $n$ 分解为 $p$ 进制表示的复杂度为 $O(\log_p n)$，
故算法总复杂度为 $O(\log_pn+n_k+\cdots+n_0), k=\log_pn$，因 $n_i<p$ 所以复杂度为 $O(p\log_pn)$。

可计算的最大$p$为$10^5$左右[^2]。

算法：
1. $x, y = n, m$，循环计算：
   1. $n_i=x\%p$, $m_i=y\%p$
   2. $x=x/p$, $y=y/p$
2. 使用逆元法计算${n_i\choose m_i}$ 并模$p$累乘

```python
def mpow(a, n, p):
    ans = 1
    while n:
        if n & 1:
            ans = (ans * a) % p
        a = (a * a) % p
        n >>= 1
    return ans

def inverse(a, p):
    return mpow(a, p-2, p)

def factorial(n, p):
    ans = 1
    for i in range(2, n+1):
        ans = (ans * i) % p
    return ans

def times(p, *args):
    ans = 1
    for a in args:
        ans = (ans * a) % p
    return ans

def comb(n, k):
    p = 10**9 + 7
    x = factorial(n, p)
    t1 = inverse(factorial(k, p), p)
    t2 = inverse(factorial(n-k, p), p)
    return times(p, x, t1, t2)

def lucas(n, m, p):
    ans = 1
    while n:
        ni, mi = n % p, m % p
        if mi > ni: return 0
        ans = (ans * comb(ni, mi)%p) % p
        n //= p
        m //= p
    return ans

p = 10**5 + 3
print(lucas(10, 1, p))
print(lucas(10, 2, p))
print(lucas(10, 5, p))
print(lucas(10**5, 5, p), comb(10**5, 5)%p)
print(lucas(10**5, 10**3, p), comb(10**5, 10**3)%p)
print(lucas(10**9, 10**4, p))

```

## 参考资料


[^1]:https://www.zybuluo.com/ArrowLLL/note/713749
[^2]: https://blog.csdn.net/wukonwukon/article/details/7341270
