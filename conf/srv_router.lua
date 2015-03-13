local resolver = require "resty.dns.resolver"

function abort(reason, code)
    ngx.status = code
    ngx.say(reason)
    return code
end

function log(msg)
    ngx.log(ngx.ERR, msg, "\n")
end

local query_subdomain = ngx.var.target_domain
local nameserver = {ngx.var.ns_ip, ngx.var.ns_port}

local dns, err = resolver:new{
  nameservers = {nameserver}, retrans = 2, timeout = 250
}

if not dns then
        log("failed to instantiate the resolver: " .. err)
    return abort("DNS error", 500)
end
log("Querying " .. query_subdomain)
local records, err = dns:query(query_subdomain, {qtype = dns.TYPE_SRV})

if not records then
        log("failed to query the DNS server: " .. err)
    return abort("Internal routing error", 500)
end

if records.errcode then
    -- error code meanings available in http://bit.ly/1ppRk24
    if records.errcode == 3 then
        return abort("Not found", 404)
    else
        log("DNS error #" .. records.errcode .. ": " .. records.errstr)
        return abort("DNS error", 500)
    end
end

if records[1].port then
    -- resolve the target to an IP
    local target_ip = dns:query(records[1].target)[1].address
    -- pass the target ip to avoid resolver errors
        ngx.var.target = target_ip .. ":" .. records[1].port
else
        log("DNS answer didn't include a port")
        return abort("Unknown destination port", 500)
end
