// Function to load JSON synchronously (blocking)
function load_json_sync(file) {
    let data;
    const request = new XMLHttpRequest();
    request.open("GET", file, false); // false makes it synchronous (blocking)
    request.send(null);

    if (request.status === 200) {
        data = JSON.parse(request.responseText);
    } else {
        console.error("Error loading JSON:", request.status);
    }
    return data
}