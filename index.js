let filterCriteria = {
  username_test: "",
  contestType_test: "",
  selectedProblemIndex_test: "",
};

const API_KEY_test = "yourapi";
const API_SECRET_test = "yourapi";

const MAX_CONTESTS_test = 10;

const contestTypes_test = [
  "Div. 1",
  "Div. 2",
  "Div. 3",
  "Div. 4",
  "Div. 1 + Div. 2",
  "Educational",
  "CodeTON",
  "Global",
  "Kotlin",
  "VK Cup",
  "Long Rounds",
  "April Fools",
  "Team Contests",
  "ICPC Scoring",
];

function generateSignature_test(params_test) {
  const queryString_test = new URLSearchParams(params_test).toString();
  const toSign_test = API_SECRET_test + queryString_test + API_KEY_test;
  return md5(toSign_test);
}

async function getContests_test(contestType_test) {
  const url_test = "https://codeforces.com/api/contest.list";
  const params_test = { key: API_KEY_test };

  const signature_test = generateSignature_test(params_test);

  try {
    const response_test = await fetch(
      `${url_test}?${new URLSearchParams({
        ...params_test,
        sig: signature_test,
      })}`
    );
    const data_test = await response_test.json();

    if (data_test.status === "OK") {
      return data_test.result.filter((contest_test) => {
        const isDiv1_test =
          contestType_test === "Div. 1" &&
          contest_test.name.includes("Div. 1") &&
          !contest_test.name.includes("Div. 2");
        const isDiv2_test =
          contestType_test === "Div. 2" &&
          contest_test.name.includes("Div. 2") &&
          !contest_test.name.includes("Div. 1");

        return (
          contest_test.phase === "FINISHED" &&
          contest_test.type === "CF" &&
          (isDiv1_test || isDiv2_test)
        );
      });
    } else {
      console.error("Error in API response:", data_test.comment);
      return [];
    }
  } catch (error_test) {
    console.error("Error fetching contest data:", error_test);
    return [];
  }
}

async function getProblemsFromContest_test(contestId_test) {
  const url_test = "https://codeforces.com/api/contest.standings";
  const params_test = {
    contestId: contestId_test,
    key: API_KEY_test,
  };

  const signature_test = generateSignature_test(params_test);

  try {
    const response_test = await fetch(
      `${url_test}?${new URLSearchParams({
        ...params_test,
        sig: signature_test,
      })}`
    );
    const data_test = await response_test.json();

    if (data_test.status === "OK") {
      return data_test.result.problems.map((problem_test) => ({
        contestId: problem_test.contestId,
        index: problem_test.index,
        name: problem_test.name,
      }));
    } else {
      console.error(
        `Error fetching problems for contest ${contestId_test}:`,
        data_test.comment
      );
      return [];
    }
  } catch (error_test) {
    console.error(
      `Error fetching problems for contest ${contestId_test}:`,
      error_test
    );
    return [];
  }
}

async function getSolvedProblems_test(username_test) {
  const url_test = "https://codeforces.com/api/user.status";
  const params_test = {
    handle: username_test,
    key: API_KEY_test,
  };

  const signature_test = generateSignature_test(params_test);

  try {
    const response_test = await fetch(
      `${url_test}?${new URLSearchParams({
        ...params_test,
        sig: signature_test,
      })}`
    );
    const data_test = await response_test.json();

    if (data_test.status === "OK") {
      const solvedProblems_test = new Set(
        data_test.result
          .filter((submission_test) => submission_test.verdict === "OK")
          .map(
            (submission_test) =>
              `${submission_test.problem.contestId}/${submission_test.problem.index}`
          )
      );
      console.log(
        `Found ${solvedProblems_test.size} solved problems for user ${username_test}`
      );
      return solvedProblems_test;
    } else {
      console.error(
        `Error fetching solved problems for user ${username_test}:`,
        data_test.comment
      );
      return new Set();
    }
  } catch (error_test) {
    console.error(
      `Error fetching solved problems for user ${username_test}:`,
      error_test
    );
    return new Set();
  }
}

