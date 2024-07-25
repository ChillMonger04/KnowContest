const toggleButton = document.getElementById(`toggle`);
const sidebar = document.getElementById(`sidebar`);
const mainContent = document.getElementById(`rest`);
const tableContent = document.getElementById(`tableContent`);
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

var selectedHosts;
if (localStorage.getItem("selectedHosts") === null) {
  selectedHosts = [`codechef.com`, `codeforces.com`];
  document.getElementById("btncheck2").checked = true;
  document.getElementById("btncheck1").checked = true;
} else {
  selectedHosts = JSON.parse(localStorage.getItem("selectedHosts"));
  selectedHosts.forEach(function (name) {
    document.getElementsByName(`${name}`)[0].checked = true;
  });
}
var hostsQueryString = `codechef.com%2Ccodeforces.com%2Cgeeksforgeeks.org%2Chackerearth.com%2Cleetcode.com%2Ctopcoder.com%2Catcoder.jp%2Ccodingcompetitions.withgoogle.com`;

var currentDate = new Date();
const currentDateTime =
  currentDate.toISOString().substring(0, 11) +
  currentDate.toISOString().substring(11, 19);

var filterToday = false;
var todayStartTime = new Date();
todayStartTime.setDate(todayStartTime.getDate() - 32);
todayStartTime.setHours(0o0, 0o0, 0o0);

var todayStartDateTime =
  todayStartTime.toISOString().substring(0, 11) +
  todayStartTime.toISOString().substring(11, 19);
var tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const apiUrl = `https://clist.by:443/api/v4/contest/?username=jasjeet04mann&api_key=e5220e81c77c6e0466da36498243d35be58eb346&order_by=start`;

var apiResponseData;

function displayContests() {
  var innerHtml = ``;

  apiResponseData.data.objects.forEach(function (contest) {
    var contestStartTime = new Date(contest.start + `.000Z`);
    var contestEndTime = new Date(contest.end + `.000Z`);
    if (filterToday) {
      if (
        selectedHosts.includes(contest.resource) &&
        contestEndTime > currentDate &&
        contestStartTime < tomorrowDate
      ) {
        const minutes = (parseInt(contest.duration) / 60) % 60;
        const hours = parseInt((parseInt(contest.duration) / 3600) % 24);
        const days = parseInt(parseInt(contest.duration) / 3600 / 24);
        var durationString = ``
        ;
        if (days > 0) {
          durationString += `${days} days `;
        }
        if (hours > 0) {
          durationString += `${hours} hours `;
        }
        if (minutes > 0) {
          durationString += `${minutes} minutes `;
        }
        var startTime = new Date(contest.start + `.000Z`);
        startTime = startTime.toLocaleString("en-US");
        const timeParts = startTime.split(", ");
        const dateParts = timeParts[0].split("/");
        var contestHtml = `
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
							<img class="logo" src="images/${contestLogos.get(
                contest.resource
              )}" alt="codechef">
						</div>
					</a>
					
				`;

        innerHtml += contestHtml;
      }
    } else {
      if (
        selectedHosts.includes(contest.resource) &&
        contestStartTime > currentDate
      ) {
        const minutes = (parseInt(contest.duration) / 60) % 60;
        const hours = parseInt((parseInt(contest.duration) / 3600) % 24);
        const days = parseInt(parseInt(contest.duration) / 3600 / 24);
        var durationString = ``;
        if (days > 0) {
          durationString += `${days} days `;
        }
        if (hours > 0) {
          durationString += `${hours} hours `;
        }
        if (minutes > 0) {
          durationString += `${minutes} minutes `;
        }
        var startTime = new Date(contest.start + `.000Z`);
        startTime = startTime.toLocaleString("en-US");
        const timeParts = startTime.split(", ");
        const dateParts = timeParts[0].split("/");
        var contestHtml = `
					<a class="contest btn btn-lg btn-light mx-4 my-3" href="${
            contest.href
          }" target="_blank">
						<div class="left">
							<span><strong>${contest.event}</strong></span>
							<span>Contest Date: ${dateParts[1]}/${dateParts[0]}/${dateParts[2]}</span>
							<span>Start time: ${timeParts[1]}</span>
							<span>Duration: ${durationString}</span>
						</div>
						<div class="right">
							<img class="logo" src="images/${contestLogos.get(
                contest.resource
              )}" alt="codechef">
						</div>
					</a>
					
				`;

        innerHtml += contestHtml;
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

async function fetchDataFromAPI() {
  //   try {
  //     const response = await fetch(
  //       apiUrl +
  //         `&resource=${hostsQueryString}&end__gt=${currentDateTime}&start__gt=${todayStartDateTime}`
  //     );
  //     const data = await response.json();

  //     return {
  //       data,
  //     };
  //   } catch {
  //     const response = await fetch(
  //       apiUrl +
  //         `&resource=${hostsQueryString}&end__gt=${currentDateTime}&start__gt=${todayStartDateTime}`
  //     );
  //     const data = await response.json();

  //     return {
  //       data,
  //     };
  //   }
  const response = await fetch(
    apiUrl +
      `&resource=${hostsQueryString}&end__gt=${currentDateTime}&start__gt=${todayStartDateTime}`
  );
  const data = await response.json();

  return {
    data,
  };
}

function setupEventListeners() {
  for (var i = 0; i < checkboxElements.length; i++) {
    checkboxElements[i].addEventListener("click", function (e) {
      if (e.target.checked) {
        if (!selectedHosts.includes(e.target.name)) {
          selectedHosts.push(e.target.name);
        }
      } else {
        const index = selectedHosts.indexOf(e.target.name);
        if (index > -1) {
          selectedHosts.splice(index, 1);
        }
      }
      displayContests();
      localStorage.setItem("selectedHosts", JSON.stringify(selectedHosts));
    });
  }

  for (var i = 0; i < radioElements.length; i++) {
    radioElements[i].addEventListener("click", function (e) {
      if (e.target.id === "btncheck9") {
        filterToday = true;
        displayContests();
      } else {
        filterToday = false;
        displayContests();
      }
    });
  }
}

var todayStartTime = new Date();
todayStartTime.setHours(0o0, 0o0, 0o0);

const savedTimeStamp = new Date(localStorage.getItem("timeStamp"));
if (
  localStorage.getItem("contestsData") === null ||
  savedTimeStamp < todayStartTime
) {
  fetchDataFromAPI().then((data) => {
    apiResponseData = data;
    const timeStamp = new Date();
    localStorage.setItem("contestsData", JSON.stringify(data));
    localStorage.setItem("timeStamp", timeStamp);
    displayContests();
    setupEventListeners();
  });
} else {
  setupEventListeners();
  apiResponseData = JSON.parse(localStorage.getItem("contestsData"));
  displayContests();
}
