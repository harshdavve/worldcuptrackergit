// sw.js — World Cup Tracker Service Worker
// Fires notifications 60 min and 30 min before each saved match.

let pendingNotifications = [];

// ── Receive updated notification list from the page ──────────────────────────

self.addEventListener("message", event => {

    if (event.data && event.data.type === "SYNC_NOTIFICATIONS") {
        pendingNotifications = event.data.notifications || [];
    }

});

// ── Lifecycle ─────────────────────────────────────────────────────────────────

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
    startNotificationTimer();
});

// ── Notification timer ────────────────────────────────────────────────────────
// Checks every 60 seconds whether any saved match is 60 or 30 minutes away.
// Two separate alerts fire: a "heads up" at 60 min and a "starting soon" at 30 min.
// Fired IDs are tracked to ensure each alert fires exactly once.

const firedAlerts = new Set();

function startNotificationTimer() {

    setInterval(() => {

        const now = Date.now();

        pendingNotifications.forEach(n => {

            const matchTime = new Date(n.matchDate).getTime();
            const minutesLeft =
                Math.round((matchTime - now) / 60000);

            const key60 = `${n.fixtureId}-60`;
            const key30 = `${n.fixtureId}-30`;

            if (
                minutesLeft <= 60 &&
                minutesLeft > 59 &&
                !firedAlerts.has(key60)
            ) {
                firedAlerts.add(key60);
                showMatchNotification(n, 60);
            }

            if (
                minutesLeft <= 30 &&
                minutesLeft > 29 &&
                !firedAlerts.has(key30)
            ) {
                firedAlerts.add(key30);
                showMatchNotification(n, 30);
            }

        });

    }, 60 * 1000);

}

function showMatchNotification(match, minutesBefore) {

    const title =
        minutesBefore === 60
            ? "⚽ Match in 1 hour"
            : "⚽ Match starting soon";

    const body =
        `${match.homeTeam} vs ${match.awayTeam} ` +
        `kicks off in ${minutesBefore} minutes.`;

    self.registration.showNotification(title, {
        body,
        icon: "/icon.png",
        badge: "/badge.png",
        tag: `match-${match.fixtureId}-${minutesBefore}`,
        requireInteraction: true,
        data: { fixtureId: match.fixtureId }
    });

}

// ── Handle notification click ─────────────────────────────────────────────────

self.addEventListener("notificationclick", event => {

    event.notification.close();

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(clientList => {

                if (clientList.length > 0) {
                    return clientList[0].focus();
                }

                return self.clients.openWindow("/");

            })
    );

});
