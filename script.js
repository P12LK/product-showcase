const firebaseConfig = {
    apiKey: "AIzaSyBCIjcNPlUVDjFY27XqlkVOEdBCNpwbznc",
    authDomain: "product-showcase-3c038.firebaseapp.com",
    databaseURL: "https://product-showcase-3c038-default-rtdb.firebaseio.com",
    projectId: "product-showcase-3c038",
    storageBucket: "product-showcase-3c038.appspot.com",
    messagingSenderId: "916469503161",
    appId: "1:916469503161:web:e44412c3f844d1b00c7768",
    measurementId: "G-QQEH2G25NV"
};

class ProductManager {
    constructor() {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.database = firebase.database();
        this.storage = firebase.storage();
        this.productsRef = this.database.ref('products');
        this.init();
        this.loadProducts();
    }

    init() {
        document.getElementById('addProduct').addEventListener('click', () => this.addProduct());
    }

    async addProduct() {
        try {
            const url = document.getElementById('productUrl').value;
            const imageFile = document.getElementById('productImage').files[0];
            const description = document.getElementById('productDescription').value;

            if (!url || !imageFile || !description) {
                alert('الرجاء ملء جميع الحقول');
                return;
            }

            const timestamp = Date.now();
            const storageRef = this.storage.ref();
            const imageRef = storageRef.child(`products/${timestamp}_${imageFile.name}`);
            const snapshot = await imageRef.put(imageFile);
            const imageUrl = await snapshot.ref.getDownloadURL();

            await this.productsRef.push({
                url: url,
                imageUrl: imageUrl,
                description: description,
                timestamp: timestamp
            });

            this.clearInputs();
            alert('تم إضافة المنتج بنجاح');
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء إضافة المنتج');
        }
    }

    async deleteProduct(key, imageUrl) {
        try {
            await this.productsRef.child(key).remove();
            if (imageUrl) {
                const imageRef = this.storage.refFromURL(imageUrl);
                await imageRef.delete();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('حدث خطأ أثناء حذف المنتج');
        }
    }

    clearInputs() {
        document.getElementById('productUrl').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productDescription').value = '';
    }

    loadProducts() {
        this.productsRef.on('value', (snapshot) => {
            const container = document.getElementById('productsContainer');
            container.innerHTML = '';
            
            if (snapshot.exists()) {
                const products = [];
                snapshot.forEach((child) => {
                    products.push({ key: child.key, ...child.val() });
                });
                
                products.sort((a, b) => b.timestamp - a.timestamp);
                
                products.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.className = 'product-card';
                    productElement.innerHTML = `
                        <a href="${product.url}" target="_blank">
                            <img src="${product.imageUrl}" alt="صورة المنتج" class="product-image">
                        </a>
                        <div class="product-info">
                            <p class="product-description">${product.description}</p>
                            <button class="delete-btn" onclick="productManager.deleteProduct('${product.key}', '${product.imageUrl}')">
                                حذف المنتج
                            </button>
                        </div>
                    `;
                    container.appendChild(productElement);
                });
            }
        });
    }
}

const productManager = new ProductManager();