async function checkIfUserExists_test(username_test) {
  const url_test = `https://codeforces.com/api/user.info?handles=${username_test}`;
  try {
    const response_test = await fetch(url_test);
    const data_test = await response_test.json();
    return data_test.status === "OK";
  } catch (error_test) {
    console.error(`Error checking if user exists: ${error_test}`);
    return false;
  }
}

async function filterProblems_test(filterCriteria_test) {
  const { username_test, contestType_test, selectedProblemIndex_test } =
    filterCriteria_test;

  const userExists_test = await checkIfUserExists_test(username_test);
  if (!userExists_test) {
    console.log("The provided username does not exist. Please try again.");
    return;
  }

  const solvedProblems_test = await getSolvedProblems_test(username_test);

  const contests_test = await getContests_test(contestType_test);
  if (contests_test.length === 0) {
    console.log("No contests found for the selected type.");
    return;
  }

  contests_test.sort(
    (a_test, b_test) => b_test.startTimeSeconds - a_test.startTimeSeconds
  );

  const limitedContests_test = contests_test.slice(0, MAX_CONTESTS_test);
  console.log(
    `Found ${limitedContests_test.length} finished contests of type ${contestType_test}.`
  );

  const allProblems_test = [];
  for (let contest_test of limitedContests_test) {
    console.log(
      `Fetching problems for contest: ${contest_test.name} (ID: ${contest_test.id})`
    );
    const problems_test = await getProblemsFromContest_test(contest_test.id);

    if (problems_test.length === 0) {
      console.log(`No problems found for contest ${contest_test.name}.`);
      continue;
    }

    const filteredProblems_test = problems_test.filter(
      (problem_test) => problem_test.index === selectedProblemIndex_test
    );

    allProblems_test.push(
      ...filteredProblems_test.map((problem_test) => ({
        contestName: contest_test.name,
        problemName: problem_test.name,
        problemLink: `https://codeforces.com/problemset/problem/${problem_test.contestId}/${problem_test.index}`,
        contestId: contest_test.id,
        index: problem_test.index,
      }))
    );
  }

  if (allProblems_test.length === 0) {
    console.log(`No problems found for index ${selectedProblemIndex_test}.`);
    return;
  }

  const filteredSolvedProblems_test = Array.from(solvedProblems_test)
    .filter((problem_test) => {
      const [contestId_test, index_test] = problem_test.split("/");
      return (
        limitedContests_test.some(
          (contest_test) => contest_test.id === parseInt(contestId_test)
        ) && index_test === selectedProblemIndex_test
      );
    })
    .map((problem_test) => {
      const [contestId_test, index_test] = problem_test.split("/");
      return {
        contestName: allProblems_test.find(
          (p_test) =>
            p_test.contestId === parseInt(contestId_test) &&
            p_test.index === index_test
        ).contestName,
        problemName: allProblems_test.find(
          (p_test) =>
            p_test.contestId === parseInt(contestId_test) &&
            p_test.index === index_test
        ).problemName,
        problemLink: allProblems_test.find(
          (p_test) =>
            p_test.contestId === parseInt(contestId_test) &&
            p_test.index === index_test
        ).problemLink,
        contestId: parseInt(contestId_test),
        index: index_test,
      };
    });

  const filteredUnsolvedProblems_test = allProblems_test.filter(
    (problem_test) =>
      !filteredSolvedProblems_test.some(
        (solved_test) =>
          solved_test.contestId === problem_test.contestId &&
          solved_test.index === problem_test.index
      )
  );

  const finalResult_test = {
    unsolvedProblems_test: filteredUnsolvedProblems_test,
    solvedProblems_test: filteredSolvedProblems_test,
  };

  return finalResult_test;
}

const filterCriteria_test = {
  username_test: "XwatermelonX",
  contestType_test: "Div. 2",
  selectedProblemIndex_test: "A",
};

