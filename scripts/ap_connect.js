// AP Stuff
let socket;
let data_package;
let full_data_package;
let checked_locations;
let slash_received = [];
let locations = [];
let locations_to_reqs = {};
let regions;
let victory;
let ap_host;
let ap_slot;
let ap_game;
let ap_slot_id;
let slot_data;
let slot_info;
let names_to_games;
let uuid = crypto.randomUUID();
let connected = false;
let tracker_created = false;
var awaiting_packets = [];
let VERSION;

function ap_connect() {
    ap_host = document.getElementById("ap-host").value
    ap_slot = document.getElementById("ap-slot").value
    ap_game = document.getElementById("ap-game").value;
    if (!ap_host.startsWith("ws")) {
        ap_host = "wss://" + ap_host;
    }
    socket = new WebSocket(ap_host);

    socket.addEventListener("open", () => {
        console.log("WebSocket opened, waiting for RoomInfo...");
    });

    socket.addEventListener("message", (event) => {
        JSON.parse(event.data).forEach(msg => {

        
            //const msg = JSON.parse(event.data)[0];
            console.log("Server:", msg);
            //console.log("cmd field:", msg.cmd);

            // 1. Server should send this first
            if (msg.cmd === "RoomInfo") {
                console.log("Connected to Archipelago server");
                socket.send(JSON.stringify([{ cmd: "GetDataPackage" }]));
            }
            if (msg.cmd === "Connected") {
                checked_locations = msg.checked_locations;
                slot_data = msg.slot_data;
                regions = slot_data.enabled_albums;
                slot_info = msg.slot_info;
                ap_slot_id = msg.slot;
                names_to_games = Object.fromEntries(Object.values(slot_info).map(item => [item.name, item.game]));
                VERSION = slot_data.version ?? "v0.1.0"
                document.getElementById("requiredBounties").textContent = "Bounties required to goal: " + slot_data["goal_requirement"]
                // REMAKE TRACKER
                createTracker();
                doConnect();
            }
            if (msg.cmd === "DataPackage") {
                // Get an ideal DP
                data_package = msg.data["games"][ap_game];
                full_data_package = msg.data["games"];
                // Send a connection packet
                socket.send(JSON.stringify([{
                    cmd: "Connect",
                    game: ap_game,
                    uuid: uuid,
                    name: ap_slot,
                    password: null,
                    version: { major: 0, minor: 6, build: 7, class: "Version"},
                    tags: tags,
                    items_handling: 7,
                    slot_data: true
                }]));
                connected = true;
            }
            if (msg.cmd === "ReceivedItems") {
                if (JSON.stringify(msg.items[0]) !== JSON.stringify(slash_received[0])) {
                    slash_received.push(...msg.items);
                    updateTracker(msg);
                } else {
                    console.log("The previous ReceivedItems packet was not parsed.")
                }
            }
            if (msg.cmd === "Bounced") {
                if (msg.tags) {
                    if (msg.tags.includes("RingLink")) {
                        receivedRingLink(msg);
                    }
                    if (msg.tags.includes("DeathLink")) {
                        receivedDeathLink(msg);
                    }
                }
            }
            if (msg.cmd === "PrintJSON") {
                var message_dict = {};
                if (msg.type === "ItemSend" || msg.type === "Hint") {
                    msg.data.forEach(t => {
                        [a,b] = formatTextLog(t);
                        message_dict[a] = b;
                    })
                }
                else if (["Join", "Part", "Tutorial", "Chat", "CommandResult", "ItemCheat", "Goal", "Release", "Collect", "Countdown", "AdminCommandResult", "TagsChanged", "ServerChat"].includes(msg.type)) {
                    message_dict[msg.data[0].text] = "black";
                }
                else {
                    message_dict[msg.data[0].text] = "black";
                }
                // console.log(message_dict);
                // text_client_log(text);
                text_client_log_colour(message_dict);
            }
        })
    });

    socket.addEventListener("close", (event) => {
        console.log("Disconnected:", event);
        connected = false;
        text_client_log("Disconnected from the multiworld server. Please refresh the page.")
    });
}

function ap_disconnect() {
    socket.close()
    connected = false;
}

// Send a location
function sendLocation() {
    if (connected) {
        location_name = locations[song_index]['name'];

        locs_to_send = [data_package["location_name_to_id"][location_name]]
        socket.send(JSON.stringify([{
            cmd: "LocationChecks",
            locations: locs_to_send
        }]));

        if (!checked_locations.includes(locs_to_send[0])) {
            checked_locations.push(locs_to_send[0]);
        }
        
    } else {
        text_client_log("No AP Connection.")
        console.log("No AP Connection.")
    }
}

function send_victory() {
    if (connected) {

        if (document.getElementById("Bounty-count").textContent >= slot_data["goal_requirement"]) {
            socket.send(JSON.stringify([{
                cmd: "StatusUpdate",
                status: 30
            }]));
        } else {
            text_client_log("Required Bounties to goal: ", slot_data["goal_requirement"]);
            console.log("Required Bounties to goal: ", slot_data["goal_requirement"])
        }
        
    } else {
        text_client_log("No AP Connection.");
        console.log("No AP Connection.");
    }
}