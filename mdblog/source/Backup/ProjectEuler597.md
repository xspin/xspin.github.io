---
title: Project Euler Problem 597
date: 2018-10-14 19:17:49
tags: [Project Euler, Probability, Torpids]
---


## [Tropids](https://projecteuler.net/problem=597)
The Torpids are rowing races held annually in Oxford, following some curious rules:
- A division consists of n boats (typically 13), placed in order based on past performance.
- All boats within a division start at 40 metre intervals along the river, in order with the highest-placed boat starting furthest upstream.
- The boats all start rowing simultaneously, upstream, trying to catch the boat in front while avoiding being caught by boats behind.
- Each boat continues rowing until either it reaches the finish line or it catches up with ("bumps") a boat in front.
- The finish line is a distance L metres (the course length, in reality about 1800 metres) upstream from the starting position of the lowest-placed boat. (Because of the staggered starting positions, higher-placed boats row a slightly shorter course than lower-placed boats.)
- When a "bump" occurs, the "bumping" boat takes no further part in the race. The "bumped" boat must continue, however, and may even be "bumped" again by boats that started two or more places behind it.
- After the race, boats are assigned new places within the division, based on the bumps that occurred. Specifically, for any boat A that started in a lower place than B, then A will be placed higher than B in the new order if and only if one of the following occurred:
    1. A bumped B directly
    2. A bumped another boat that went on to bump B
    3. A bumped another boat, that bumped yet another boat, that bumped B
    4. etc

<!--more-->

**NOTE**: For the purposes of this problem you may disregard the boats' lengths, and assume that a bump occurs precisely when the two boats draw level. (In reality, a bump is awarded as soon as physical contact is made, which usually occurs when there is much less than a full boat length's overlap.)

Suppose that, in a particular race, each boat Bj rows at a steady speed vj=−logXj metres per second, where the Xj are chosen randomly (with uniform distribution) between 0 and 1, independently from one another. These speeds are relative to the riverbank: you may disregard the flow of the river.

Let p(n,L) be the probability that the new order is an even permutation of the starting order, when there are n boats in the division and L is the course length.

You are also given that p(4,400)=0.5107843137, rounded to 10 digits after the decimal point.

Find p(13,1800) rounded to 10 digits after the decimal point.

----

## Preliminary

Notations
- Uniform random variable $X_i\sim U(0,1)$
- Speed of boat $B_i$, $v_i = -\log X_i$
- Number of boats $N$
- Interval $d=40$ (m)
- Course length $L$

The initial order of boats is assumed as $B_0, B_1, \cdots, B_n$, with $B_0$ at the original point and $B_i$ at $id$. And the finish line is at $D=L+d(n-1)$. We denote $d_i = D-id = L+(n-1-i)d$ as the distance of $B_i$ to the finish line.

**Theorem 1**
> For any $i<j$, $B_i$ bumps $B_j$ iff 
> $$X_i^{d_j} < X_j^{d_i}$$
> or
> $$X_i < X_j^{d_i/d_j},\quad X_i^{d_j/d_i} < X_j$$

*Proof.* If $B_i$ bumps $B_j$ $\frac{d_i}{v_i} < \frac{d_j}{v_j}$ So $\frac{d_i}{-\log X_i} < \frac{d_j}{-\log X_j}$ and $d_j\log X_i < d_i\log X_j$ Obviously, the result holds. $\square$

**Definition 1.** $A_{ij}$ is the event of "$B_i$ bumps $B_j$".

**Theorem 2**
> The probability of "$B_i$ bumps $B_j$" is 
> $$ P[A{ij}] = P[X_i^{d_j}<X_j^{d_i}] = P[X_i<X_j^{d_i/d_j}] 
> = \int_0^1 X_j^{d_i/d_j}dX_j 
> = \frac{1}{d_i/d_j+1}
> = \frac{d_j}{d_i+d_j}$$

**Corollary 1** 
> For any two independent bumps $A_{ij}$ and $A_{kl}$, 
> $$ P[A_{ij}\land A_{kl}] = P[A_{ij}]P[A_{kl}] = \frac{d_jd_l}{(d_i+d_j)(d_l+d_m)}$$

**Definition 2.** 
> $Q(d,x)$ is the probability of "A bumps B" where the distance between A and B is $d$ and the distance between A and the finish line is $x$. Then, according to Theorem 2, 
> $$Q(d,x) = \frac{x-d}{2x-d}$$

## Solution 1

Calculate the numeric result of the integral for the probability, such as 
$$P[E_1\land E_2\cdots] = \int\cdots\int_{E1,E_2\cdots}1dX_1dX_2\cdots dX_n$$ 

If the dispersion is $\epsilon$, the search space is of $O(1/\epsilon^n)$, which is too large.

