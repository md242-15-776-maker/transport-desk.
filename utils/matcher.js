const GOING_TIMES = ["07:00", "08:30", "10:00", "12:00"];
const COMING_TIMES = ["11:15", "13:30", "16:20", "18:10"];

function format12h(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function createSlot(t) {
  return {
    display: format12h(t),
    raw: t,
    count: 0,
    Clg: 0,
    SR: 0,
    KP: 0
  };
}

function calculateDemand(students, day, systemFilter) {
  const goingSlots = GOING_TIMES.map(createSlot);
  const comingSlots = COMING_TIMES.map(createSlot);
  let unmatchedCount = 0;

  for (const student of students) {
    if (systemFilter !== "both" && student.semesterSystem !== systemFilter) continue;
    const dayRoutine = student.routine && student.routine[day];
    if (!dayRoutine) continue;

    const station = student.station || "Collegate";
    const stationKey = station === "Station Road" ? "SR" : (station === "Kamarpara" ? "KP" : "Clg");

    // Going bus
    if (dayRoutine.first) {
      const idx = GOING_TIMES.indexOf(dayRoutine.first);
      if (idx !== -1) {
        goingSlots[idx].count++;
        goingSlots[idx][stationKey] = (goingSlots[idx][stationKey] || 0) + 1;
      } else {
        unmatchedCount++;
      }
    }

    // Coming bus
    if (dayRoutine.last) {
      const idx = COMING_TIMES.indexOf(dayRoutine.last);
      if (idx !== -1) {
        comingSlots[idx].count++;
        comingSlots[idx][stationKey] = (comingSlots[idx][stationKey] || 0) + 1;
      } else {
        unmatchedCount++;
      }
    }
  }

  return { going: goingSlots, coming: comingSlots, unmatchedCount };
}

module.exports = { calculateDemand };