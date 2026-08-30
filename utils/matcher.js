const GOING_TIMES = ["07:00", "08:30", "10:00", "12:00"];
const COMING_TIMES = ["11:30", "13:30", "16:20", "18:10"];

function format12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Fixed: Strictly '<' ensures the student takes the bus departing BEFORE their class starts
function matchGoingBus(firstClassTime) {
  if (!firstClassTime) return null;
  let matched = null;
  for (const time of GOING_TIMES) {
    if (time < firstClassTime) {
      matched = time;
    }
  }
  return matched;
}

// Earliest bus departing at or after their last class ends
function matchComingBus(lastClassTime) {
  if (!lastClassTime) return null;
  for (const time of COMING_TIMES) {
    if (time >= lastClassTime) return time;
  }
  return null;
}

function calculateDemand(students, day, systemFilter) {
  const goingSlots = GOING_TIMES.map(t => ({ display: format12h(t), raw: t, count: 0 }));
  const comingSlots = COMING_TIMES.map(t => ({ display: format12h(t), raw: t, count: 0 }));
  let unmatchedCount = 0;

  for (const student of students) {
    if (systemFilter !== "both" && student.semesterSystem !== systemFilter) continue;
    const dayRoutine = student.routine && student.routine[day];
    if (!dayRoutine) continue;

    const gMatch = matchGoingBus(dayRoutine.first);
    const cMatch = matchComingBus(dayRoutine.last);

    if (gMatch) {
      const idx = GOING_TIMES.indexOf(gMatch);
      if (idx !== -1) goingSlots[idx].count++;
    } else if (dayRoutine.first) {
      unmatchedCount++;
    }

    if (cMatch) {
      const idx = COMING_TIMES.indexOf(cMatch);
      if (idx !== -1) comingSlots[idx].count++;
    } else if (dayRoutine.last) {
      unmatchedCount++;
    }
  }

  return { going: goingSlots, coming: comingSlots, unmatchedCount };
}

module.exports = { calculateDemand };