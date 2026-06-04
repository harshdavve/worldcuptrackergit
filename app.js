const API_KEY = "23615b1dd3f116903097016e2d81dd5076e629ba";

const BASE_URL = "https://sports.bzzoiro.com/api/v2";

const headers = {
    Authorization:`Token ${API_KEY}`
};

const FLAGS = {
    England:"🇬🇧",
    France:"🇫🇷",
    Brazil:"🇧🇷",
    Spain:"🇪🇸",
    Germany:"🇩🇪",
    Netherlands:"🇳🇱",
    Belgium:"🇧🇪"
};

renderClubs();

function renderClubs(){

    const grid = document.getElementById("clubGrid");

    CLUBS.forEach(club=>{

        const card = document.createElement("div");

        card.className="club-card";

        card.innerHTML=`
            <h3>${club.name}</h3>
        `;

        card.onclick=()=>{
            loadClub(club);
        };

        grid.appendChild(card);

    });

}

async function loadClub(club){

    const dashboard = document.getElementById("dashboard");

    dashboard.innerHTML = `
        <h2>Loading ${club.name}...</h2>
    `;

    try{

        const response = await fetch(
            `${BASE_URL}/players/?team_id=${club.teamId}`,
            { headers }
        );

        const data = await response.json();

       console.log(data.results);

        displayPlayers(club, data.results || []);

    }
    catch(error){

        console.log(error);

    }

}

function displayPlayers(club,players){

    const dashboard = document.getElementById("dashboard");

    dashboard.innerHTML = `
        <h2>${club.name} World Cup Tracker</h2>
    `;

    const worldCupPlayers = getWorldCupPlayers(players);

dashboard.innerHTML += `
    <h3>
        World Cup Players:
        ${worldCupPlayers.length}
    </h3>
`;

const playersGrid = document.createElement("div");
playersGrid.className = "players-grid";

dashboard.appendChild(playersGrid);

worldCupPlayers.forEach(player => {

        const card = document.createElement("div");

        card.className="player-card";

        const age = player.date_of_birth
    ? new Date().getFullYear() - new Date(player.date_of_birth).getFullYear()
    : "N/A";

const marketValue = player.market_value_eur
    ? `€${(player.market_value_eur / 1000000).toFixed(1)}m`
    : "Unknown";

card.innerHTML = `
    <h3>${player.name}</h3>

    <p><strong>Position:</strong> ${player.specific_position}</p>

    <p>
    <strong>Nationality:</strong>
    ${FLAGS[player.nationality] || "🌍"}
    ${player.nationality}
</p>

    <p><strong>Age:</strong> ${age}</p>

    <p><strong>Market Value:</strong> ${marketValue}</p>

    <p><strong>Status:</strong> ${player.availability}</p>
`;

        playersGrid.appendChild(card);

    });

}

async function getTeams(){

    const response = await fetch(
        `${BASE_URL}/teams/?search=Arsenal`,
        {headers}
    );

    const data = await response.json();

    console.log(JSON.stringify(data,null,2));

}

getTeams();

function getWorldCupPlayers(players){

    return players.filter(player =>
        player.national_team_id !== null
    );

}

const nations =
[
 ...new Set(
   worldCupPlayers.map(p => p.nationality)
 )
].length;

const totalValue =
worldCupPlayers.reduce(
  (sum,p) =>
    sum + (p.market_value_eur || 0),
  0
);


