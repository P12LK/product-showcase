// ... في دالة addProduct ...
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

            // التحقق من حجم الملفات
            if (imageFile.size > 2 * 1024 * 1024) { // 2MB للصورة
                alert('حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر (أقل من 2 ميجابايت)');
                return;
            }

            if (videoFile && videoFile.size > 10 * 1024 * 1024) { // 10MB للفيديو
                alert('حجم الفيديو كبير جداً. الرجاء اختيار فيديو أصغر (أقل من 10 ميجابايت)');
                return;
            }

            // ضغط الصورة قبل التحويل
            const compressedImage = await this.compressImage(imageFile);
            const imageBase64 = await this.convertToBase64(compressedImage);
            
            let videoBase64 = '';
            if (videoFile) {
                videoBase64 = await this.convertToBase64(videoFile);
            }
            
            await this.productsRef.push({
                url: url,
                image: imageBase64,
                video: videoBase64,
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

    // إضافة دالة لضغط الصور
    async compressImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // تقليل حجم الصورة إذا كانت كبيرة
                    if (width > 800) {
                        height = Math.round((height * 800) / width);
                        width = 800;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(resolve, 'image/jpeg', 0.7);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }