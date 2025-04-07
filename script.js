class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.init();
    }

    init() {
        this.renderProducts();
        document.getElementById('addProduct').addEventListener('click', () => this.addProduct());
    }

    async addProduct() {
        const url = document.getElementById('productUrl').value;
        const imageFile = document.getElementById('productImage').files[0];
        const description = document.getElementById('productDescription').value;

        if (!url || !imageFile || !description) {
            alert('الرجاء ملء جميع الحقول');
            return;
        }

        try {
            const imageBase64 = await this.convertImageToBase64(imageFile);
            
            const product = {
                id: Date.now(),
                url,
                image: imageBase64,
                description
            };

            this.products.push(product);
            this.saveProducts();
            this.renderProducts();
            this.clearInputs();
        } catch (error) {
            console.error('Error adding product:', error);
        }
    }

    convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    deleteProduct(id) {
        this.products = this.products.filter(product => product.id !== id);
        this.saveProducts();
        this.renderProducts();
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    clearInputs() {
        document.getElementById('productUrl').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productDescription').value = '';
    }

    renderProducts() {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';

        this.products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <a href="${product.url}" target="_blank">
                    <img src="${product.image}" alt="صورة المنتج" class="product-image">
                </a>
                <div class="product-info">
                    <p class="product-description">${product.description}</p>
                    <button class="delete-btn" onclick="productManager.deleteProduct(${product.id})">
                        حذف المنتج
                    </button>
                </div>
            `;
            container.appendChild(productElement);
        });
    }
}

const productManager = new ProductManager();