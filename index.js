import * as d3 from "d3";
import * as Papa from "papaparse";

// Load the CSV file and process the data
Papa.parse("./data.csv", {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: function (results) {
    const data = results.data;

    // Group the data by date and count the number of registrations for each date
    const groupedData = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.regs),
      (d) =>
        new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
    );
    // Convert the grouped data to an array of objects with "date" and "registrations" properties
    const formattedData = Array.from(groupedData, ([date, registrations]) => ({
      date: date,
      registrations: registrations,
    }));

    // Define the dimensions and margins for the histogram
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1280 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Define the scales for the x and y axes
    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    // Create the SVG element and set its dimensions
    const svg = d3
      .select("#histogram")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set the domains for the x and y scales
    x.domain(formattedData.map((d) => d.date));
    y.domain([0, d3.max(formattedData, (d) => d.registrations)]);

    // Add the x axis to the SVG element
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add the y axis to the SVG element
    svg.append("g").call(d3.axisLeft(y));

    // Add the bars to the SVG element
    svg
      .selectAll(".bar")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.date))
      .attr("y", (d) => y(d.registrations))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.registrations));
  },
});
