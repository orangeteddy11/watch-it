document.addEventListener('DOMContentLoaded', () => {
    const barCtx = document.getElementById('barChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    // Conceptual data for the graphs
    const platformData = [
        {"name": "StreamPulse", "subscribersMillions": 310},
        {"name": "CinemaFlow", "subscribersMillions": 190},
        {"name": "EpicView", "subscribersMillions": 120},
        {"name": "MegaFlix", "subscribersMillions": 75},
        {"name": "QuantumTV", "subscribersMillions": 40},
        {"name": "NovaStream", "subscribersMillions": 25}
    ];

    if (platformData.length > 0) {
        const labels = platformData.map(platform => platform.name);
        const dataValues = platformData.map(platform => platform.subscribersMillions);

        // Bar Chart
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Subscribers (Millions)',
                    data: dataValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Subscribers (Millions)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Conceptual Streaming Platform Subscribers'
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });

        // Pie Chart
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Subscribers (Millions)',
                    data: dataValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Conceptual Subscriber Share by Platform'
                    },
                    legend: {
                        position: 'right', // Place legend on the right
                    }
                }
            }
        });
    } else {
        barCtx.canvas.parentNode.innerHTML = '<p>Could not load chart data.</p>';
        pieCtx.canvas.parentNode.innerHTML = '';
    }
});