const API_KEY = "23615b1dd3f116903097016e2d81dd5076e629ba";

const BASE_URL = "https://sports.bzzoiro.com/api/v2";

const headers = {
    Authorization: `Token ${API_KEY}`
};

const FLAGS = {
    England:"🇬🇧",
    France:"🇫🇷",
    Brazil:"🇧🇷",
    Spain:"🇪🇸",
    Germany:"🇩🇪",
    Netherlands:"🇳🇱",
    Belgium:"🇧🇪",
    Norway:"🇳🇴",
    Sweden:"🇸🇪",
    Ecuador:"🇪🇨",
    Ireland:"🇬🇧",
    Colombia:"🇨🇴",
    Portugal:"🇵🇹",
    Argentina:"🇦🇷",
    Italy:"🇮🇹",
    Croatia:"🇭🇷"
};

renderClubs();



function renderClubs() {

    const grid = document.getElementById("clubGrid");

    grid.innerHTML = "";

    CLUBS.forEach(club => {

        const card = document.createElement("div");

        card.className = "club-card";

        card.innerHTML = `
            <h3>${club.name}</h3>
        `;

        card.onclick = () => {
            loadClub(club);
        };

        grid.appendChild(card);

    });

}

async function loadClub(club) {

    const dashboard = document.getElementById("dashboard");

    dashboard.innerHTML = `
        <h2>Loading ${club.name}...</h2>
    `;

    try {

        const response = await fetch(
            `${BASE_URL}/players/?team_id=${club.teamId}`,
            { headers }
        );

        const data = await response.json();

        await displayPlayers(club, data.results || []);

    }
    catch (error) {

        console.error(error);

        dashboard.innerHTML = `
            <h2>Failed to load players</h2>
        `;

    }

}

async function displayPlayers(club, players) {

    const dashboard = document.getElementById("dashboard");

    const worldCupPlayers = getWorldCupPlayers(players);

    const nationalTeamIds = [
        ...new Set(
            worldCupPlayers
                .map(player => player.national_team_id)
                .filter(Boolean)
        )
    ];

    const fixtureResponses =
        await Promise.all(
            nationalTeamIds.map(
                teamId => getUpcomingFixtures(teamId)
            )
        );

        const recentFixtureResponses =
    await Promise.all(
        nationalTeamIds.map(
            teamId => getRecentFixtures(teamId)
        )
    );

const recentFixtures =
    recentFixtureResponses.flat();

    const lastFiveResults =
    [...new Map(
        recentFixtures.map(
            fixture => [fixture.id, fixture]
        )
    ).values()]
    .sort(
        (a,b) =>
            new Date(b.event_date) -
            new Date(a.event_date)
    )
    .slice(0,5);

    const fixtures = fixtureResponses.flat();

    const uniqueFixtures = [
        ...new Map(
            fixtures.map(f => [f.id, f])
        ).values()
    ];

    const nextFiveFixtures = [...uniqueFixtures]
        .sort(
            (a, b) =>
                new Date(a.event_date) -
                new Date(b.event_date)
        )
        .slice(0, 5);

    const nextFixtureByTeam = {};

    uniqueFixtures.forEach(fixture => {

        const fixtureDate =
            new Date(fixture.event_date);

        const homeExisting =
            nextFixtureByTeam[
                fixture.home_team_id
            ];

        if (
            !homeExisting ||
            fixtureDate <
                new Date(homeExisting.event_date)
        ) {
            nextFixtureByTeam[
                fixture.home_team_id
            ] = fixture;
        }

        const awayExisting =
            nextFixtureByTeam[
                fixture.away_team_id
            ];

        if (
            !awayExisting ||
            fixtureDate <
                new Date(awayExisting.event_date)
        ) {
            nextFixtureByTeam[
                fixture.away_team_id
            ] = fixture;
        }

    });

    const matchesThisWeek =
    nextFiveFixtures.length;

    const playersPlayingSoon = sortedPlayers.filter(player => {

    const fixture =
        nextFixtureByTeam[player.national_team_id];

    if (!fixture) return false;

    const fixtureDate = new Date(fixture.event_date);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
        fixtureDate.toDateString() ===
        tomorrow.toDateString()
    );

}).length;

    const sortedPlayers =
        [...worldCupPlayers];

    sortedPlayers.sort((a, b) => {

        const fixtureA =
            nextFixtureByTeam[
                a.national_team_id
            ];

        const fixtureB =
            nextFixtureByTeam[
                b.national_team_id
            ];

        if (!fixtureA && !fixtureB) return 0;
        if (!fixtureA) return 1;
        if (!fixtureB) return -1;

        return (
            new Date(fixtureA.event_date) -
            new Date(fixtureB.event_date)
        );

    });

    const playerCount =
        worldCupPlayers.length;

    const nationsRepresented = [
        ...new Set(
            worldCupPlayers.map(
                player => player.nationality
            )
        )
    ].length;

    dashboard.innerHTML = `
        <h2>${club.name} World Cup Tracker</h2>

        <div class="summary-grid">

            <div class="summary-card">
    <div class="summary-number">
        ${matchesThisWeek}
    </div>
    <div class="summary-label">
        Matches This Week
    </div>
</div>

            <div class="summary-card">
                <div class="summary-number">
                    ${nationsRepresented}
                </div>
                <div class="summary-label">
                    Nations
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-number">
                   ${playersPlayingSoon}
                </div>
                <div class="summary-label">
                    Playing Soon
                </div>
            </div>

        </div>

        <h3 class="section-heading">
    ⚽ Next 5 World Cup Fixtures
</h3>

<div id="fixtureGrid"></div>

<h3 class="section-heading">
    🏆 Last 5 Results
</h3>

<div id="resultsGrid"></div>

    const resultsGrid =
    document.getElementById(
        "resultsGrid"
    );
    lastFiveResults.forEach(match => {

    const resultCard =
        document.createElement("div");

    resultCard.className =
        "fixture-card";

    resultCard.innerHTML = `
        <div class="fixture-teams">
            ${match.home_team}
            ${match.home_score}
            -
            ${match.away_score}
            ${match.away_team}
        </div>

        <div class="fixture-date">
            📅 ${new Date(
                match.event_date
            ).toLocaleDateString(
                "en-GB",
                {
                    day:"numeric",
                    month:"short"
                }
            )}
        </div>
    `;

    resultsGrid.appendChild(
        resultCard
    );

});

<button
    class="notify-btn"
    onclick="saveNotification(
        ${match.id},
        '${match.home_team}',
        '${match.away_team}',
        '${match.event_date}'
    )"
>
🔔 Notify Me
</button>
    const fixtureGrid =
        document.getElementById(
            "fixtureGrid"
        );
        const playersByNationalTeam = {};

worldCupPlayers.forEach(player => {

    if (!playersByNationalTeam[player.national_team_id]) {

        playersByNationalTeam[
            player.national_team_id
        ] = [];

    }

    playersByNationalTeam[
        player.national_team_id
    ].push(player.name);

});

    nextFiveFixtures.forEach(match => {

        const fixtureCard =
            document.createElement("div");

        fixtureCard.className =
            "fixture-card";

     const homePlayers =
    playersByNationalTeam[
        match.home_team_id
    ] || [];

const awayPlayers =
    playersByNationalTeam[
        match.away_team_id
    ] || [];

const fixturePlayers = [
    ...homePlayers,
    ...awayPlayers
];

fixtureCard.innerHTML = `
    <div class="fixture-teams">
        ${match.home_team}
        <span>vs</span>
        ${match.away_team}
    </div>

    <div class="fixture-date">
        📅 ${new Date(
            match.event_date
        ).toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "short"
            }
        )}
    </div>

    <div class="fixture-players">
        👥 ${fixturePlayers.join(", ")}
    </div>

    <button
        class="notify-btn"
        onclick="saveNotification(
            ${match.id},
            '${match.home_team}',
            '${match.away_team}',
            '${match.event_date}'
        )"
    >
        🔔 Notify Me
    </button>
