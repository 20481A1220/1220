const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/train/trains", function (req, res) {
  const url = "http://104.211.219.98/train/trains";
  const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODczMzE3MjcsImNvbXBhbnlOYW1lIjoiVHJhaW5zIEluZm8iLCJjbGllbnRJRCI6IjljMGZkNzIyLTNlNWMtNDNkNy1iZWJkLTg3YTU1ZTc5MDAxMyIsIm93bmVyTmFtZSI6IiIsIm93bmVyRW1haWwiOiIiLCJyb2xsTm8iOiIyMDQ4MUExMjE5In0.uN6cWEFe9g7SySIcES9JJmiCwUAWgj15ytAlPUIN1og";
  axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
    .then(function (response) {
      console.log(response.status);
      const trainDetails = response.data;

      if (!Array.isArray(trainDetails)) {
        console.log("Invalid train data format");
        res.send([]);
        return;
      }

      // Filter trains in the next 30 minutes
      const currentTime = new Date();
      const filteredTrains = trainDetails.filter((train) => {
        const departureTime = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          train.departureTime.Hours,
          train.departureTime.Minutes,
          train.departureTime.Seconds
        );
        const adjustedDepartureTime = new Date(departureTime);
        adjustedDepartureTime.setMinutes(
          adjustedDepartureTime.getMinutes() + train.delayedBy
        );
        const timeDifference = adjustedDepartureTime - currentTime;
        const minutesDifference = timeDifference / (1000 * 60); // Convert milliseconds to minutes

        // Ignore trains with departure less than 30 minutes
        return minutesDifference >= 30;
      });

      // Sort trains based on price in ascending order
      const sortedTrains = filteredTrains.sort((a, b) => {
        const priceA = a.price.sleeper + a.price.AC;
        const priceB = b.price.sleeper + b.price.AC;
        return priceA - priceB;
      });

      // Sort trains based on adjusted departure time in descending order
      sortedTrains.sort((a, b) => {
        const departureTimeA = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          a.departureTime.Hours,
          a.departureTime.Minutes,
          a.departureTime.Seconds
        );
        const adjustedDepartureTimeA = new Date(departureTimeA);
        adjustedDepartureTimeA.setMinutes(
          adjustedDepartureTimeA.getMinutes() + a.delayedBy
        );

        const departureTimeB = new Date(
          currentTime.getFullYear(),
          currentTime.getMonth(),
          currentTime.getDate(),
          b.departureTime.Hours,
          b.departureTime.Minutes,
          b.departureTime.Seconds
        );
        const adjustedDepartureTimeB = new Date(departureTimeB);
        adjustedDepartureTimeB.setMinutes(
          adjustedDepartureTimeB.getMinutes() + b.delayedBy
        );

        return adjustedDepartureTimeB - adjustedDepartureTimeA;
      });

      res.json(sortedTrains);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.listen(3433, function () {
  console.log("Hi there!");
});