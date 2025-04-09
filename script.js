
// في دالة constructor
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.productsRef = this.database.ref('products');
        this.visitorsRef = this.database.ref('visitors');
        this.init();
        this.loadProducts();
        this.trackVisitor();
        this.checkAdminStatus(); // إضافة هذا السطر
    }

    // تعديل دالة checkAdminStatus
    checkAdminStatus() {
        const isAdmin = localStorage.getItem('adminPassword') === 'admin123';
        document.getElementById('adminPanel').style.display = isAdmin ? 'block' : 'none';
        document.body.classList.toggle('admin-mode', isAdmin);
    }

    // تعديل دالة loginAsAdmin
    loginAsAdmin() {
        const password = prompt('أدخل كلمة المرور للمسؤول:');
        if (password === 'admin123') {
            localStorage.setItem('adminPassword', password);
            this.checkAdminStatus();
            this.loadProducts();
            alert('تم تسجيل الدخول بنجاح');
            location.reload(); // إعادة تحميل الصفحة
        } else {
            alert('كلمة المرور غير صحيحة');
        }
    }

    // تعديل دالة logoutAdmin
    logoutAdmin() {
        localStorage.removeItem('adminPassword');
        this.checkAdminStatus();
        this.loadProducts();
        alert('تم تسجيل الخروج بنجاح');
        location.reload(); // إعادة تحميل الصفحة
    }