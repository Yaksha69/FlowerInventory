async function fetchData() {
    try {
        const lowStockResponse = await fetch('http://localhost:5500/api/v1/data/lowstock');
        const lowStockData = await lowStockResponse.json();
        console.log('Low Stock Data:', lowStockData);

        const totalSalesResponse = await fetch('http://localhost:5500/api/v1/sales/total-sales');
        const totalSalesData = await totalSalesResponse.json();
        console.log('Total Sales Data:', totalSalesData);

        const countWeeklySalesResponse = await fetch('http://localhost:5500/api/v1/sales/countWeeklySales');
        const countWeeklySalesData = await countWeeklySalesResponse.json();
        console.log('countWeeklySales:', countWeeklySalesData);

        // Update Sales Card
        const salesCard = document.getElementById('total-sales');
        salesCard.textContent = `₱ ${totalSalesData?.totalSales ?? 'N/A'}`;        

        // Update Low Stock Table (only show items with quantity <= 5, limit to 5 items)
        const lowStockTableBody = document.querySelector('#low-stock-table tbody');
        lowStockTableBody.innerHTML = '';
        
        // Filter low stock products to only show those with quantity <= 5 and limit the display to 5
        const filteredLowStockData = lowStockData.filter(item => item.Quantity <= 5).slice(0, 5);
        
        if (filteredLowStockData.length > 0) {
            filteredLowStockData.forEach(item => {
                const flower = item.Product || 'Unknown';
                const quantity = item.Quantity ?? 'N/A';
                const row = lowStockTableBody.insertRow();
                row.innerHTML = `<td class="text-center">${flower}</td><td class="text-center">${quantity}</td>`;
            });
        } else {
            const row = lowStockTableBody.insertRow();
            row.innerHTML = `<td colspan="2" class="text-center">No low stock products available</td>`;
        }

        // Update Current Week Sales Table
        const countWeeklySalesTableBody = document.querySelector('#highest-selling-table tbody');
        countWeeklySalesTableBody.innerHTML = '';

        if (countWeeklySalesData) {
            const weekStart = new Date(countWeeklySalesData.weekStart).toLocaleDateString();
            const weekEnd = new Date(countWeeklySalesData.weekEnd).toLocaleDateString();
            const totalSales = countWeeklySalesData.totalSales ?? 0;

            const row = countWeeklySalesTableBody.insertRow();
            row.innerHTML = `<td class="text-center">${weekStart} - ${weekEnd}</td><td class="text-center">${totalSales}</td>`;
        } else {
            const row = countWeeklySalesTableBody.insertRow();
            row.innerHTML = `<td colspan="2" class="text-center">No data available</td>`;
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('total-sales').textContent = 'Error loading data';
    }
}

document.addEventListener('DOMContentLoaded', fetchData);
