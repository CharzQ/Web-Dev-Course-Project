let all_times = []
let all_productivity = []

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function updateStudyChart(data) {
    console.log("Data received by D3:", data);

    d3.select("#chart-container").selectAll("*").remove();

    if (!data || data.length === 0) {
        return;
    }

    const svg = d3.select("#chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
        .domain(data.map(d => d.subject))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.duration)])
        .nice()
        .range([height, 0]);


    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.subject))
        .attr("y", d => y(Number(d.duration)))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(Number(d.duration)))
        .attr("fill", "#7f56d9");

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));
    
    svg.append("g")
        .call(d3.axisLeft(y));

}


function updateLineChart(data) {
    d3.select("#line-chart-container").selectAll("*").remove();

    if (!data || data.length === 0) {
        return;
    }

    const formattedData = data.map(d => ({
        date: new Date(d.date),
        value: +d.duration
    })).sort((a, b) => a.date - b.date);

    // data[0] gives the array for the actual data passed through
    console.log(data[0]['date']);
    var date = data[0]['date'];

    var svg = d3.select("#line-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

   
    var y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.value)])
      .nice()
      .range([height, 0]);
      
    svg.append("g")
        .call(d3.axisLeft(y));


    svg.append("path")
      .datum(formattedData)
      .attr("fill", "none")
      .attr("stroke", "#7f56d9")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
    );
}

function updatePieChart(data) {
    d3.select("#pie-chart-container").selectAll("*").remove();
    if (!data || data.length === 0) {
        return;
    }

    const rolledUp = d3.rollup(data,
        v => d3.sum(v, d => +d.duration),
        d => d.subject
    );

    const pieData = Array.from(rolledUp, ([name, value]) => ({name, value}));

    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#pie-chart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);

        const color = d3.scaleOrdinal(d3.schemePurples[9]);
        const pie = d3.pie().value(d => d.value);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        svg.selectAll('slices')
            .data(pie(pieData))
            .enter()
            .append("path")
            .attr('d', arc)
            .attr("fill", d => color(d.data.name))
            .attr("stroke", "white")
            .style("stroke-width", "2px");

        svg.selectAll("labels")
            .data(pie(pieData))
            .enter()
            .append("text")
            .text(d => d.data.name)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "white");
}