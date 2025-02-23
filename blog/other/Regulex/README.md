# Regulex

正则表达式工具


## Reluex

> 正则表达式可视化工具


Copy from [jex.im/regulex](https://jex.im/regulex/#!flags=&re=a%7Cb*)
and [github:CJex/regulex](https://github.com/CJex/regulex)


Demo: [Click me](http://10.64.12.53:65534/regularexprtool.html#!flags=gm&rexpr=a%7Cb*)

<iframe frameborder="0" width="212" height="600" src="http://10.64.12.53:65534/Regulex.html#flags=&re=(a%7Cb)*"></iframe>


## Regular Express Test Tool

> 正则表达式测试工具

Copy from [c.runoob.com](https://c.runoob.com/front-end/854/)

Demo: [Click me](http://10.64.12.53:65534/regularexprtool.html)


## 正则表达式示例

### 不包含`aa`, `bb`, `cc`任意一个

```
^(?!.*(?:aa|bb|cc)).*$
```

[>>>](http://10.64.12.53:65534/regularexprtool.html#!rexpr=%5E(%3F!.*(%3F%3Aaa%7Cbb%7Ccc)).*%24&text=xaax%0Axbbcc%0Anoabc&flags=gm)


### 包含`aa`, `bb`, `cc`任意一个

```
^(?=.*(?:aa|bb|cc)).*$
^.*(?:aa|bb|cc).*$
^.*(aa|bb|cc).*$
aa|bb|cc
```

[>>>](http://10.64.12.53:65534/regularexprtool.html#!flags=gm&rexpr=%5E(%3F%3D.*(%3F%3Aaa%7Cbb%7Ccc)).*%24&text=test%20aab%0Abbtest%0Aaabbcc%0Anoabc)


### 同时包含`aa`, `bb`, `cc`

```
^(?=.*aa)(?=.*bb)(?=.*cc).*$
(?=.*aa)(?=.*bb)(?=.*cc)
```

[>>>](http://10.64.12.53:65534/regularexprtool.html#!flags=gm&rexpr=%5E(%3F%3D.*aa)(%3F%3D.*bb)(%3F%3D.*cc).*%24&text=bbcc_noa%0Aaacc_nob%0Aaabb_noc%0Aaatbbxcc%0Accbbxxaa)


### 包含`aa`但不包含`bb`

```
^(?=.*aa)(?!.*bb).*$
```

[>>>](http://10.64.12.53:65534/regularexprtool.html#!flags=gm&rexpr=%5E(%3F%3D.*aa)(%3F!.*bb).*%24&text=has_aa_no_b%0Ahas_aa_has_bb%0Ahas_bb_no_a)


## 包含`aa`和`bb`但不包含`cc`和`dd`

```
^(?=.*aa)(?=.*bb)(?!.*cc)(?!.*dd).*$
```

[>>>](http://10.64.12.53:65534/regularexprtool.html#!flags=gm&rexpr=%5E(%3F%3D.*aa)(%3F%3D.*bb)(%3F!.*cc)(%3F!.*dd).*%24&text=aabbccdd%0Aaaccbb%0Addaabb%0Abbaa_nocd%0Aaaxxbbbaa)


> 注：如果有`?!`必需要有`^$`全匹配。