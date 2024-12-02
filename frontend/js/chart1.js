document.addEventListener('DOMContentLoaded', async () => {
  const updateClock = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('clock').textContent = `${dateString} - ${timeString}`;
  };

  // Start the clock
  setInterval(updateClock, 1000);

  try {
    // Fetch all sales data from the backend
    const response = await fetch('http://localhost:5500/api/v1/sales/allsales', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const salesData = await response.json();
    console.log('Fetched sales data:', salesData);

    // Validate data format
    if (!Array.isArray(salesData)) {
      throw new Error('Sales data is not an array');
    }

    // Get the current date
    const now = new Date();

    // Calculate the start of the week (Saturday)
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay(); // Get current day (0 = Sunday, ..., 6 = Saturday)
    const daysToSubtract = (dayOfWeek + 1) % 7; // Days to go back to Saturday
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract); // Move to last Saturday
    startOfWeek.setHours(0, 0, 0, 0); // Start of the day

    // Calculate the end of the week (Friday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Friday
    endOfWeek.setHours(23, 59, 59, 999); // End of the day

    console.log('Week starts on:', startOfWeek);
    console.log('Week ends on:', endOfWeek);

    // Filter sales data to include only this week's sales
    const salesThisWeek = salesData.filter(sale => {
      const saleDate = new Date(sale.createdAt); // Adjust based on your data's date field
      return saleDate >= startOfWeek && saleDate <= endOfWeek;
    });

    console.log('Filtered sales data for this week:', salesThisWeek);

    // Process data for the chart
    const flowerSales = salesThisWeek.reduce((acc, sale) => {
      acc[sale.Product] = (acc[sale.Product] || 0) + sale.QuantitySold;
      return acc;
    }, {});

    const labels = Object.keys(flowerSales); // Flower names
    const dataValues = Object.values(flowerSales); // Units sold

    // Chart data
    const data = {
      labels: labels,
      datasets: [{
        label: 'Units Sold This Week',
        data: dataValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 105, 180)', // Pink border color
        ],
        borderWidth: 1
      }]
    };

    // Chart configuration
    const config = {
      type: 'bar',
      data: data,
      options: {
        plugins: {
          title: {
            display: true,
            text: `Sales Data (This Week)`,
            align: 'start',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      },
    };

    // Render the chart
    const myChart = new Chart(
      document.getElementById('myChart'),
      config
    );
  } catch (error) {
    console.error('Error fetching or filtering sales data for chart:', error);
  }
});
