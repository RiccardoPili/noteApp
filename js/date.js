const currentDate = new Date();
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

let dateString = currentDate.toLocaleDateString("en-GB", options);

dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
dateString = dateString.replace(/^([^ ]+) /, "$1, ");

document.getElementById("current-date").textContent = dateString;
