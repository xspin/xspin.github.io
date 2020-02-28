---
title: Probability & Statistics
date: 2018-10-02 23:05:51
tags: [probability, statistics]
---

## Chapter 1 Introduction to Statistics and Data Analysis

## Chapter 2 Probability

### 2.1 Sample Space

Definition 2.1: The set of all possible outcomes of a statistical experiment is called the **sample space**.

### 2.2 Events

Definition 2.2: An **event** is a subset of a sample space.

Definition 2.3: The **complement** of an event A with respect to S is the subset of all elements of S that are not in A. Denote A'=S\A.

Definition 2.4: The **intersection** of two events A and B, denoted by $A\cap B$, is the event containing all elements that are common to A and  B.

Definition 2.5: Two events A and B are **mutually exclusive**, or disjoint, if $A\cap B=\emptyset$.

Definition 2.6: The **union** of the two events A and B, denoted by the symbol $A\cup  B$, is the events containing all the elements that belong to A or B or both.

<!--more-->

### 2.3 Counting Sample Pints

Definition 2.7: A **permutation** is an arrangement of all or part of a set of objects.

Theorem 2.1: The number of permutations of n objects is $n!$.

Theorem 2.2: The number of permutations of n distinct objects taken r at a time is $_nP_r=\frac{n!}{(n-r)!}$

Theorem 2.3: The number of permutations of n objects arrange in a circle is $(n-1)!$.

Theorem 2.4: The number of distinct permutations of n things of which $n_k$ are of a $k$th kind is 
$$
\frac{n!}{n_1!n_2!\cdots n_k!}
$$
Theorem 2.5: The number of ways of partitioning a set of n objects into r cells with $n_i$th elements in the i-th cell, is 
$$
{n\choose n_1,n_2,\cdots,n_r} = \frac{n!}{n_1!n_2!\cdots n_r!}
$$
where $n_1+\cdots+n_r=n$.

Theorem 2.6: The number of combinations of n distinct objects taken r at a time is 
$$
{n\choose r}=\frac{n!}{r!(n-r)!}
$$

### 2.4 Probability of an Event

Definition 2.9: The probability of an event A is the sum of the weights of all sample points in A. Therefore, 

- $0\le P(A)\le1, P(\emptyset)=0 $, and $P(S)=1$.

Rule 2.3: If an experiment can result in any one of N different equally likely outcomes, and if exactly n of these outcomes correspond to event A, then the probability of event A is $P(A)=n/N$.

Theorem 2.7: If A and B are two events, then 
$$
P(A\cup B)=P(A)+P(B)-P(A\cap B).
$$
Corollary 2.1: If A and B are mutually exclusive, then 
$$
P(A\cup B)=P(A)+P(B).
$$
Theorem 2.8: For three events A, B, and C, 
$$
P(A\cup B\cup C)=P(A)+P(B)+P(C)-P(A\cap B)-P(A\cap C)-P(B\cap C)+P(A\cap B\cap C).
$$
Theorem 2.9: If A and A' are complementary events, then $P(A)+P(A')=1$.

### 2.6 Conditional Probability, Independence, and the Product Rule 

Definition 2.10: The conditional probability of B, given A, denoted by $P(B|A)$, is defined by 
$$
P(B|A)=\frac{P(A\cap B)}{P(A)}, P(A)>0.
$$
Definition 2.11: Two events A and B are **independent** is and only if 
$$
P(B|A)=P(B) \mbox{ or } P(A|B)=P(A).
$$
Theorem 2.10: If in an experiment the events A and B can both occur, then 
$$
P(A\cap B)=P(A)P(B|A), P(A)>0.
$$

### 2.7 Bayes' Rule

Theorem 2.13: If the events $B_1,\cdots,B_k$ constitute a partition of the sample space $S$ such that $P(B_i)\ne0$, the for any event $A$ of $S$, 

$$
P(A)=\sum_{i=1}^kP(B_i\cap A)=\sum_{i=1}^kP(B_i)P(A|B_i).
$$

