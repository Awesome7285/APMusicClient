// Function to load JSON asynchronously (non-blocking)
async function load_json(file) {
    const response = await fetch(file);
    if (!response.ok) {
        console.error("Error loading JSON:", error);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
    
}