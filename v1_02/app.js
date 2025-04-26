// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initial chart draw
    drawRadarChart();
    
    // Add event listeners for project info updates
    const projectInputs = document.querySelectorAll('.info-input input, .info-input textarea');
    projectInputs.forEach(input => {
        input.addEventListener('input', updateChart);
    });
    
    // Add window resize handler
    window.addEventListener('resize', function() {
        d3.select("#radar-chart").html("");
        drawRadarChart();
    });
    
    // Add keyboard event listener for spacebar
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            const textareas = document.querySelectorAll('.metric-textarea');
            textareas.forEach(textarea => {
                console.log(`Textarea ${textarea.id} position:`, {
                    top: textarea.style.top,
                    left: textarea.style.left
                });
            });
        }
    });
});

// Update chart when project info changes
function updateChart() {
    // Get project info values
    const projectTitle = document.getElementById('projectTitle').value;
    const artistName = document.getElementById('artistName').value;
    const targetAudience = document.getElementById('targetAudience').value;
    const context = document.getElementById('context').value;
    const objective = document.getElementById('objective').value;
    
    // Update data object
    data.title = projectTitle || "Song Evaluation";
    
    // Redraw chart
    d3.select("#radar-chart").html("");
    drawRadarChart();
}

// Save current state to JSON file
function saveState() {
    const state = {
        projectInfo: {
            title: document.getElementById('projectTitle').value,
            artist: document.getElementById('artistName').value,
            audience: document.getElementById('targetAudience').value,
            context: document.getElementById('context').value,
            objective: document.getElementById('objective').value
        },
        metrics: data.metrics
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'song_evaluation_state.json';
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
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const state = JSON.parse(e.target.result);
                    
                    // Update project info
                    document.getElementById('projectTitle').value = state.projectInfo.title;
                    document.getElementById('artistName').value = state.projectInfo.artist;
                    document.getElementById('targetAudience').value = state.projectInfo.audience;
                    document.getElementById('context').value = state.projectInfo.context;
                    document.getElementById('objective').value = state.projectInfo.objective;
                    
                    // Update metrics data
                    data.metrics = state.metrics;
                    
                    // Update chart
                    d3.select("#radar-chart").html("");
                    drawRadarChart();
                    
                    // Update textarea values
                    state.metrics.forEach((metric, index) => {
                        const textarea = document.getElementById(`description${index + 1}`);
                        if (textarea) {
                            textarea.value = metric.description;
                        }
                    });
                } catch (error) {
                    console.error('Error loading state:', error);
                    alert('Error loading state file. Please make sure it is a valid JSON file.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
} 