Theorem 2.14: (Bayes' Rule)

$$
P(B_r|A)=\frac{P(B_r\cap A)}{\sum_{i=1}^kP(B_i\cap A)}=\frac{P(B_r)P( A|B_r)}{\sum_{i=1}^kP(B_i)P(A|B_i)}
$$

## Chapter 3 Random Variables and Probability Distributions

Def. 3.1: A **random variable** is a function that associates a real number with each element in the sample space.

### 3.1 Concept of a Random Variable

### 3.2 Discrete Probability Distributions

### 3.3 Continuous Probability Distributions

### 3.4 Joint Probability Distributions

Def. 3.10: (Marginal Distribution)
$$
g(x)=\int_{-\infty}^{\infty}f(x,y)dy.
$$
Def. 3.11: (Conditional Distribution)
$$
f(y|x)=\frac{f(x,y)}{g(x)}.
$$
Def 3.13: (mutually Statistically Independent)
$$
f(x_1,\cdots,x_n) = f_1(x_1)\cdots f_n(x_n)
$$

## Chapter 4 Mathematical Expectation

### 4.1 Mean of a Random Variable

Def. 4.1: (expected value / mean)
$$
\mu=E(x)
$$

### 4.2 Variance and Covariance of Random Variables

Def 4.3: (variance)
$$
\sigma^2=E[(X-\mu)^2]
$$
The. 4.2: $\sigma^2=E(X^2)-\mu^2$

Def. 4.4: (covariance)
$$
\sigma_{XY}=E[(X-\mu_X)(Y-\mu_Y)]
$$
The. 4.4: $\sigma_{XY} = E(XY)-\mu_X\mu_Y$

Def. 4.5: (correlation coefficient) $\rho_{XY}=\sigma_{XY}/\sigma_X\sigma_Y$

### 4.3 Means and Variances of Linear Combinations of Random Variables

The. 4.7: $E[g(X,Y)\pm h(X,Y)] = E[g(X,Y)]\pm [h(X,Y)]$

The. 4.8: If X and Y are independent, then $E(XY)=E(X)E(Y)$ 

Approximation

- $E[g(X)]\approx g(\mu_x)+\partial^2g(x)/\partial x^2|_{x=\mu_x} \sigma_X^2/2$
- $Var[g(X)]\approx [\partial g(x)/\partial x]^2_{x=\mu_X}\sigma_X^2$

### 4.4 Chebyshev's Theorem

The. 4.10: $P(\mu-k\sigma<X<\mu+k\sigma)\ge 1-1/k^2$

## Chapter 5 Some Discrete Probability Distributions

### 5.1 Introduction and Motivation

### 5.2 Binomial and Multinomial Distributions

Binomial Distribution $b(x;n,p)={n\choose x}p^xq^{n-x}$

The. 5.1: The mean and variance of binomial distribution are $\mu=np$ and $\sigma^2=npq$.

Multinomial Distribution 
$$
f(x_1,\cdots,x_k;p_1,\cdots,p_k) = {n\choose {x_1,\cdots,x_k}} p_1^{x_1}\cdots p_k^{x_k} = \frac{n!}{x_1!\cdots x_k!} p_1^{x_1}\cdots p_k^{x_k}
$$

### 5.3 Hypergeometric Distribution

Hypergeometric Distribution
$$
h(x;N,n,k)=\frac{~{k\choose n}{N-k\choose n-x}}{N\choose n}
$$
The. 5.2: $\mu=nk/N$ and $\sigma^2 = \frac{N-n}{N-1}n\frac{k}{N}(1-\frac{k}{N})$

### 5.4 Negative Binomial and Geometric Distributions

Negative Binomial Distribution $B(k,p)$
$$
b^*(x;k,p) = {x-1 \choose k-1} p^kq^{x-k}
$$
Geometric Distribution
$$
g(x;p)=pq^{x-1}
$$
The. 5.3: $\mu=1/p$ and $\sigma^2=(1-p)/p^2$

### 5.5 Poisson Distribution and the Poisson Process

Poisson Distribution 
$$
p(x;\lambda t)=\frac{e^{-\lambda t}(\lambda t)^x}{x!}
$$
The. 5.4: $\sigma^2=\mu=\lambda t$

The. 5.5: When $np\to \mu$ as $n\to \infty$, $b(x;n,p)\to p(x;\mu)$

### 5.6 Potential Misconceptions and Hazards

## Chapter 6 Some Continuous Probability Distributions

### 6.1 Continuous Uniform Distribution

Uniform Distribution (rectangular distribution)
$$
f(x;A,B) =
\begin{cases}
\frac{1}{B-A}, & A\le x\le B,\\
0, & \mbox{elsewhere}.
\end{cases}
$$
The. 6.1: $\mu=(A+B)/2, \sigma^2=(B-A)^2/12$.

### 6.2 Normal Distribution

Normal/Gaussian Distribution $\mathcal N(\mu,\sigma^2)$
$$
n(x;\mu,\sigma) = \frac{1}{\sqrt{2\pi}\sigma}\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
$$

### 6.3 Areas under the Normal Curve

### 6.4 Applications of the Normal Distribution

### 6.5 Normal Approximation to the Binomial

The. 6.3: If $X\sim B(n,p)$, then 
$$
Z=\frac{X-np}{\sqrt{npq}},
$$
as $n\to\infty$, is the standard normal distribution $n(z;0,1)$.
$$
\begin{align}
P(X\le x) & = \sum_{k=0}^xb(k;n,p)\\
&\approx P(Z\le\frac{x+0.5-np}{\sqrt{npq}}),
\end{align}
$$
and the approximation will be good if $np,n(1-p)\ge 5$.

### 6.6 Gamma and Exponential Distributions

Def. 6.2: Gamma Function
$$
\Gamma(\alpha) = \int_0^\infty x^{\alpha-1}e^{-x}dx, \quad \alpha>0.
$$
Properties

- $\Gamma(n) =  n!$
- $\Gamma(\alpha)=(\alpha-1)\Gamma(\alpha-1)$
- $\Gamma(1/2)=\sqrt{\pi}$

Gamma Distribution
$$
f(x;\alpha,\beta) = 
\begin{cases}
\frac{x^{\alpha-1}e^{-x/\beta}}{\beta^\alpha\Gamma(\alpha)}, & x>0,\\
0, & x\le 0.
\end{cases}
$$
where $\alpha,\beta>0$

- $\mu=\alpha\beta$
- $\sigma^2=\alpha\beta^2$

Exponential Distribution
$$
f(x;\beta) = 
\begin{cases}
\frac{e^{-x/\beta}}{\beta}, & x>0,\\
0, & x\le 0.
\end{cases}
$$
where $\beta>0$.

- $\mu=\beta$
- $\sigma^2=\beta^2$

### 6.7 Chi-Squared Distribution

$$
f(x;v) = 
\begin{cases}
\frac{x^{v/2-1}e^{-x}}{\beta^{v/2}\Gamma(v/2)}, & x>0,\\
0, & x\le 0.
\end{cases}
$$

where $v>0$.

- $\mu=v$, $\sigma^2=2v$.

### 6.8 Beta Distribution

### 6.9 Lognormal Distribution

### 6.10 Weibull Distribution

## Chapter 7 Functions of Random Variables

## Chapter 8 Fundamental Sampling Distributions and Data Descriptions

### 8.1 Random Sampling

Def 8.1: A **population** consists of the totality of the observations with which we are concerned.

Def 8.2: A **sample** is a subset of a population

Def 8.3: x are independent RVs. the joint probability distribution $f(x_1,\cdots,x_n) = f(x_1)\cdots f(x_n)$.

### 8.2 Some Important Statistics

Def 8.4: Any function of the random variables constituting a random sample is called a statistic.

### 8.3 Sampling Distributions 

Def 8.5: The probability distribution of a statistic is called a sampling distribution.

### 8.4 Sampling Distribution of Means and the Central Limit Theorem

Them 8.2: $Z=\frac{\bar X-\mu}{\sigma/\sqrt{n}}$ as $n\to\infty$, is the standard normal distribution $n(z;,0,1)$.

Them 8.3:  $Z=\frac{\bar X_1-\bar X_2-(\mu_1-\mu_2)}{\sqrt{\sigma_1^2/n_1+\sigma_2^2/n_2}}$ is approximately a standard normal variable.

### 8.5 Sampling Distribution of S^2^

Them 8.4: 
$$
\chi^2=\frac{(n-1)S^2}{\sigma^2}=\sum^n_{i=1}\frac{(X_i-\bar X)}{\sigma^2}
$$
has a chi-squared distribution with $v=n-1$ degrees of freedom.

### 8.6 t-Distribution

Them 8.5: Let $Z \sim  n(0,1), V\sim \chi^2(v)$ ,$T=Z/\sqrt{V/v}$ is given by the density function 
$$
h(t) = \frac{\Gamma[(v+1)/2]}{\Gamma(v/2)\sqrt{\pi v}}(1+t^2/v)^{-(v+1)/2}
$$
of the t-distribution with $v$ degree of freedom.

The t-distribution is used extensively in problems that deal with inference about the population mean or in problems that involve comparative samples.

### 8.7 F-Distribution

Them 8.6: 

The F-distribution is called the variance ratio distribution.

## Chapter 9 One- and Two-Sample Estimation Problems

## Chapter 10 One- and Two-Sample Tests of Hypotheses

