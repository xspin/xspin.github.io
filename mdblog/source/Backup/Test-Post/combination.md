---
title: 组合数求解
date: 2018-10-09 20:26:45
tags: [algorithm, combination]
---

## 方法一：Pascal公式打表
[**Pascal公式**](http://mathworld.wolfram.com/PascalsFormula.html)如下
$$
{n\choose k} = {n-1 \choose k-1} + {n-1\choose k}
$$

为计算${n\choose k}$，根据上面递推公式，依次计算一个二维数组C[n+1][k+1]即可。另外，根据等式 ${n\choose k}={n\choose n-k}$ 可以压缩数组大小为 C[n+1][min(k,n-k)+1]。进一步，对任意 $n,k$ 上式都成立，于是只要储存C[i][j]（$ｊ\le i/2$）即可。

时空复杂度为 $O(n\times\min(k,n-k))$

<!--more-->

## 方法二：逆元（费马小定理）

[**费马小定理**](https://en.wikipedia.org/wiki/Fermat%27s_little_theorem)
> 若 $p$ 是素数，那么对于任意整数 $a$ 
> $$a^p \equiv a \quad (mod\, p)$$
> 如果 $p\nmid a$，上式等价于
> $$a^{p-1} \equiv 1 \quad (mod\, p)$$

**逆元**
> 对于正整数$a$和$p$，如果 $ax\equiv 1 \,(mod\, p)$，则 $x$ 的最小正整数解为 $a\, mod\, p$ 的逆元。

模运算($\%$)对 $+,-,\times$ 都满足分配律，除了 $\div$。对于 
$$\frac{a}{b}= m  \quad (mod\, p)$$
假设 
$$ ax=m  \quad (mod\, p)$$
同乘$b$得
$$a = mb  \quad (mod\, p),\quad axb = mb \quad (mod\, p)$$
于是
$$a=axb  \quad (mod\, p)$$
则有
$$xb=1\quad (mod\, p)$$
那么$x$是$b$的逆元，于是
$$
a/b = ax \quad (mod\, p)
$$
其中 $x$是$b$的逆元。逆元求解算法
- [拓展欧几里得算法](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm)
- 若$p$是素数，根据费马小定理 $b^{p-1}\%p=1$，可得其逆元为 $b^{p-2}\%p$

为求解取模组合数
$$
{n\choose k}\% p = \frac{n!}{k!(n-k)!} \% p
$$

算法如下：
- x = n! %p
- 分别计算k!和(n-k)!的逆元t1,t2
- x = x*t1 %p 得到 $n!/k!\%p$
- x = x*t2 %p 得到 $n!/k!(n-k)!\%p$

时间复杂度：$O(n)$

最大可计算的$n$为$10^6$左右[1]。

## Lucas定理求解大组合数
[**Lucas定理**](https://en.wikipedia.org/wiki/Lucas%27s_theorem)
> For non-negative integers $m$ and $n$ and a prime $p$, the following congruence relation holds:
> $${m\choose n}\equiv\prod_{i=0}^k{m_i\choose n_i}\quad(mod\, p)$$
> where $m=m_kp^k+\cdots+m_1p+m_0$
> and $n=n_kp^k+\cdots+n_1p+n_0$

对较大的$n$，根据Lucas定理分解${n\choose k}$，然后对每项用前面的方法求解组合数。

对$n$分解为在$p$进制下的表示的复杂度为 $O(\log_p n)$，故算法总复杂度为$O(\log_pn+n_k+\cdots+n_0), k=\log_pn$，因$n_i<p$所以复杂度为$O(p\log_pn)$.

可计算的最大$p$为$10^5$左右[2]。

---
参考资料

1. https://www.zybuluo.com/ArrowLLL/note/713749
2. https://blog.csdn.net/wukonwukon/article/details/7341270