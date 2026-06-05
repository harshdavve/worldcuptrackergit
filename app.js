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
    Northern Ireland:"🇬🇧",
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


    const fixtures = [];

    for (const teamId of nationalTeamIds) {

        const teamFixtures =
            await getUpcomingFixtures(teamId);

        fixtures.push(...teamFixtures);

    }

    const uniqueFixtures = [
        ...new Map(
            fixtures.map(f => [f.id, f])
        ).values()
    ];

    
    const nextFixtureByTeam = {};

uniqueFixtures.forEach(fixture => {

    const fixtureDate = new Date(fixture.event_date);

    const existing =
        nextFixtureByTeam[fixture.home_team_id];

    if(
        !existing ||
        fixtureDate < new Date(existing.event_date)
    ){
        nextFixtureByTeam[fixture.home_team_id] = fixture;
    }

    const existingAway =
        nextFixtureByTeam[fixture.away_team_id];

    if(
        !existingAway ||
        fixtureDate < new Date(existingAway.event_date)
    ){
        nextFixtureByTeam[fixture.away_team_id] = fixture;
    }

});

    const fixtureCount = uniqueFixtures.length;

    const playerCount = worldCupPlayers.length;

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
                    ${playerCount}
                </div>
                <div class="summary-label">
                    Players
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
                    ${fixtureCount}
                </div>
                <div class="summary-label">
                    Upcoming Fixtures
                </div>
            </div>

        </div>
    `;

    dashboard.innerHTML += `
        <h3>World Cup Players: ${playerCount}</h3>
    `;

    const playersGrid = document.createElement("div");

    playersGrid.className = "players-grid";

    dashboard.appendChild(playersGrid);

    worldCupPlayers.forEach(player => {

        const card = document.createElement("div");

        card.className = "player-card";

        const age = player.date_of_birth
            ? new Date().getFullYear() -
              new Date(player.date_of_birth).getFullYear()
            : "N/A";

        const marketValue = player.market_value_eur
            ? `€${(player.market_value_eur / 1000000).toFixed(1)}m`
            : "Unknown";

            const nextFixture =
    nextFixtureByTeam[player.national_team_id];

let nextMatchHTML = "<p>No upcoming match</p>";

if(nextFixture){

    const matchDate =
        new Date(nextFixture.event_date);

    nextMatchHTML = `
        <p>
            <strong>Next Match:</strong><br>
            ${nextFixture.home_team}
            vs
            ${nextFixture.away_team}
        </p>

        <p>
            ${matchDate.toLocaleDateString()}
        </p>
    `;
}

        card.innerHTML = `
            <h3>${player.name}</h3>

            <p>
                <strong>Position:</strong>
                ${player.specific_position}
            </p>

            <p>
                <strong>Nationality:</strong>
                ${FLAGS[player.nationality] || "🌍"}
                ${player.nationality}
            </p>

            <p>
                <strong>Age:</strong>
                ${age}
            </p>

            <p>
                <strong>Market Value:</strong>
                ${marketValue}
            </p>
            ${nextMatchHTML}

            <p>
                <strong>Status:</strong>
                ${player.availability}
            </p>
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