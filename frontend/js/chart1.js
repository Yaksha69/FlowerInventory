document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch sales data from backend
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

    // Process data for chart
    const flowerSales = salesData.reduce((acc, sale) => {
      acc[sale.Product] = (acc[sale.Product] || 0) + sale.QuantitySold;
      return acc;
    }, {});

    const labels = Object.keys(flowerSales); // Flower names
    const dataValues = Object.values(flowerSales); // Units sold

    // Chart data
    const data = {
      labels: labels,
      datasets: [{
        label: 'Units Sold',
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
        // Set the border color to pink
        borderColor: [
          'rgb(255, 105, 180)', // Pink border color for each item
          'rgb(255, 105, 180)',
          'rgb(255, 105, 180)',
          'rgb(255, 105, 180)',
          'rgb(255, 105, 180)',
          'rgb(255, 105, 180)',
          'rgb(255, 105, 180)'
        ],
        borderWidth: 1
      }]
    };

    // Chart configuration
    const config = {
      type: 'bar',
      data: data,
      options: {
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
    console.error('Error fetching sales data for chart:', error);
  }
});
