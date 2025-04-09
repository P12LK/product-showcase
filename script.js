// في دالة loadProducts
    loadProducts() {
        const isAdmin = localStorage.getItem('adminPassword') === 'admin123';
        
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
                    
                    // تحقق من صلاحيات المسؤول قبل إضافة زر الحذف
                    const deleteButton = isAdmin ? 
                        `<button class="delete-btn" onclick="productManager.deleteProduct('${product.key}')">حذف المنتج</button>` : 
                        '';
                    
                    productElement.innerHTML = `
                        <a href="${product.url}" target="_blank" class="product-link">
                            <img src="${product.image}" alt="صورة المنتج" class="product-image">
                        </a>
                        <div class="product-info">
                            <p class="product-description">${product.description}</p>
                            ${deleteButton}
                        </div>
                    `;
                    container.appendChild(productElement);
                });
            }
        });
    }

    // تعديل دالة deleteProduct
    async deleteProduct(key) {
        const isAdmin = localStorage.getItem('adminPassword') === 'admin123';
        if (!isAdmin) {
            alert('عذراً، فقط المسؤول يمكنه حذف المنتجات');
            return;
        }
        
        try {
            await this.productsRef.child(key).remove();
            alert('تم حذف المنتج بنجاح');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('حدث خطأ أثناء حذف المنتج');
        }
    }