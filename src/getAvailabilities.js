import moment from "moment";
import knex from "knexClient";

export default async function getAvailabilities(date, numberOfDays = 7) {
  const availabilities = new Map();
  for (let i = 0; i < numberOfDays; ++i) {
    const tmpDate = moment(date).add(i, "days");
    const day = tmpDate.format("d");
    let dayAvailabilities = availabilities.get(day);
    dayAvailabilities?dayAvailabilities.push({
      date: tmpDate.toDate(),
      slots: []
    }):
    availabilities.set(day, [{
      date: tmpDate.toDate(),
      slots: []
    }]);
  }

  const queryEndDate = moment(date).add(numberOfDays, "days");
  const events = await knex
  .select("kind", "starts_at", "ends_at", "weekly_recurring")
  .from("events")
  .where(function() {
    this.where("weekly_recurring", true).andWhere("starts_at", "<=", +queryEndDate);
  })
  .orWhere(function() {
    this.where("ends_at", ">=", +date).orWhere("starts_at", "<=", +queryEndDate);
  })
  .orderBy('kind', 'desc');

  for (const event of events) {
    for (
      let date = moment(event.starts_at);
      date.isBefore(event.ends_at);
      date.add(30, "minutes")
    ) {
      const day = availabilities.get(date.format("d"));
      if (event.kind === "opening") {
        handleOpenings(event, day);
      } else if (event.kind === "appointment") {
        handleAppointments(event, day);
      }
    }
  }

  return Array.from(availabilities.values())
}

function handleOpenings(event, day){
  if(event.weekly_recurring){
    const usefulDates = day.filter(dayDate => moment(dayDate.date) >= date)
    usefulDates.forEach(dayDate => dayDate.slots.push(date.format("H:mm")))
  } else {
    const usefulDate = day.filter(dayDate => moment(dayDate.date) === date);
    if(usefulDate){
      usefulDate.slots.push(date.format("H:mm"))
    }           
  }
}

function handleAppointments(event, day){
  if(event.weekly_recurring){
    const usefulDates = day.filter(dayDate => compareDateGreater(dayDate.date, date));
    usefulDates.forEach(dayDate => dayDate.slots = dayDate.slots.filter(
      slot => slot.indexOf(date.format("H:mm")) === -1
    ))
  } else {
    const usefulDate = day.filter(dayDate => 
      compareDateEquality(dayDate.date, date.toDate()))[0];
    if(usefulDate){
      usefulDate.slots = usefulDate.slots.filter(
        slot => slot.indexOf(date.format("H:mm")) === -1
      );
    }           
  }
}

function compareDateEquality(d1, d2) {
  if(typeof(d1) === typeof(d2)){
    return d1.getDate() === d2.getDate() 
    && d1.getMonth() === d2.getMonth() 
    && d1.getYear() === d2.getYear()
  }
  return false;
}

function compareDateGreater(d1, d2) {
  if(typeof(d1) === typeof(d2)){
    return d1.getDate() >= d2.getDate() 
    || d1.getMonth() >= d2.getMonth() 
    || d1.getYear() >= d2.getYear()
  }
  return false;
}
