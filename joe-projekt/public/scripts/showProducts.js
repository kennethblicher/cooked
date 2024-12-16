async function showProducts() {
    try {
        const response = await fetch("/showProducts");
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const productList = document.getElementById("product-list");
        productList.innerHTML = ""; // Clear existing content

        data.products.forEach((product) => {
            // Create a container for each product
            const productDiv = document.createElement("div");
            productDiv.className = "product";

            // Create an image element
            const img = document.createElement("img");
            img.src = product.image;
            img.alt = product.name;
            img.style.width = "200px";

            // Create a name element
            const name = document.createElement("h3");
            name.textContent = product.name;

            // Create a price element
            const price = document.createElement("p");
            price.textContent = `Price: $${product.price}`;

            // Create a button element with a class for styling
            const button = document.createElement("button");
            button.textContent = "Buy Now";
            button.className = "buy-button"; // Assign a class
            button.id = product.name // Assign an ID
              button.onclick = () => {
                buyProduct(product.name);
            };

            // Append elements to the product container
            productDiv.appendChild(img);
            productDiv.appendChild(name);
            productDiv.appendChild(price);
            productDiv.appendChild(button);

            // Append the product container to the product list
            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        alert("Failed to load products. Please try again later.");
    }
}

async function buyProduct(productName) {
  try {
    // Create the payload with only the productName
    const payload = {
      productName, // Only productName is included in the payload
    };

    // Send a POST request to the /buyProduct endpoint
    const response = await fetch('/buyProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to confirm purchase');
    }

    // Parse the response
    const data = await response.json();
    alert(`Order confirmed! Thank you for your purchase`);
    console.log('Response:', data);
  } catch (error) {
    // Handle errors
    console.error('Error confirming purchase:', error.message);
    alert(`Error: ${error.message}`);
  }
}
  
document.addEventListener("DOMContentLoaded", showProducts());

// 
