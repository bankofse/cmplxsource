local http = require "resty.http"

function abort(reason, code)
    ngx.status = code
    ngx.say(reason)
    return code
end

function log(msg)
    ngx.log(ngx.ERR, msg, "\n")
end

-- Get and array of targets
function split_result(str)
    local results = {}
    local i = 1
    for w in string.gmatch(str, "%S+") do
        results[i] = w
        i = i + 1
    end
    -- Remove the first two, they're not needed
    table.remove(results, 1)
    table.remove(results, 1)
    return results
end

function fetch_backends() 
    local httpc = http.new()
    
    marathon_host = "10.132.89.71"
    task_query = "/v2/apps/" .. ngx.var.target .. "/tasks"
    log("Querying " .. marathon_host .. task_query)

    -- The generic form gives us more control. We must connect manually.
    httpc:set_timeout(500)
    httpc:connect(marathon_host, 8080)

    -- And request using a path, rather than a full URI.
    local res, err = httpc:request{
          path = task_query,
    }

    if not res then
        ngx.say("failed to request: ", err)
        return
    end

    -- Now we can use the body_reader iterator, to stream the body according to our desired chunk size.
    local reader = res.body_reader

    local chunk, err = reader(8192)
    if err then
        ngx.log(ngx.ERR, err)
        return
    end

    if chunk then
        return chunk
    end

end

raw = fetch_backends()
result_array = split_result(raw)
ngx.var.target = result_array[math.random(1, #result_array)]
log("Forwarding to " .. ngx.var.target)
