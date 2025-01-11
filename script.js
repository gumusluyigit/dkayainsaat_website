document.addEventListener("DOMContentLoaded", function() {
    // Her sayfada dropdown menüyü oluştur
    createDropdownMenu();

    // Ürün listesini göster - sadece products.html sayfasında
    if (window.location.pathname.endsWith('products.html')) {
        displayProducts();
    }

    // Handle product clicks
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function(event) {
            event.preventDefault();
            const productId = this.getAttribute('data-id');
            window.location.href = `product-detail.html?id=${productId}`;
        });
    });

    // Handle product detail page
    if (window.location.pathname.endsWith('product-detail.html')) {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        // Get product data
        const product = productsData[productId];
        
        if (product) {
            // Update page content with product data
            document.getElementById('product-name').innerText = product.name;
            document.getElementById('product-description').innerText = product.description;
            
            // Set image source and handle loading
            const productImage = document.getElementById('product-image');
            productImage.src = product.image;
            productImage.alt = product.name;
            
            // Debug: Log image path
            console.log("Loading image from:", product.image);
            
            // Optional: Add error handling for image
            productImage.onerror = function() {
                console.error("Error loading image:", product.image);
                this.src = 'assets/placeholder.jpg'; // Optional: Show a placeholder image
            };

            const productName = document.getElementById('product-name');
            productName.innerText = product.name;
        } else {
            // Handle case where product is not found
            document.querySelector('.product-detail').innerHTML = '<p>Ürün bulunamadı.</p>';
        }
    }

    // Initialize Swiper if it exists on the page
    if (document.querySelector('.swiper')) {
        const swiper = new Swiper('.swiper', {
            slidesPerView: 1, // Show only one slide at a time
            spaceBetween: 30,
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });
    }

    // Ürün listesi oluşturulurken
    function createProductCard(product) {
        return `
            <a href="./product-detail.html?id=${product.id}" class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
            </a>
        `;
    }

    // Ürün görüntülenme sayılarını saklamak için
    function initializeViewCounter() {
        if (!localStorage.getItem('productViews')) {
            localStorage.setItem('productViews', JSON.stringify({}));
        }
    }

    // Görüntülenme sayısını artır
    function incrementProductView(productId) {
        let views = JSON.parse(localStorage.getItem('productViews'));
        views[productId] = (views[productId] || 0) + 1;
        localStorage.setItem('productViews', JSON.stringify(views));
        
        // İsteğe bağlı: Konsola yazdır
        console.log(`Ürün ${productId} görüntülenme sayısı: ${views[productId]}`);
    }

    // Ürün detay sayfasında görüntülenme sayısını takip et
    if (window.location.pathname.endsWith('product-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            initializeViewCounter();
            incrementProductView(productId);
        }
    }

    // En çok görüntülenen ürünleri getir
    function getMostViewedProducts(limit = 5) {
        const views = JSON.parse(localStorage.getItem('productViews') || '{}');
        
        return Object.entries(views)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([productId, viewCount]) => ({
                product: productsData[productId],
                views: viewCount
            }));
    }

    // İsteğe bağlı: Konsola en çok görüntülenen ürünleri yazdır
    function logMostViewedProducts() {
        const mostViewed = getMostViewedProducts();
        console.log('En çok görüntülenen ürünler:');
        mostViewed.forEach((item, index) => {
            console.log(`${index + 1}. ${item.product.name}: ${item.views} görüntülenme`);
        });
    }

    // Ana sayfadaki carousel için en çok görüntülenen ürünleri ayarla
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        // En çok görüntülenen ürünleri al (ilk 8 ürün)
        const mostViewedProducts = getMostViewedProducts(8);
        
        // Eğer yeterli görüntülenme verisi yoksa, varsayılan ürünleri kullan
        const defaultProducts = [
            "dkaya_fullboard_extra",
            "dkaya_fullboard_saten",
            "dkaya_fullboard_power",
            "dkaya_fullboard_turbo",
            "dkaya_perlitli_siva",
            "dkaya_saten",
            "dkaya_kartonpiyer",
            "dkaya_makina_siva"
        ];

        // İlk slide için ürünleri yükle (0-3)
        const firstSlideContainer = document.getElementById('featured-products-1');
        const firstSlideProducts = mostViewedProducts.slice(0, 4);
        
        // Eğer yeterli görüntülenen ürün yoksa, varsayılan ürünlerle tamamla
        if (firstSlideProducts.length < 4) {
            const remainingCount = 4 - firstSlideProducts.length;
            const defaultFirstSlide = defaultProducts.slice(0, remainingCount);
            
            // Önce görüntülenen ürünleri ekle
            firstSlideProducts.forEach(item => {
                const productCard = createProductCard(item.product);
                firstSlideContainer.innerHTML += productCard;
            });
            
            // Kalan boşlukları varsayılan ürünlerle doldur
            defaultFirstSlide.forEach(productId => {
                const product = productsData[productId];
                const productCard = createProductCard(product);
                firstSlideContainer.innerHTML += productCard;
            });
        } else {
            // Sadece en çok görüntülenen ürünleri kullan
            firstSlideProducts.forEach(item => {
                const productCard = createProductCard(item.product);
                firstSlideContainer.innerHTML += productCard;
            });
        }

        // İkinci slide için ürünleri yükle (4-7)
        const secondSlideContainer = document.getElementById('featured-products-2');
        const secondSlideProducts = mostViewedProducts.slice(4, 8);
        
        // Aynı mantıkla ikinci slide'ı doldur
        if (secondSlideProducts.length < 4) {
            const remainingCount = 4 - secondSlideProducts.length;
            const defaultSecondSlide = defaultProducts.slice(4, 4 + remainingCount);
            
            secondSlideProducts.forEach(item => {
                const productCard = createProductCard(item.product);
                secondSlideContainer.innerHTML += productCard;
            });
            
            defaultSecondSlide.forEach(productId => {
                const product = productsData[productId];
                const productCard = createProductCard(product);
                secondSlideContainer.innerHTML += productCard;
            });
        } else {
            secondSlideProducts.forEach(item => {
                const productCard = createProductCard(item.product);
                secondSlideContainer.innerHTML += productCard;
            });
        }

        // Swiper'ı başlat
        const swiper = new Swiper('.swiper', {
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            autoplay: {
                delay: 10000,
                disableOnInteraction: false,
            },
        });
    }

    // Header scroll efekti
    const header = document.querySelector('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {  // Sayfa tepesinden ayrıldığında
            header.classList.add('scrolled');
        } else {  // Sadece sayfa tepesindeyken
            header.classList.remove('scrolled');
        }
    });
});

