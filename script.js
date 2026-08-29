const backendUrlInput = document.getElementById("backendUrl");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const lastPing = document.getElementById("lastPing");
const nextPing = document.getElementById("nextPing");

const successCount = document.getElementById("successCount");
const failureCount = document.getElementById("failureCount");


// 12 minutes
const INTERVAL = 12 * 60 * 1000;
//const INTERVAL = 10 * 1000;

// Keep track of the timer
let timer = null;

let nextPingTime = null;

let successes = 0;
let failures = 0;


// Check whether current time is between 6 AM and 1 AM
function isActiveHours() {

    const now = new Date();

    const hour = now.getHours();

    // Active from 6 AM until midnight
    // Also active from midnight until 1 AM
    return hour >= 6 || hour < 1;
}


// Format time
function formatTime(date) {

    if (!date) {
        return "—";
    }

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}


// Update UI
function updateStatus(running) {

    if (running) {

        statusDot.classList.remove("stopped");
        statusDot.classList.add("running");

        statusText.textContent = "Running";

        startBtn.disabled = true;
        stopBtn.disabled = false;

    } else {

        statusDot.classList.remove("running");
        statusDot.classList.add("stopped");

        statusText.textContent = "Stopped";

        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}


// Send request to backend
async function pingBackend() {

    const url = backendUrlInput.value.trim();

    if (!url) {
        console.log("Backend URL is empty.");
        return;
    }


    // Don't ping during sleeping hours
    if (!isActiveHours()) {

        console.log("Sleeping hours. Ping skipped.");

        nextPing.textContent = "Paused";

        scheduleNextCheck();

        return;
    }


    console.log("Sending keep-alive request...");

    try {

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store"
        });


        if (response.ok) {

            successes++;

            successCount.textContent = successes;

            const now = new Date();

            lastPing.textContent = formatTime(now);

            console.log("Keep-alive successful:", response.status);

        } else {

            failures++;

            failureCount.textContent = failures;

            console.log(
                "Keep-alive failed:",
                response.status
            );
        }

    } catch (error) {

        failures++;

        failureCount.textContent = failures;

        console.error(
            "Keep-alive request failed:",
            error
        );
    }


    scheduleNextCheck();
}


// Schedule next ping
function scheduleNextCheck() {

    clearTimeout(timer);

    const now = new Date();


    if (!isActiveHours()) {

        nextPing.textContent = "Paused";

        return;
    }


    nextPingTime = new Date(
        now.getTime() + INTERVAL
    );

    nextPing.textContent = formatTime(nextPingTime);


    timer = setTimeout(() => {

        pingBackend();

    }, INTERVAL);
}


// Start
startBtn.addEventListener("click", () => {

    updateStatus(true);

    console.log("Keep Alive started");

    // Ping immediately
    pingBackend();

});


// Stop
stopBtn.addEventListener("click", () => {

    clearTimeout(timer);

    timer = null;

    nextPingTime = null;

    nextPing.textContent = "—";

    updateStatus(false);

    console.log("Keep Alive stopped");

});
