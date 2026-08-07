const textClientLog = document.getElementById('textClientLog');
const textClientInput = document.getElementById('textClientInput');

const textClientColors = {
    "you": "#9d30b3",
    "others": "#8d805c",
    "prog": "#9c9c04",
    "useful": "#102288",
    "trap": "#9b0303",
    "filler": "#6d6d6d",
    "location": "#0a770a",
    "black": "#000000",
    "green": "#1ec01e"
}

function text_client_log(message) {
    const line = document.createElement('div');
    line.classList.add('log-line');

    line.textContent = message;
    textClientLog.appendChild(line);

    textClientLog.scrollTop = textClientLog.scrollHeight;
}

function text_client_log_colour(message_dict) {
    const line = document.createElement('div');
    line.classList.add('log-line');

    Object.keys(message_dict).forEach(text => {
        const line_part = document.createElement('a');
        line_part.style.color = textClientColors[message_dict[text]];
        line_part.textContent = text;
        if (message_dict[text] === "prog") {
            line_part.style.fontWeight = 'bold';
        }
        if (["prog", "useful", "filler", "trap"].includes(message_dict[text])) {
            line_part.title = "Item Class: " + message_dict[text]
        }
        if (message_dict[text] === "others" || message_dict[text] === "you") {
            line_part.title = "Game: " + names_to_games[text]
        }
        line.appendChild(line_part);
    });
    textClientLog.appendChild(line);

    if (textClientLog.scrollHeight - textClientLog.scrollTop < 450) { // Exact Height of the window should be 372
        textClientLog.scrollTop = textClientLog.scrollHeight;
    }
}

textClientInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        var inp = textClientInput.value;
        inp = inp.trim(); 
        if (inp) {
            console.log('Sent Command: ' + inp);
            //text_client_log(ap_slot + ': ' + inp);

            // Commands go here
            if (inp.startsWith('/')) {
                switch (inp.split(' ')[0]) {
                    case '/ready':
                        socket.send(JSON.stringify([{cmd: "StatusUpdate", status: 10}]));
                        break;
                    case '/received':
                        text_client_log("Listing every received item sorted by time:");
                        Object.values(slash_received).forEach(item => {
                            if (item.location === -2) { 
                                text_client_log_colour({"Starting Invetory Item": "black"})
                            }
                            else if (item.location === -1) { 
                                text_client_log_colour({"Item Cheat": "black"})
                            }
                            else {
                                var message_dict = {"Received: ": "black"}
                                console.log(item);
                                [a, b] = formatItemID(item.item, ap_slot_id, item.flags);
                                message_dict[a] = b;
                                message_dict[" from "] = 'black';
                                [a, b] = formatPlayerID(item.player);
                                message_dict[a] = b;
                                message_dict[" at "] = 'black';
                                [a, b] = formatLocationID(item.location, item.player);
                                message_dict[a] = b;
                                text_client_log_colour(message_dict);
                            }
                        })
                        break;
                    default: //aka /help
                        text_client_log('Commands: /help, /received, /ready. You can also send the default ! commands to the server.');
                        break;
                }
                
            } else {
                socket.send(JSON.stringify([{ cmd: "Say", text: inp }]));
            }
        }
        textClientInput.value = '';
    }
})

function formatTextLog(t) {
    // t should have type, text, player, flags and color if it's the word (found)
    if (t.type === "player_id") {
        return formatPlayerID(t.text);
    }
    else if (t.type === "item_id") {
        return formatItemID(t.text, t.player, t.flags);
    } 
    else if (t.type === "location_id") {
        return formatLocationID(t.text, t.player);
    } 
    else if (t.type === "color") { 
        return [t.text, t.color];
    } 
    else {
        return [t.text, "black"];
    }
}

function formatPlayerID(player_id) {
    text = slot_info[player_id].name;
    if (text == ap_slot) {
        return [text, "you"];
    } else {
        return [text, "others"];
    }
}

function formatItemID(item_id, player_id, flags) {
    text = Object.fromEntries(Object.entries(full_data_package[slot_info[player_id].game]["item_name_to_id"]).map(([key, value]) => [value, key]))[item_id];
    if (flags == 1) { //progression
        return [text, "prog"];
    }
    else if (flags == 2) { //useful
        return [text, "useful"];
    }
    else if (flags == 4) { //trap
        return [text, "trap"];
    } else {
        return [text, "filler"];
    }
}

function formatLocationID(location_id, player_id) {
    text = Object.fromEntries(Object.entries(full_data_package[slot_info[player_id].game]["location_name_to_id"]).map(([key, value]) => [value, key]))[location_id];
    return [text, "location"];
}