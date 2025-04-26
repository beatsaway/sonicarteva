// Chart initialization and data
let chart;
const data = {
    title: "Song Evaluation",
    metrics: [
        {name: "Structure", value: 3, description: ""},
        {name: "Melodic Ideas & Chords", value: 3, description: ""},
        {name: "Note Expression", value: 3, description: ""},
        {name: "Timbre", value: 3, description: ""},
        {name: "Mix", value: 3, description: ""}
    ]
};

// Update displayed value
function updateValue(index, value) {
    // Ensure value is within range
    value = Math.min(5, Math.max(1, parseInt(value) || 3));
    
    // Update data object
    data.metrics[index-1].value = value;
    
    // Redraw chart
    d3.select("#radar-chart").html("");
    drawRadarChart();
}

// Update metric description
function updateMetricDescription(index, value) {
    data.metrics[index].description = value;
    // No need to redraw the chart for description updates
}

// Function to update metric label text with current value
function updateMetricLabel(index, value) {
    const metricName = data.metrics[index].name;
    const label = document.querySelector(`.metric-label[data-index="${index}"]`);
    if (label) {
        label.textContent = `${metricName} (${value}/5)`;
    }
}

// Make elements draggable
function makeDraggable(label, textarea) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    label.onmousedown = function(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        const newTop = (label.offsetTop - pos2) + "px";
        const newLeft = (label.offsetLeft - pos1) + "px";
        
        label.style.top = newTop;
        label.style.left = newLeft;
        textarea.style.top = (parseInt(newTop) + 25) + "px";
        textarea.style.left = newLeft;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Set up radar chart using D3.js
function drawRadarChart() {
    const width = document.getElementById('radar-chart').clientWidth;
    const height = 400;
    const margin = {top: 50, right: 100, bottom: 50, left: 100};
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    let radius = Math.min(chartWidth, chartHeight) / 2;
    
    // Ensure radius is positive and not too small
    radius = Math.max(radius, 100);
    
    const svg = d3.select("#radar-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);
    
    // Scales
    const angleScale = d3.scaleLinear()
        .domain([0, data.metrics.length])
        .range([0, 2 * Math.PI]);
    
    const radiusScale = d3.scaleLinear()
        .domain([1, 5])
        .range([0, radius]);
    
    // Draw circular grid lines
    const gridCircles = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
    
    gridCircles.forEach(d => {
        svg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", radiusScale(d))
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", d % 1 === 0 ? "4,4" : "2,2");
    });
    
    // Assign different colors to each metric
    const colors = [
        '#FF0000', // Red
        '#0000FF', // Blue
        '#FFA500', // Orange
        '#008080', // Teal
        '#800080'  // Purple
    ];
    
    // Draw axis lines and add labels with textareas
    data.metrics.forEach((d, i) => {
        const angle = angleScale(i);
        const x = radius * Math.sin(angle);
        const y = -radius * Math.cos(angle);
        
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", colors[i])  // Use the metric's color
            .attr("stroke-width", 1.5); // Made slightly thicker for better visibility
        
        // Create and position textarea
        const textarea = document.createElement("textarea");
        textarea.className = "metric-textarea";
        textarea.id = `description${i+1}`;
        textarea.placeholder = "Enter description...";
        
        // Set textarea border color
        textarea.style.borderColor = colors[i];
        
        // Create label for the metric
        const label = document.createElement("div");
        label.className = "metric-label";
        label.textContent = `${d.name} (${d.value}/5)`; // Show value as fraction
        label.style.color = colors[i];
        label.setAttribute('data-index', i); // Add a data attribute to identify the label by index
        
        textarea.oninput = function() {
            updateMetricDescription(i, this.value);
        };

        // Calculate position at the end of each axis
        const textAngle = angleScale(i);
        const textX = radius * Math.sin(textAngle);
        const textY = -radius * Math.cos(textAngle);
        
        // Convert chart coordinates to page coordinates
        const centerX = width/2;
        const centerY = height/2;
        
        // Position the textarea
        let textareaX, textareaY;
        
        if (i === 0) { // Red - align bottom side midpoint
            textareaX = centerX + textX - 100;
            textareaY = centerY + textY - 100;
        } else if (i === 1) { // Blue - align left side midpoint
            textareaX = centerX + textX;
            textareaY = centerY + textY - 50;
        } else if (i === 2) { // Orange - align top left corner
            textareaX = centerX + textX;
            textareaY = centerY + textY;
        } else if (i === 3) { // Teal - align top right corner
            textareaX = centerX + textX - 200;
            textareaY = centerY + textY;
        } else if (i === 4) { // Purple - align right side midpoint
            textareaX = centerX + textX - 200;
            textareaY = centerY + textY - 50;
        }
        
        textarea.style.left = `${textareaX}px`;
        textarea.style.top = `${textareaY}px`;

        // Position label relative to textarea's top-left
        label.style.left = `${textareaX}px`;
        label.style.top = `${textareaY - 20}px`;

        // Add label to document first (to get its dimensions)
        document.getElementById('radar-chart').appendChild(label);

        // Make label draggable and move textarea with it
        makeDraggable(label, textarea);

        // Add textarea to document
        document.getElementById('radar-chart').appendChild(textarea);

        // Create point group for interaction
        const pointGroup = svg.append("g")
            .attr("class", "data-point")
            .attr("data-index", i)
            .style("cursor", "pointer")
            .datum({ label: label });  // Store the label reference in the group's data
        
        // Draw the actual point with the corresponding color
        const point = pointGroup.append("circle")
            .attr("cx", radiusScale(d.value) * Math.sin(angle))
            .attr("cy", -radiusScale(d.value) * Math.cos(angle))
            .attr("r", 6)
            .attr("fill", colors[i]);  // Use the metric's color instead of #4CAF50
        
        // Add drag behavior
        const drag = d3.drag()
            .on("drag", function(event) {
                // Calculate angle and distance from center
                const dx = event.x;
                const dy = event.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const rawValue = (distance / radius) * 4 + 1;
                const newValue = Math.min(5, Math.max(1, Math.round(rawValue * 2) / 2));
                
                // Update data
                data.metrics[i].value = newValue;
                
                // Update point position
                const newX = radiusScale(newValue) * Math.sin(angle);
                const newY = -radiusScale(newValue) * Math.cos(angle);
                point.attr("cx", newX).attr("cy", newY);
                
                // Update the label with the new value
                updateMetricLabel(i, newValue);
                
                // Update polygon points
                const newPoints = data.metrics.map((metric, idx) => {
                    const metricAngle = angleScale(idx);
                    const metricX = radiusScale(metric.value) * Math.sin(metricAngle);
                    const metricY = -radiusScale(metric.value) * Math.cos(metricAngle);
                    return [metricX, metricY];
                });
                
                // Update polygon
                polygon.attr("points", newPoints.map(p => p.join(",")).join(" "));
            })
            .on("end", function() {
                // Get the label from the group's data and update it
                const groupLabel = d3.select(this.parentNode).datum().label;
                groupLabel.textContent = `${data.metrics[i].name} (${data.metrics[i].value}/5)`;
            });
        
        point.call(drag);
    });
    
    // Calculate initial polygon points
    const points = data.metrics.map((d, i) => {
        const angle = angleScale(i);
        const x = radiusScale(d.value) * Math.sin(angle);
        const y = -radiusScale(d.value) * Math.cos(angle);
        return [x, y];
    });
    
    // Draw initial polygon
    const polygon = svg.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("fill", "rgba(128, 128, 128, 0.2)")  // Changed to a neutral gray with lower opacity
        .attr("stroke", "#666")  // Changed to a darker gray
        .attr("stroke-width", 1.5);  // Slightly thicker stroke
    
    // Function to update polygon
    function updatePolygon() {
        const newPoints = data.metrics.map((d, i) => {
            const angle = angleScale(i);
            const x = radiusScale(d.value) * Math.sin(angle);
            const y = -radiusScale(d.value) * Math.cos(angle);
            return [x, y];
        });
        polygon.attr("points", newPoints.map(p => p.join(",")).join(" "));
    }
}

// Function to reset positions of metric input areas
function resetPositions() {
    const chart = document.getElementById('radar-chart');
    const width = chart.clientWidth;
    const height = 400;
    const margin = {top: 50, right: 100, bottom: 50, left: 100};
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    let radius = Math.min(chartWidth, chartHeight) / 2;
    
    // Ensure radius is positive and not too small
    radius = Math.max(radius, 100);
    
    const centerX = width/2;
    const centerY = height/2;

    // Reset positions for each metric
    data.metrics.forEach((d, i) => {
        const angle = (i * 2 * Math.PI / data.metrics.length);
        const textX = radius * Math.sin(angle);
        const textY = -radius * Math.cos(angle);
        
        let textareaX, textareaY;
        
        if (i === 0) { // Red - align bottom side midpoint
            textareaX = centerX + textX - 100;
            textareaY = centerY + textY - 100;
        } else if (i === 1) { // Blue - align left side midpoint
            textareaX = centerX + textX;
            textareaY = centerY + textY - 50;
        } else if (i === 2) { // Orange - align top left corner
            textareaX = centerX + textX;
            textareaY = centerY + textY;
        } else if (i === 3) { // Teal - align top right corner
            textareaX = centerX + textX - 200;
            textareaY = centerY + textY;
        } else if (i === 4) { // Purple - align right side midpoint
            textareaX = centerX + textX - 200;
            textareaY = centerY + textY - 50;
        }

        // Find and update the textarea position
        const textarea = document.getElementById(`description${i+1}`);
        if (textarea) {
            textarea.style.left = `${textareaX}px`;
            textarea.style.top = `${textareaY}px`;
        }

        // Find and update the label position
        const label = document.querySelector(`.metric-label[data-index="${i}"]`);
        if (label) {
            label.style.left = `${textareaX}px`;
            label.style.top = `${textareaY - 20}px`;
        }
    });
} 