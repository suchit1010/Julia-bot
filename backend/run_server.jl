
using DotEnv
DotEnv.load!()
println("BINANCE_API_KEY: ", get(ENV, "BINANCE_API_KEY", ">NOT SET<"))
println("BINANCE_API_SECRET: ", get(ENV, "BINANCE_API_SECRET", ">NOT SET<"))

using Pkg
Pkg.activate(".")

using JuliaOSBackend.JuliaOSV1Server
using JuliaOSBackend.JuliaDB

using JuliaOSBackend.Agents.Strategies
include("src/agents/CommonTypes.jl")
include("src/agents/strategies/strategy_ai_swarm_market_making.jl")

function main()
    @info "Initializing DB connection..."
    db_host = get(ENV, "DB_HOST", "localhost")
    db_port = parse(Int, get(ENV, "DB_PORT", "5435"))
        println("[DEBUG] ENV['BINANCE_API_KEY']: ", get(ENV, "BINANCE_API_KEY", "<not set>"))
        println("[DEBUG] ENV['BINANCE_API_SECRET']: ", get(ENV, "BINANCE_API_SECRET", "<not set>"))
    db_name = get(ENV, "DB_NAME", "postgres")
    db_user = get(ENV, "DB_USER", "postgres")
    db_password = get(ENV, "DB_PASSWORD", "postgres")
    connection_string = "host=$(db_host) port=$(db_port) dbname=$(db_name) user=$(db_user) password=$(db_password)"
    JuliaDB.initialize_connection(connection_string)
    @info "DB connection initialized successfully."
    @info "DB connection string: $(connection_string)"
    @info "Loading state from DB..."
    JuliaDB.load_state()
    @info "State loaded successfully."

    @info "Starting server..."
    host = get(ENV, "HOST", "127.0.0.1")
    port = parse(Int, get(ENV, "PORT", "8052"))
    JuliaOSV1Server.run_server(host, port)
    @info "Server started successfully on http://$(host):$(port)"
end

if abspath(PROGRAM_FILE) == @__FILE__
    main()
end