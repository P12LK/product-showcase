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

        // التحقق من حجم الفيديو
        if (videoFile && videoFile.size > 50 * 1024 * 1024) { // 50MB كحد أقصى
            alert('حجم الفيديو كبير جداً. الرجاء اختيار فيديو أصغر (أقل من 50 ميجابايت)');
            return;
        }

        const imageBase64 = await this.convertToBase64(imageFile);
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
        alert('حدث خطأ أثناء إضافة المنتج. الرجاء التأكد من حجم الملفات');
    }
}