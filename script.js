class ProductManager {
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.productsRef = this.database.ref('products');
        this.statsRef = this.database.ref('stats');
        this.init();
        this.loadProducts();
        this.initStats();
    }

    initStats() {
        this.statsRef.on('value', (snapshot) => {
            const stats = snapshot.val() || { totalViews: 0, totalProducts: 0 };
            document.getElementById('totalViews').textContent = stats.totalViews;
            document.getElementById('totalProducts').textContent = stats.totalProducts;
        });
    }

    async addProduct() {
        try {
            const url = document.getElementById('productUrl').value;
            const imageFile = document.getElementById('productImage').files[0];
            const videoUrl = document.getElementById('productVideo').value;
            const description = document.getElementById('productDescription').value;

            if (!url || !imageFile || !description) {
                alert('الرجاء ملء جميع الحقول المطلوبة');
                return;
            }

            const imageBase64 = await this.convertImageToBase64(imageFile);
            
            await this.productsRef.push({
                url: url,
                image: imageBase64,
                video: videoUrl,
                description: description,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            // تحديث الإحصائيات
            const statsSnapshot = await this.statsRef.get();
            const stats = statsSnapshot.val() || { totalViews: 0, totalProducts: 0 };
            await this.statsRef.set({
                ...stats,
                totalProducts: stats.totalProducts + 1
            });

            this.clearInputs();
            alert('تم إضافة المنتج بنجاح');
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء إضافة المنتج');
        }
    }

    // ... باقي الكود بدون تغيير ...

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
                            <img src="${product.image}" alt="صورة المنتج" class="product-image">
                        </a>
                        ${product.video ? `<iframe src="${product.video}" frameborder="0" allowfullscreen class="product-video"></iframe>` : ''}
                        <div class="product-info">
                            <p class="product-description">${product.description}</p>
                            <button class="delete-btn" onclick="productManager.deleteProduct('${product.key}')">
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