function createDropdownMenu() {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (!dropdownContent) return;
    
    dropdownContent.innerHTML = ''; // Mevcut içeriği temizle
    
    for (const mainCat in categories) {
        const mainCategory = categories[mainCat];
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        
        const mainCatTitle = document.createElement('h3');
        mainCatTitle.textContent = mainCategory.name;
        categorySection.appendChild(mainCatTitle);
        
        for (const subCatKey in mainCategory.subCategories) {
            const subCat = mainCategory.subCategories[subCatKey];
            const subCatSection = document.createElement('div');
            subCatSection.className = 'subcategory-section';
            
            const subCatTitle = document.createElement('h4');
            subCatTitle.textContent = subCat.name;
            subCatSection.appendChild(subCatTitle);
            
            const productList = document.createElement('ul');
            productList.className = 'product-category-list';
            
            // Alt kategorileri ekle
            for (const prodCatKey in subCat.subCategories) {
                const prodCat = subCat.subCategories[prodCatKey];
                const li = document.createElement('li');
                const a = document.createElement('a');
                const url = `products.html?main=${encodeURIComponent(mainCat)}&parent=${encodeURIComponent(subCatKey)}&category=${encodeURIComponent(prodCatKey)}`;
                a.href = url;
                a.textContent = prodCat.name;
                
                // Update click handler
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = url;
                });
                
                li.appendChild(a);
                productList.appendChild(li);
            }
            
            subCatSection.appendChild(productList);
            categorySection.appendChild(subCatSection);
        }
        
        dropdownContent.appendChild(categorySection);
    }

    // Add hover functionality
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        dropdown.addEventListener('mouseenter', function() {
            const dropdownContent = this.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.style.display = 'block';
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            const dropdownContent = this.querySelector('.dropdown-content');
            if (dropdownContent) {
                dropdownContent.style.display = 'none';
            }
        });
    }
}

function displayProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const mainCategory = urlParams.get('main');
    const parentCategory = urlParams.get('parent');
    const category = urlParams.get('category');

    // Tüm ürün bölümlerini gizle
    const allSections = document.querySelectorAll('.category-section');
    allSections.forEach(section => section.style.display = 'none');

    if (mainCategory && parentCategory && category) {
        // Belirli bir kategori seçilmişse
        const selectedProducts = Object.values(productsData).filter(product => 
            product.mainCategory === mainCategory &&
            product.parentCategory === parentCategory &&
            product.category === category
        );

        // Doğru section ID'sini bul
        const section = document.getElementById(mainCategory);
        
        if (section) {
            section.style.display = 'block';
            const productGrid = section.querySelector('.product-grid');
            if (productGrid) {
                if (selectedProducts.length > 0) {
                    productGrid.innerHTML = selectedProducts.map(createProductCard).join('');
                } else {
                    productGrid.innerHTML = '<p>Bu kategoride ürün bulunamadı.</p>';
                }
            }
        }
    } else {
        // Hiçbir kategori seçilmemişse tüm ürünleri göster
        allSections.forEach(section => {
            section.style.display = 'block';
            const productGrid = section.querySelector('.product-grid');
            if (productGrid) {
                const categoryName = section.id;
                const products = Object.values(productsData).filter(product => 
                    product.mainCategory === categoryName
                );
                if (products.length > 0) {
                    productGrid.innerHTML = products.map(createProductCard).join('');
                } else {
                    productGrid.innerHTML = '<p>Bu kategoride ürün bulunamadı.</p>';
                }
            }
        });
    }
}
function createProductCard(product) {
    return `
        <a href="product-detail.html?id=${product.id}" class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p class="product-category">${product.parentCategory} - ${product.category}</p>
        </a>
    `;
}

