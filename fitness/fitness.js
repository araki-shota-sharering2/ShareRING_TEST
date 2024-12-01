document.getElementById("fitness-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const destination = document.getElementById("destination").value;
  const distance = parseFloat(document.getElementById("distance").value);
  const activityType = document.getElementById("activity-type").value;

  try {
      const response = await fetch("/calculate_calories", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ destination, distance, activityType }),
      });

      const data = await response.json();

      if (response.ok) {
          document.getElementById("result").innerHTML = `
              <p>Calories Burned: ${data.caloriesBurned} kcal</p>
          `;
      } else {
          document.getElementById("result").innerHTML = `
              <p>Error: ${data.message}</p>
          `;
      }
  } catch (error) {
      document.getElementById("result").innerHTML = `
          <p>Error calculating calories. Please try again later.</p>
      `;
      console.error("Error:", error);
  }
});
