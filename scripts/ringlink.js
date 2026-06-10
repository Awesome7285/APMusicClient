var rings = 0;
const ring_send_button = document.getElementById("ring-send")
const ring_received_text = document.getElementById("ring-received-text")
const ring_count_text = document.getElementById("ring-count-text")
const ring_negative = document.getElementById("allow-negative")
const death_send_button = document.getElementById("death-send")
const death_received_text = document.getElementById("death-received-text")

function receivedRingLink(packet) {
    time = new Date(packet.data["time"])
    amount = packet.data["amount"]

    ring_received_text.textContent = `[${time}] Received ${amount} Rings.`
    rings += amount;
    if (!ring_negative.checked && rings < 0) {
        rings = 0;
    }
    ring_count_text.value = rings;
}

function receivedDeathLink(packet) {
    time = new Date(packet.data["time"])
    amount = packet.data["amount"]

    death_received_text.textContent = `[${time}] DEATH LINK.`;
    death_received_text.style = "color: red;";
    setTimeout(function(){
        death_received_text.textContent = `You are safe...`;
        death_received_text.style = "color: black";
    }, 5000);
}

function sendRingLink(element) {
    const ring_send_amount = document.getElementById(element)
    console.log(ring_send_amount.value)
    socket.send(JSON.stringify([{
        cmd: "Bounce",
        tags: ["RingLink"],
        data: {
            amount: ring_send_amount.value * 1,
            source: Math.trunc(generateHash(uuid)/10000000000),
            time: Date.now()
        }
    }]));
}

function sendDeathLink() {
    socket.send(JSON.stringify([{
        cmd: "Bounce",
        tags: ["DeathLink"],
        data: {
            cause: `${ap_slot} decided to die. RIP.`,
            source: ap_slot,
            time: Date.now()
        }
    }]));
}

function cheatSendLocation() {
    if (connected) {
        location_name = document.getElementById("location-text").value

        // Victory
        // if (location_name == "Victory") {
        //     socket.send(JSON.stringify([{"cmd": "StatusUpdate", "status": ClientStatus.CLIENT_GOAL}]))
        // }

        locs_to_send = [data_package["location_name_to_id"][location_name]]
        socket.send(JSON.stringify([{
            cmd: "LocationChecks",
            locations: locs_to_send
        }]));

        if (!checked_locations.includes(locs_to_send[0])) {
            checked_locations.push(locs_to_send[0]);
        }
        
    } else {
        console.log("No AP Connection.")
    }
}

function cheatSendHint() {
    if (connected) {
        location_name = document.getElementById("hint-text").value

        locs_to_send = [data_package["location_name_to_id"][location_name]]

        packet = {
            cmd: "LocationScouts",
            locations: locs_to_send,
            create_as_hint: 2
        }

        console.log(packet)

        socket.send(JSON.stringify([packet]));
        
    } else {
        console.log("No AP Connection.")
    }
}

const generateHash = (string) => {
    let hash = 0;
    for (const char of string) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0; // Constrain to 32bit integer
    }
    return hash;
};