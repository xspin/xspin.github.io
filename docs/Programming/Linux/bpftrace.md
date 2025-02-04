# Linux 性能追踪工具 - bpftrace

## 简介

https://github.com/bpftrace/bpftrace



// todo

### 安装依赖

```bash
# centos
# yum install -y kernel-devel bcc-tools python3-bcc bpftrace
```

## 使用示例

```c
#!/usr/bin/env bpftrace

// 1秒内超过100次200+us则为过载

BEGIN
{
    @overload = 200; // us
    @threshold = 100;  // times

    time("[%Y-%m-%d %H:%M:%S] ");
    printf("Tracing plugin functions ...\n");
    time("[%Y-%m-%d %H:%M:%S] ");
    printf("overload=%u us, threshold=%u times/second\n", @overload, @threshold);

    printf("Press Ctrl-C to end\n\n");
}

uprobe:/test/plugin/uauth_plug.so:user_is_timeout,
uprobe:/test/plugin/uauth_plug.so:user_auth_for_establish_handler,
uprobe:/test/plugin/uauth_plug.so:insert_new_user,
uprobe:/test/plugin/uauth_plug.so:user_auth_redirect_handle,
uprobe:/test/plugin/uauth_plug.so:user_auth_match_policy,
uprobe:/test/plugin/uauth_plug.so:get_bind_user,
uprobe:/test/plugin/uauth_plug.so:stamp_user_noneed_auth,
uprobe:/test/plugin/uauth_plug.so:notify_nopass_user_login,
uprobe:/test/plugin/uauth_plug.so:stamp_new_user,
uprobe:/test/plugin/uauth_plug.so:user_auth_stamp_need_auth,
uprobe:/test/lib/libhash.so:hash_lookup_copy
{
    @depth[tid]++;
    @start[tid, @depth[tid]] = nsecs;
    @funcmap[tid, @depth[tid]] = func;
    if (@probmap[func] != 1) {
        @probmap[func] = 1;
        time("[%Y-%m-%d %H:%M:%S] ");
        printf("First attaching: tid %u func %s %s\n", tid, func, probe);
    }
}

uretprobe:/test/plugin/uauth_plug.so:user_is_timeout,
uretprobe:/test/plugin/uauth_plug.so:user_auth_for_establish_handler,
uretprobe:/test/plugin/uauth_plug.so:insert_new_user,
uretprobe:/test/plugin/uauth_plug.so:user_auth_redirect_handle,
uretprobe:/test/plugin/uauth_plug.so:user_auth_match_policy,
uretprobe:/test/plugin/uauth_plug.so:get_bind_user,
uretprobe:/test/plugin/uauth_plug.so:stamp_user_noneed_auth,
uretprobe:/test/plugin/uauth_plug.so:notify_nopass_user_login,
uretprobe:/test/plugin/uauth_plug.so:stamp_new_user,
uretprobe:/test/plugin/uauth_plug.so:user_auth_stamp_need_auth,
uretprobe:/test/lib/libhash.so:hash_lookup_copy
{
    if (@start[tid, @depth[tid]] > 0) {
        $us_tmp = (nsecs - @start[tid, @depth[tid]]) / 1000;

        @us_hist[comm, pid, probe] = hist($us_tmp);
        // @us_sum[comm, pid, probe] = sum($us_tmp);
        @us_avg[comm, pid, probe] = avg($us_tmp);
        @us_max[comm, pid, probe] = max($us_tmp);
        //@us_stats[comm, pid, probe] = stats($us_tmp);

        if ($us_tmp > (uint64)@overload) {
            @count[tid, @funcmap[tid, @depth[tid]]]++;
            @over_us[tid, @funcmap[tid, @depth[tid]]] += $us_tmp;
        }
    }

    $ts = nsecs/1000/1000/1000; // second
    if ($ts > @prev_second[tid, @funcmap[tid, @depth[tid]]]) {
        if (@count[tid, @funcmap[tid, @depth[tid]]] > @threshold) {
            $avg_us = (uint64)@over_us[tid, @funcmap[tid, @depth[tid]]] / (uint64)@count[tid, @funcmap[tid, @depth[tid]]];
            time("[%Y-%m-%d %H:%M:%S] ");
            printf("%s: comm %s tid %u", probe, comm, tid);
            printf(" func %s cost %u us exceeds %u us over %u times\n",
                @funcmap[tid, @depth[tid]], $avg_us, @overload, @count[tid, @funcmap[tid, @depth[tid]]]);
        }

        @count[tid, @funcmap[tid, @depth[tid]]] = 0;
        @over_us[tid, @funcmap[tid, @depth[tid]]] = 0;
        @prev_second[tid, @funcmap[tid, @depth[tid]]] = $ts;
    }

    delete(@start[tid, @depth[tid]]);
    delete(@funcmap[tid, @depth[tid]]);
    if (@depth[tid] > 0) {
        @depth[tid]--;
    }
}


END 
{
    time("[%Y-%m-%d %H:%M:%S] ");
    printf("Elapsed %d seconds\n", elapsed/1000/1000/1000);
}

```

