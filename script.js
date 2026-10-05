const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");

const teamCounts = {
  water: document.getElementById("waterCount"),
  zero: document.getElementById("zeroCount"),
  power: document.getElementById("powerCount"),
};

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

const attendanceStorageKey = "intelSummitAttendance";
let totalAttendees = 0;
let attendees = [];

function updateAttendanceDisplay() {
  attendeeCount.textContent = totalAttendees;
  progressBar.style.width = `${(totalAttendees / 50) * 100}%`;
}

function saveAttendance() {
  const attendanceData = {
    total: totalAttendees,
    teams: {},
    attendees: attendees,
  };

  for (const team in teamCounts) {
    attendanceData.teams[team] = Number(teamCounts[team].textContent);
  }

  localStorage.setItem(attendanceStorageKey, JSON.stringify(attendanceData));
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  for (const attendee of attendees) {
    const attendeeItem = document.createElement("li");
    const name = document.createElement("span");
    const team = document.createElement("span");

    name.textContent = attendee.name;
    team.textContent = teamNames[attendee.team];
    team.className = "attendee-team";

    attendeeItem.appendChild(name);
    attendeeItem.appendChild(team);
    attendeeList.appendChild(attendeeItem);
  }
}

function createConfetti() {
  const colors = ["#0071c5", "#00aeef", "#f9c74f", "#43aa8b", "#f94144"];
  const oldConfetti = document.querySelectorAll(".confetti");

  for (const piece of oldConfetti) {
    piece.remove();
  }

  for (let count = 0; count < 60; count += 1) {
    const piece = document.createElement("span");
    const size = Math.floor(Math.random() * 8) + 7;

    piece.className = "confetti";
    piece.style.left = `${Math.floor(Math.random() * 100)}%`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.5}px`;
    piece.style.backgroundColor = colors[count % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.animationDuration = `${Math.floor(Math.random() * 2) + 3}s`;

    document.body.appendChild(piece);
    setTimeout(function () {
      piece.remove();
    }, 4500);
  }
}

function showCelebration() {
  greeting.textContent = `Celebration time! ${getWinningTeam()} wins the attendance challenge!`;
  greeting.className = "celebration-message";
  greeting.style.display = "block";
  createConfetti();
}

function loadAttendance() {
  const savedAttendance = localStorage.getItem(attendanceStorageKey);

  if (savedAttendance === null) {
    return;
  }

  const attendanceData = JSON.parse(savedAttendance);

  if (
    !Number.isInteger(attendanceData.total) ||
    attendanceData.total < 0 ||
    attendanceData.total > 50
  ) {
    return;
  }

  totalAttendees = attendanceData.total;

  for (const team in teamCounts) {
    if (attendanceData.teams && Number.isInteger(attendanceData.teams[team])) {
      teamCounts[team].textContent = attendanceData.teams[team];
    }
  }

  if (Array.isArray(attendanceData.attendees)) {
    attendees = attendanceData.attendees.filter(function (attendee) {
      return (
        typeof attendee.name === "string" &&
        typeof attendee.team === "string" &&
        teamNames[attendee.team]
      );
    });
  }

  updateAttendanceDisplay();
  renderAttendeeList();

  if (totalAttendees === 50) {
    showCelebration();
  }
}

function getWinningTeam() {
  let winningTeam = "water";

  for (const team in teamCounts) {
    if (
      Number(teamCounts[team].textContent) >
      Number(teamCounts[winningTeam].textContent)
    ) {
      winningTeam = team;
    }
  }

  return teamNames[winningTeam];
}

function checkInAttendee(event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value;

  if (name === "" || team === "") {
    return;
  }

  if (totalAttendees >= 50) {
    greeting.textContent = "Check-in is full. Thank you for your interest!";
    greeting.className = "success-message";
    greeting.style.display = "block";
    return;
  }

  totalAttendees += 1;
  teamCounts[team].textContent = Number(teamCounts[team].textContent) + 1;
  attendees.push({ name: name, team: team });
  updateAttendanceDisplay();
  renderAttendeeList();
  saveAttendance();

  greeting.textContent = `Welcome, ${name}! Thanks for checking in to the Team Sustainability Summit.`;
  greeting.className = "success-message";

  if (totalAttendees === 50) {
    showCelebration();
  }

  greeting.style.display = "block";

  checkInForm.reset();
  attendeeNameInput.focus();
}

loadAttendance();
renderAttendeeList();
checkInForm.addEventListener("submit", checkInAttendee);
