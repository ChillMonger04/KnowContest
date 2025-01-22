const toggleButton = document.getElementById("toggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("rest");
const tableContent = document.getElementById("tableContent");
const checkboxElements = document.querySelectorAll("input[type='checkbox']");
const radioElements = document.querySelectorAll("input[type='radio']");

const contestLogos = new Map();
contestLogos.set("codechef.com", "codechef.png");
contestLogos.set("codeforces.com", "codeforces.svg");
contestLogos.set("atcoder.jp", "atcoder.png");
contestLogos.set("geeksforgeeks.org", "GeeksforGeeks.svg");
contestLogos.set("codingcompetitions.withgoogle.com", "google.png");
contestLogos.set("hackerearth.com", "HackerEarth_logo.png");
contestLogos.set("leetcode.com", "leetcode.png");
contestLogos.set("topcoder.com", "topcoder.png");

toggleButton.addEventListener("click", function (e) {
  if (sidebar.classList.contains("inactive")) {
    sidebar.classList.remove("inactive");
    mainContent.classList.add("whenBarActive");
    mainContent.classList.remove("whenBarInActive");
  } else {
    sidebar.classList.add("inactive");
    mainContent.classList.remove("whenBarActive");
    mainContent.classList.add("whenBarInActive");
  }
});

// The encoded list of all possible hosts
const hostsQueryString = `codechef.com%2Ccodeforces.com%2Cgeeksforgeeks.org%2Chackerearth.com%2Cleetcode.com%2Ctopcoder.com%2Catcoder.jp%2Ccodingcompetitions.withgoogle.com`;

const allHosts = decodeURIComponent(hostsQueryString).split(",");

let selectedHosts;
// If localStorage doesn't have "selectedHosts", default to codechef, codeforces, leetcode
if (localStorage.getItem("selectedHosts") === null) {
  selectedHosts = ["codechef.com", "codeforces.com", "leetcode.com"];
  // Mark them checked by default (assuming the HTML has those checkboxes)
  document.getElementsByName("codechef.com")[0].checked = true;
  document.getElementsByName("codeforces.com")[0].checked = true;
} else {
  // Otherwise load from localStorage
  selectedHosts = JSON.parse(localStorage.getItem("selectedHosts")) || [];
  // Mark the existing selected ones as checked
  selectedHosts.forEach(function (name) {
    const cb = document.getElementsByName(name)[0];
    if (cb) {
      cb.checked = true;
    }
  });
}

// Set up date/time logic
const currentDate = new Date();
const currentDateTime =
  currentDate.toISOString().substring(0, 11) +
  currentDate.toISOString().substring(11, 19);

let filterToday = false;

let todayStartTime = new Date();
todayStartTime.setDate(todayStartTime.getDate() - 32);
todayStartTime.setHours(0, 0, 0);

let todayStartDateTime =
  todayStartTime.toISOString().substring(0, 11) +
  todayStartTime.toISOString().substring(11, 19);

let tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);

const apiUrl = `https://clist.by:443/api/v4/contest/?username=jasjeet04mann&api_key=e5220e81c77c6e0466da36498243d35be58eb346&format=json&order_by=start`;

let apiResponseData;

// Displays the contests based on filterToday + selectedHosts
function displayContests() {
  let innerHtml = ``;

  apiResponseData.objects.forEach(function (contest) {
    const contestStartTime = new Date(contest.start + `.000Z`);
    const contestEndTime = new Date(contest.end + `.000Z`);

    if (filterToday) {
      // "Today" means it ends after now AND starts before tomorrow
      if (contestEndTime > currentDate && contestStartTime < tomorrowDate) {
        // Still show only if user wants that host
        if (!selectedHosts.includes(contest.resource)) return;

        innerHtml += buildContestHtml(contest);
      }
    } else {
      // "Upcoming" means startTime > now
      if (contestStartTime > currentDate) {
        // Still show only if user wants that host
        if (!selectedHosts.includes(contest.resource)) return;

        innerHtml += buildContestHtml(contest);
      }
    }
  });

  tableContent.innerHTML = innerHtml;
  if (innerHtml === ``) {
    tableContent.innerHTML = `
  <p id="load2">Nothing left in our stack</p>
  <p id="load3">Try again, or come back!</p>
`;
  }
  toggleButton.disabled = false;
}

function buildContestHtml(contest) {
  const minutes = (parseInt(contest.duration) / 60) % 60;
  const hours = parseInt((parseInt(contest.duration) / 3600) % 24);
  const days = parseInt(parseInt(contest.duration) / 3600 / 24);

  let durationString = ``;
  if (days > 0) durationString += `${days} days `;
  if (hours > 0) durationString += `${hours} hours `;
  if (minutes > 0) durationString += `${minutes} minutes `;

  let startTime = new Date(contest.start + `.000Z`);
  startTime = startTime.toLocaleString("en-US");
  const timeParts = startTime.split(", ");
  const dateParts = timeParts[0].split("/");

  return `
<a class="contest btn btn-lg btn-light mx-4 my-3" href="${
    contest.href
  }" target="_blank">
  <div class="left">
    <span><strong>${contest.event}</strong></span>
    <span>Contest Date: ${dateParts[1]}/${dateParts[0]}/${dateParts[2]}</span>
    <span>Start Time: ${timeParts[1]}</span>
    <span>Duration: ${durationString}</span>
  </div>
  <div class="right">
    <img class="logo" src="images/${
      contestLogos.get(contest.resource) || "default.png"
    }" alt="${contest.resource}">
  </div>
</a>
`;
}

// Fetch data from the API with date filters
async function fetchDataFromAPI() {
  const response = await fetch(
    apiUrl + `&end__gt=${currentDateTime}&start__gt=${todayStartDateTime}`
  );
  const data = await response.json();
  return data;
}

function setupEventListeners() {
  // For each checkbox, if user checks it => add to selectedHosts
  // if user unchecks => remove from selectedHosts
  checkboxElements.forEach((elem) => {
    elem.addEventListener("click", function (e) {
      const hostName = e.target.name;
      if (e.target.checked) {
        if (!selectedHosts.includes(hostName)) {
          selectedHosts.push(hostName);
        }
      } else {
        const index = selectedHosts.indexOf(hostName);
        if (index > -1) {
          selectedHosts.splice(index, 1);
        }
      }
      localStorage.setItem("selectedHosts", JSON.stringify(selectedHosts));
      displayContests();
    });
  });

  // Radio buttons for "today" or "upcoming"
  radioElements.forEach((elem) => {
    elem.addEventListener("click", function (e) {
      if (e.target.id === "btncheck9") {
        filterToday = true;
      } else {
        filterToday = false;
      }
      displayContests();
    });
  });

  // By default, we might mark the "upcoming" radio as checked
  // or do nothing if you want no default radio chosen
  document.getElementById("btncheck10").checked = true; // let's default to upcoming
}

// Force fresh fetch for demo
fetchDataFromAPI().then((data) => {
  apiResponseData = data;
  const timeStamp = new Date();
  localStorage.setItem("contestsData", JSON.stringify(data));
  localStorage.setItem("timeStamp", timeStamp);

  displayContests();
  setupEventListeners();
});
