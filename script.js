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
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.storage = firebase.storage();
        this.productsRef = this.database.ref('products');
        this.visitorsRef = this.database.ref('visitors');
        this.init();
        this.loadProducts();
        this.trackVisitor();
    }

    init() {
        document.getElementById('addProduct').addEventListener('click', () => this.addProduct());
    }

    async trackVisitor() {
        const today = new Date().toISOString().split('T')[0];
        const visitorRef = this.visitorsRef.child(today);
        
        const snapshot = await visitorRef.once('value');
        const currentCount = snapshot.val() || 0;
        
        await visitorRef.set(currentCount + 1);
        
        this.visitorsRef.child(today).on('value', (snapshot) => {
            const count = snapshot.val() || 0;
            document.getElementById('visitorCount').textContent = count;
        });
    }

    async addProduct() {
        try {
            const url = document.getElementById('productUrl').value;
            const imageFile = document.getElementById('productImage').files[0];
            const videoFile = document.getElementById('productVideo').files[0];
            const description = document.getElementById('productDescription').value;

            if (!url || !imageFile || !description) {
                alert('الرجاء ملء جميع الحقول المطلوبة');
                return;
            }

            const imageBase64 = await this.convertToBase64(imageFile);
            let videoUrl = '';

            if (videoFile) {
                const videoRef = this.storage.ref('videos/' + Date.now() + '_' + videoFile.name);
                await videoRef.put(videoFile);
                videoUrl = await videoRef.getDownloadURL();
            }
            
            await this.productsRef.push({
                url: url,
                image: imageBase64,
                video: videoUrl,
                description: description,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            this.clearInputs();
            alert('تم إضافة المنتج بنجاح');
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء إضافة المنتج');
        }
    }

    convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async deleteProduct(key) {
        try {
            const product = await this.productsRef.child(key).once('value');
            const productData = product.val();
            
            if (productData && productData.video) {
                const videoRef = this.storage.refFromURL(productData.video);
                await videoRef.delete();
            }
            
            await this.productsRef.child(key).remove();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('حدث خطأ أثناء حذف المنتج');
        }
    }

    clearInputs() {
        document.getElementById('productUrl').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productVideo').value = '';
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
                            <img src="${product.image}" alt="صورة المنتج" class="product-image">
                        </a>
                        ${product.video ? `<video src="${product.video}" controls class="product-video"></video>` : ''}
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

const productManager = new ProductManager();