`;

        fixtureGrid.appendChild(
            fixtureCard
        );

    });

    const playersGrid =
        document.createElement("div");

    playersGrid.className =
        "players-grid";

    dashboard.appendChild(playersGrid);

    sortedPlayers.forEach(player => {

        const card =
            document.createElement("div");

        card.className =
            "player-card";

        const nextFixture =
            nextFixtureByTeam[
                player.national_team_id
            ];

        let nextMatchHTML =
            "<p>No upcoming match</p>";

        if (nextFixture) {

            const matchDate =
                new Date(
                    nextFixture.event_date
                );

            nextMatchHTML = `
                <p>
                    <strong>
                        ${nextFixture.home_team}
                    </strong>

                    vs

                    <strong>
                        ${nextFixture.away_team}
                    </strong>
                </p>

                <p>
                    📅
                    ${matchDate.toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "short"
                        }
                    )}
                </p>
            `;

        }

        card.innerHTML = `
            <h3>
                ${FLAGS[player.nationality] || "🌍"}
                ${player.name}
            </h3>

            <p>
                ${player.specific_position}
                •
                ${player.nationality}
            </p>

            ${nextMatchHTML}
        `;

        playersGrid.appendChild(card);

    });

}

function getWorldCupPlayers(players) {

    return players.filter(
        player => player.national_team_id !== null
    );

}

async function getUpcomingFixtures(teamId) {

    try {

        const response = await fetch(
            `${BASE_URL}/events/?team_id=${teamId}`,
            { headers }
        );

        const data = await response.json();

        return data.results.filter(
            event => event.status === "notstarted"
        );

    }
    catch (error) {

        console.error(error);

        return [];

    }

}

async function getRecentFixtures(teamId) {

    try {

        const response = await fetch(
            `${BASE_URL}/events/?team_id=${teamId}`,
            { headers }
        );

        const data = await response.json();

        return data.results.filter(
            event => event.status === "finished"
        );

    }
    catch(error){

        console.error(error);

        return [];

    }

}

const searchInput =
    document.getElementById("clubSearch");

if(searchInput){

searchInput.addEventListener("input", e => {

    const search =
        e.target.value.toLowerCase();

    const cards =
        document.querySelectorAll(".club-card");

    cards.forEach(card => {

        const clubName =
            card.innerText.toLowerCase();

        card.style.display =
            clubName.includes(search)
            ? "block"
            : "none";

    });

});
}

function saveNotification(
    fixtureId,
    homeTeam,
    awayTeam,
    matchDate
){

    const notifications =
        JSON.parse(
            localStorage.getItem(
                "notifications"
            ) || "[]"
        );

    notifications.push({
        fixtureId,
        homeTeam,
        awayTeam,
        matchDate
    });

    localStorage.setItem(
        "notifications",
        JSON.stringify(
            notifications
        )
    );

    alert(
        "Notification saved!"
    );

}