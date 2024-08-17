document.addEventListener('DOMContentLoaded', function() {
    const productOptions = [
        { value: 'Product 1', text: 'Product 1' },
        { value: 'Product 2', text: 'Product 2' },
        { value: 'Product 3', text: 'Product 3' }
    ];

    // Function to create dropdown options
    function createDropdownOptions(selectedProducts) {
        const select = document.createElement('select');
        select.name = 'product[]';
        select.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a product';
        select.appendChild(defaultOption);

        productOptions.forEach(option => {
            if (!selectedProducts.includes(option.value)) {
                const opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.text;
                select.appendChild(opt);
            }
        });

        return select;
    }

    // Add a new product row to the table
    document.getElementById('addProductButton').addEventListener('click', function() {
        const productTable = document.getElementById('productTableBody');

        // Collect currently selected products
        const selectedProducts = Array.from(document.querySelectorAll('select[name="product[]"]'))
            .map(select => select.value)
            .filter(value => value);

        // Create a new row
        const newRow = document.createElement('tr');

        // Insert HTML for new row with a new dropdown menu
        newRow.innerHTML = `
            <td></td>
            <td><input type="number" name="quantity[]" required></td>
            <td><input type="number" name="unitPrice[]" step="0.01" required></td>
            <td><button type="button" class="removeProductButton">Remove</button></td>
        `;

        // Create and insert the dropdown menu
        const dropdown = createDropdownOptions(selectedProducts);
        newRow.cells[0].appendChild(dropdown);

        // Append the new row to the table
        productTable.appendChild(newRow);
    });

    // Handle product row removal
    document.getElementById('productTableBody').addEventListener('click', function(event) {
        if (event.target.classList.contains('removeProductButton')) {
            event.target.closest('tr').remove();
        }
    });

    // Handle form submission
    document.getElementById('invoiceForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form values
        const customerName = document.getElementById('customerName').value;
        const customerAddress = document.getElementById('customerAddress').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        const invoiceDate = document.getElementById('invoiceDate').value;
        const dueDate = document.getElementById('dueDate').value;

        // Collect product data
        const productSelects = document.getElementsByName('product[]');
        const quantities = document.getElementsByName('quantity[]');
        const unitPrices = document.getElementsByName('unitPrice[]');
        const products = [];
        let total = 0;

        for (let i = 0; i < productSelects.length; i++) {
            const productName = productSelects[i].value;
            const quantity = parseFloat(quantities[i].value);
            const unitPrice = parseFloat(unitPrices[i].value);
            const productTotal = quantity * unitPrice;

            if (productName && !isNaN(quantity) && !isNaN(unitPrice)) {
                products.push({
                    productName,
                    quantity,
                    unitPrice
                });

                total += productTotal;
            }
        }

        // Store data in localStorage
        localStorage.setItem('invoiceData', JSON.stringify({
            customerName,
            customerAddress,
            customerEmail,
            customerPhone,
            invoiceNumber,
            invoiceDate,
            dueDate,
            products
        }));

        // Redirect to invoice detail page
        window.location.href = 'invoice-detail.html';
    });

    // Save as PDF functionality
    document.getElementById('savePdfButton').addEventListener('click', function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');  // A4 size in mm

        // Invoice content
        const invoiceElement = document.getElementById('invoiceContainer');
        
        // Use html2canvas to take a screenshot of the invoice and then convert to PDF
        html2canvas(invoiceElement, { scale: 3 }).then(canvas => {  // Increased scale for better resolution
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            const pageHeight = 295; // A4 height in mm
            let position = 0;

            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position -= pageHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            doc.save('invoice.pdf');
        });
    });
});