function toggleProblemView() {
  const selectedValue = document.getElementById("problem-selector").value;

  document.getElementById("unsolved-section").style.display = "none";
  document.getElementById("solved-section").style.display = "none";
  document.getElementById("hold-section").style.display = "none";

  if (selectedValue === "unsolved") {
    document.getElementById("unsolved-section").style.display = "block";
  } else if (selectedValue === "solved") {
    document.getElementById("solved-section").style.display = "block";
  } else if (selectedValue === "hold") {
    document.getElementById("hold-section").style.display = "block";
  }
}

async function loadProblems() {
  try {
    const savedSolved =
      JSON.parse(localStorage.getItem("solvedProblems")) || [];
    const savedUnsolved =
      JSON.parse(localStorage.getItem("unsolvedProblems")) || [];
    const savedHold = JSON.parse(localStorage.getItem("holdProblems")) || [];

    console.log("Saved Solved Problems:", savedSolved);
    console.log("Saved Unsolved Problems:", savedUnsolved);
    console.log("Saved Hold Problems:", savedHold);

    if (
      savedSolved.length === 0 &&
      savedUnsolved.length === 0 &&
      savedHold.length === 0
    ) {
      const response = await fetch("FilteredProblemSet.json");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Fetched JSON Data:", data);

      window.solvedProblems = data.solvedProblems || [];
      window.unsolvedProblems = data.unsolvedProblems || [];
      window.holdProblems = data.holdProblems || [];
    } else {
      window.solvedProblems = savedSolved;
      window.unsolvedProblems = savedUnsolved;
      window.holdProblems = savedHold;
    }

    renderProblems(
      window.unsolvedProblems,
      window.solvedProblems,
      window.holdProblems
    );
    toggleProblemView();
  } catch (error) {
    console.error("Error loading problems:", error);
  }
}

function renderProblems(unsolved, solved, hold) {
  const unsolvedList = document.getElementById("unsolved-problem-list");
  const solvedList = document.getElementById("solved-problem-list");
  const holdList = document.getElementById("hold-problem-list");

  unsolvedList.innerHTML = "";
  solvedList.innerHTML = "";
  holdList.innerHTML = "";

  unsolved.forEach((problem) => {
    const row = createProblemRow(problem, false, false);
    unsolvedList.appendChild(row);
  });

  solved.forEach((problem) => {
    const row = createProblemRow(problem, true, false);
    solvedList.appendChild(row);
  });

  hold.forEach((problem) => {
    const row = createProblemRow(problem, false, true);
    holdList.appendChild(row);
  });
}

function createProblemRow(problem, isSolved, isHold) {
  const row = document.createElement("tr");

  const statusCell = document.createElement("td");
  const checkboxWrapper = document.createElement("div");
  const checkbox = document.createElement("input");

  checkbox.type = "checkbox";
  checkbox.checked = isSolved;

  if (isSolved) {
    checkbox.disabled = true;

    checkboxWrapper.classList.add("checkbox-wrapper");
    checkbox.style.display = "none";

    const checkboxImage = document.createElement("div");
    checkboxImage.classList.add("custom-checkbox");
    checkboxImage.style.backgroundImage = "url('check.png')";
    checkboxImage.style.backgroundSize = "contain";
    checkboxImage.style.width = "20px";
    checkboxImage.style.height = "20px";
    checkboxImage.style.cursor = "not-allowed";

    checkboxWrapper.appendChild(checkboxImage);
    statusCell.appendChild(checkboxWrapper);
  } else if (isHold) {
    checkboxWrapper.appendChild(checkbox);
    statusCell.appendChild(checkboxWrapper);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        moveProblemToUnsolved(problem);
      }
    });
  } else {
    checkboxWrapper.appendChild(checkbox);
    statusCell.appendChild(checkboxWrapper);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        moveProblemToHold(problem);
      } else {
        moveProblemToUnsolved(problem);
      }
    });
  }

  if (isSolved) {
    row.classList.add("status-solved");
  } else if (isHold) {
    row.classList.add("status-hold");
  } else {
    row.classList.add("status-unsolved");
  }

  const nameCell = document.createElement("td");
  nameCell.textContent = problem.problemName;

  const linkCell = document.createElement("td");
  const link = document.createElement("a");
  link.href = problem.problemLink;
  link.target = "_blank";
  link.textContent = "Link";
  linkCell.appendChild(link);

  const contestCell = document.createElement("td");
  contestCell.textContent = problem.contestName;

  row.appendChild(statusCell);
  row.appendChild(nameCell);
  row.appendChild(linkCell);
  row.appendChild(contestCell);

  return row;
}

