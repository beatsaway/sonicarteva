// Initialize chart
let chart;

// Default data
let data = {
    title: "Song Evaluation",
    metrics: [
        {name: "Song Structure", value: 3, description: ""},
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

// Gather input data and update chart
function updateChart() {
    const title = document.getElementById('projectTitle').value || "Item Evaluation";
    
    // Update data object
    data.title = title;
    
    // Only update the title, don't redraw the entire chart
    d3.select("#radar-chart svg text#chart-title")
        .text(title);
}

// Update metric description
function updateMetricDescription(index, value) {
    data.metrics[index].description = value;
    // No need to redraw the chart for description updates
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
    const radius = Math.min(chartWidth, chartHeight) / 2;
    
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
        
        // Add labels for grid circles
        if (d % 1 === 0) { // Only show labels for whole numbers
            svg.append("text")
                .attr("x", 5)
                .attr("y", -radiusScale(d))
                .attr("font-size", "10px")
                .attr("fill", "#666")
                .text(d);
        }
    });
    
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
            .attr("stroke", "#999")
            .attr("stroke-width", 1);
        
        // Create and position textarea
        const textarea = document.createElement("textarea");
        textarea.className = "metric-textarea";
        textarea.id = `description${i+1}`;
        textarea.placeholder = "Enter description...";
        
        // Assign different colors to each metric
        const colors = [
            '#FF0000', // Red
            '#0000FF', // Blue
            '#FFA500', // Orange
            '#008080', // Teal
            '#800080'  // Purple
        ];
        textarea.style.borderColor = colors[i];
        
        // Create label for the metric
        const label = document.createElement("div");
        label.className = "metric-label";
        label.textContent = d.name;
        label.style.color = colors[i];
        
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
        } else if (i === 1) { // Teal - align left side midpoint
            textareaX = centerX + textX;
            textareaY = centerY + textY - 50;
        } else if (i === 2) { // Blue - align top left corner
            textareaX = centerX + textX;
            textareaY = centerY + textY;
        } else if (i === 3) { // Green - align top right corner
            textareaX = centerX + textX - 200;
            textareaY = centerY + textY;
        } else if (i === 4) { // Yellow - align right side midpoint
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
    });
    
    // Calculate polygon points
    const points = data.metrics.map((d, i) => {
        const angle = angleScale(i);
        const x = radiusScale(d.value) * Math.sin(angle);
        const y = -radiusScale(d.value) * Math.cos(angle);
        return [x, y];
    });
    
    // Draw value points with drag functionality
    data.metrics.forEach((d, i) => {
        const angle = angleScale(i);
        const x = radiusScale(d.value) * Math.sin(angle);
        const y = -radiusScale(d.value) * Math.cos(angle);
        
        // Create point group for interaction
        const pointGroup = svg.append("g")
            .attr("class", "data-point")
            .attr("data-index", i)
            .style("cursor", "pointer");
        
        // Draw the actual point
        const point = pointGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 6)
            .attr("fill", "#4CAF50");
        
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
                
                // Redraw polygon
                updatePolygon();
            });
        
        point.call(drag);
    });
    
    // Draw initial polygon
    const polygon = svg.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("fill", "rgba(76, 175, 80, 0.5)")
        .attr("stroke", "#4CAF50")
        .attr("stroke-width", 2);
    
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

// Initial chart draw
window.onload = function() {
    // Draw initial chart
    drawRadarChart();

    // Add spacebar event listener
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            const textareas = document.querySelectorAll('.metric-textarea');
            const chartContainer = document.querySelector('.chart-container');
            const chartRect = chartContainer.getBoundingClientRect();
            
            textareas.forEach((textarea, index) => {
                const rect = textarea.getBoundingClientRect();
                console.log(`Metric ${index + 1} position:`, {
                    absolute: {
                        left: rect.left,
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom
                    },
                    relativeToChart: {
                        left: rect.left - chartRect.left,
                        top: rect.top - chartRect.top,
                        right: rect.right - chartRect.left,
                        bottom: rect.bottom - chartRect.top
                    }
                });
            });
        }
    });
};

// Responsive resize
window.addEventListener('resize', function() {
    if (chart) {
        d3.select("#radar-chart").html("");
        drawRadarChart();
    }
});

// Save current state to JSON
function saveState() {
    const state = {
        projectInfo: {
            title: document.getElementById('projectTitle').value,
            artist: document.getElementById('artistName').value,
            audience: document.getElementById('targetAudience').value,
            context: document.getElementById('context').value,
            objective: document.getElementById('objective').value
        },
        metrics: data.metrics,
        textareaPositions: Array.from(document.querySelectorAll('.metric-textarea')).map(textarea => ({
            left: textarea.style.left,
            top: textarea.style.top
        }))
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-state.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Load state from JSON file
function loadState() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const state = JSON.parse(e.target.result);
                
                // Load project info
                document.getElementById('projectTitle').value = state.projectInfo.title;
                document.getElementById('artistName').value = state.projectInfo.artist;
                document.getElementById('targetAudience').value = state.projectInfo.audience;
                document.getElementById('context').value = state.projectInfo.context;
                document.getElementById('objective').value = state.projectInfo.objective;
                
                // Load metrics data
                data.metrics = state.metrics;
                
                // Redraw chart
                d3.select("#radar-chart").html("");
                drawRadarChart();
                
                // Restore textarea positions after chart is drawn
                setTimeout(() => {
                    const textareas = document.querySelectorAll('.metric-textarea');
                    state.textareaPositions.forEach((pos, i) => {
                        if (textareas[i]) {
                            textareas[i].style.left = pos.left;
                            textareas[i].style.top = pos.top;
                            // Also update the label position
                            const label = textareas[i].previousElementSibling;
                            if (label && label.classList.contains('metric-label')) {
                                label.style.left = pos.left;
                                label.style.top = `${parseInt(pos.top) - 20}px`;
                            }
                        }
                    });
                }, 100);
            } catch (error) {
                alert('Error loading state: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}
