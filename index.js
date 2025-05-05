function renderList(list) {
  const tbody = document.getElementById("problem-list");
  tbody.innerHTML = "";
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="4">No problems found.</td></tr>';
  } else {
    list.forEach((p, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${p.name}</td>
            <td><a href="https://codeforces.com/contest/${
              p.contestId
            }/problem/${p.index}" target="_blank">View</a></td>
            <td>${p.contestName}</td>
          `;
      tbody.appendChild(tr);
    });
  }
}

document.getElementById("view-select").addEventListener("change", () => {
  const view = document.getElementById("view-select").value;
  document.getElementById("table-title").textContent =
    view === "solved" ? "Solved Problems" : "Unsolved Problems";

  const key = view === "solved" ? "cfSolved" : "cfUnsolved";
  const saved = localStorage.getItem(key);
  renderList(saved ? JSON.parse(saved) : []);
});

document.getElementById("find-btn").addEventListener("click", async () => {
  const cfId = document.getElementById("cf-id").value.trim();
  let view = document.getElementById("view-select").value;
  const contestType = document.getElementById("contest-type").value;
  const problemLetter = document.getElementById("problem-letter").value;
  const loadingEl = document.getElementById("loading");

  if (!cfId) view = "unsolved";
  document.getElementById("view-select").value = view;
  document.getElementById("table-title").textContent =
    view === "solved" ? "Solved Problems" : "Unsolved Problems";

  loadingEl.style.display = "block";

  try {
    const solvedSet = new Set();
    if (cfId) {
      const res = await fetch(
        `https://codeforces.com/api/user.status?handle=${cfId}`
      );
      const data = await res.json();
      if (data.status === "OK") {
        data.result.forEach((sub) => {
          if (sub.verdict === "OK")
            solvedSet.add(`${sub.problem.contestId}_${sub.problem.index}`);
        });
      }
    }

    const contestRes = await fetch("https://codeforces.com/api/contest.list");
    const contestData = await contestRes.json();
    const contestMap = {};
    const recentIds = [];
    if (contestData.status === "OK") {
      contestData.result
        .filter((c) => c.phase === "FINISHED")
        .sort((a, b) => b.id - a.id)
        .slice(0, 30)
        .forEach((c) => {
          recentIds.push(c.id);
          contestMap[c.id] = c.name;
        });
    }

    const probRes = await fetch(
      "https://codeforces.com/api/problemset.problems"
    );
    const probData = await probRes.json();
    const base =
      probData.status === "OK"
        ? probData.result.problems.filter(
            (p) => recentIds.includes(p.contestId) && /^[A-Z]$/.test(p.index)
          )
        : [];

    const solvedList = [];
    const unsolvedList = [];
    base.forEach((p) => {
      const keyId = `${p.contestId}_${p.index}`;
      const rec = { ...p, contestName: contestMap[p.contestId] };
      const typeMatch = contestType
        ? rec.contestName.includes(contestType)
        : true;
      const letterMatch = problemLetter ? rec.index === problemLetter : true;
      if (!typeMatch || !letterMatch) return;
      if (solvedSet.has(keyId)) solvedList.push(rec);
      else unsolvedList.push(rec);
    });

    localStorage.setItem("cfSolved", JSON.stringify(solvedList));
    localStorage.setItem("cfUnsolved", JSON.stringify(unsolvedList));

    renderList(view === "solved" ? solvedList : unsolvedList);
  } catch (e) {
    console.error(e);
    alert("Error fetching data");
  } finally {
    loadingEl.style.display = "none";
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("cfUnsolved");
  if (saved) renderList(JSON.parse(saved));
});