function moveProblemToHold(problem) {
  window.unsolvedProblems = window.unsolvedProblems.filter(
    (p) => p.problemName !== problem.problemName
  );
  window.holdProblems.push(problem);
  renderProblems(
    window.unsolvedProblems,
    window.solvedProblems,
    window.holdProblems
  );
  saveData();
}

function moveProblemToUnsolved(problem) {
  window.holdProblems = window.holdProblems.filter(
    (p) => p.problemName !== problem.problemName
  );
  window.unsolvedProblems.push(problem);
  renderProblems(
    window.unsolvedProblems,
    window.solvedProblems,
    window.holdProblems
  );
  saveData();
}

function saveData() {
  localStorage.setItem("solvedProblems", JSON.stringify(window.solvedProblems));
  localStorage.setItem(
    "unsolvedProblems",
    JSON.stringify(window.unsolvedProblems)
  );
  localStorage.setItem("holdProblems", JSON.stringify(window.holdProblems));
}

function filterProblems() {
  const query = document.getElementById("input-box").value.toLowerCase();

  const filteredUnsolved = window.unsolvedProblems.filter(
    (problem) =>
      problem.problemName.toLowerCase().includes(query) ||
      problem.contestName.toLowerCase().includes(query)
  );

  const filteredSolved = window.solvedProblems.filter(
    (problem) =>
      problem.problemName.toLowerCase().includes(query) ||
      problem.contestName.toLowerCase().includes(query)
  );

  const filteredHold = window.holdProblems.filter(
    (problem) =>
      problem.problemName.toLowerCase().includes(query) ||
      problem.contestName.toLowerCase().includes(query)
  );

  renderProblems(filteredUnsolved, filteredSolved, filteredHold);
}

document.getElementById("find-button").addEventListener("click", function () {
  localStorage.removeItem("unsolvedProblems");
  localStorage.removeItem("solvedProblems");
  localStorage.removeItem("holdProblems");

  const codeforcesId = document.getElementById("cf-id-input").value;
  const contestType = document.getElementById("contest-type-dropdown").value;
  const problemNumber = document.getElementById(
    "problem-number-dropdown"
  ).value;

  filterCriteria.username_test = codeforcesId;
  filterCriteria.contestType_test = contestType;
  filterCriteria.selectedProblemIndex_test = problemNumber;
  if (!codeforcesId || !contestType || !problemNumber) {
    // If any value is empty, show an alert or message

    // Optionally, you can highlight the empty fields to help the user
    if (!codeforcesId) {
      document.getElementById("cf-id-input").style.borderColor = "red"; // Highlight the input field in red
    }
    if (!contestType) {
      document.getElementById("contest-type-dropdown").style.borderColor =
        "red"; // Highlight the dropdown
    }
    if (!problemNumber) {
      document.getElementById("problem-number-dropdown").style.borderColor =
        "red"; // Highlight the dropdown
    }

    // Stop further execution by returning early
    return;
  }
  console.log("Filter Criteria:", filterCriteria);
  localStorage.setItem("filterCriteria", JSON.stringify(filterCriteria));

  filterProblems_test(filterCriteria).then((result) => {
    console.log("Filtered Result:", result);

    const unsolved = result.unsolvedProblems_test || [];
    const solved = result.solvedProblems_test || [];
    const hold = result.holdProblems || [];
    
    renderProblems(unsolved, solved, hold);
    localStorage.setItem("unsolvedProblems", JSON.stringify(unsolved));
    
    localStorage.setItem("solvedProblems", JSON.stringify(solved));
    localStorage.setItem("holdProblems", JSON.stringify(hold));
    // location.reload();
  });
});

loadProblems();
