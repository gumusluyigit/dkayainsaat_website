// Add this function at the top level
function scrollToSection(sectionId) {
    console.log('Attempting to scroll to section:', sectionId);
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        console.log('Found section:', targetSection);
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight - 150;
        console.log('Calculated scroll position:', targetPosition);
        
        // Try using scrollIntoView first
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Then adjust for header with more padding
        setTimeout(() => {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }, 100);
    } else {
        console.warn('Section not found:', sectionId);
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
    // Header scroll effect
    const header = document.querySelector('header');
    
    // Check scroll position and update header on page load
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    // Add scroll event listener
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Add hash change listener
    window.addEventListener('hashchange', function() {
        if (window.location.pathname.endsWith('products.html')) {
            const targetId = decodeURIComponent(window.location.hash.slice(1));
            console.log('Hash changed, target ID:', targetId);  // Debug log
            if (targetId) {
                scrollToSection(targetId);
            }
        }
    });

    // Handle initial hash on page load
    if (window.location.hash && window.location.pathname.endsWith('products.html')) {
        setTimeout(() => {
            const targetId = decodeURIComponent(window.location.hash.slice(1));
            console.log('Initial page load, target ID:', targetId);  // Debug log
            if (targetId) {
                scrollToSection(targetId);
            }
        }, 300);
    }

    // Remove the click handler for Ürünler nav button since we want it to work normally
    const productsButton = document.querySelector('.dropdown > a');
    if (productsButton) {
        productsButton.addEventListener('click', function(e) {
            // Only prevent default if we're already on products.html
            if (window.location.pathname.endsWith('products.html')) {
                e.preventDefault();
            }
        });
    }

    // Create dropdown menu
    createDropdownMenu();

    // Show product list - only on products.html
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
        // Şirket ismini al (örn: "FullBoard - Alçı Plakalar" -> "FullBoard")
        const companyName = product.parentCategory.split(' - ')[0];
        
        return `
            <a href="product-detail.html?id=${product.id}" class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="product-company">${companyName}</p>
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
});

function createDropdownMenu() {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (!dropdownContent) return;
    
    dropdownContent.innerHTML = ''; // Clear existing content
    
    // Main categories
    const mainCategories = {
        "Alçılar": {},
        "Boyalar": {},
        "Yapı Kimyasalları": {},
        "Asma Tavan": {}
    };
    
    // Group products by main category and parent category
    for (const productId in productsData) {
        const product = productsData[productId];
        if (mainCategories.hasOwnProperty(product.mainCategory)) {
            if (!mainCategories[product.mainCategory][product.parentCategory]) {
                mainCategories[product.mainCategory][product.parentCategory] = new Set();
            }
            mainCategories[product.mainCategory][product.parentCategory].add(product.category);
        }
    }
    
    // Create dropdown structure
    for (const mainCat in mainCategories) {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';
        
        const mainCatTitle = document.createElement('h3');
        mainCatTitle.textContent = mainCat;
        categorySection.appendChild(mainCatTitle);
        
        // Add parent categories
        for (const parentCat in mainCategories[mainCat]) {
            const subCatSection = document.createElement('div');
            subCatSection.className = 'subcategory-section';
            
            const subCatTitle = document.createElement('h4');
            subCatTitle.textContent = parentCat;
            subCatSection.appendChild(subCatTitle);
            
            const productList = document.createElement('ul');
            productList.className = 'product-category-list';
            
            // Add categories
            mainCategories[mainCat][parentCat].forEach(category => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                // Link to main category instead of subcategory
                a.href = `products.html#${encodeURIComponent(mainCat)}`;
                a.textContent = category;
                
                a.addEventListener('click', function(e) {
                    const currentPath = window.location.pathname;
                    console.log('Dropdown link clicked, current path:', currentPath);
                    console.log('Target category:', category);
                    
                    if (!currentPath.endsWith('products.html')) {
                        // Let the default navigation happen
                        return;
                    }
                    
                    // If we're already on products.html
                    e.preventDefault();
                    const targetSection = document.getElementById(category);
                    if (targetSection) {
                        // Update URL hash first
                        history.pushState(null, null, `#${encodeURIComponent(category)}`);
                        // Then scroll to subcategory
                        console.log('Scrolling to section:', category);
                        scrollToSection(category);
                    } else {
                        // If subcategory section not found, scroll to main category
                        const mainSection = document.getElementById(mainCat);
                        if (mainSection) {
                            history.pushState(null, null, `#${encodeURIComponent(mainCat)}`);
                            scrollToSection(mainCat);
                        }
                    }
                });
                
                li.appendChild(a);
                productList.appendChild(li);
            });
            
            subCatSection.appendChild(productList);
            categorySection.appendChild(subCatSection);
        }
        
        dropdownContent.appendChild(categorySection);
    }
    
    // Add hover functionality
    const dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        dropdown.addEventListener('mouseenter', function() {
            dropdownContent.style.display = 'block';
        });
        
        dropdown.addEventListener('mouseleave', function() {
            dropdownContent.style.display = 'none';
        });
    }
}

function displayProducts() {
    // Group products by main category and subcategory
    const categories = {};
    
    for (const productId in productsData) {
        const product = productsData[productId];
        const mainCategory = product.mainCategory;
        let category = product.category;
        
        // Special handling for Asma Tavan products
        if (mainCategory === "Asma Tavan") {
            category = "Asma Tavan Ürünleri";
        }
        
        if (!categories[mainCategory]) {
            categories[mainCategory] = {};
        }
        if (!categories[mainCategory][category]) {
            categories[mainCategory][category] = [];
        }
        categories[mainCategory][category].push(product);
    }

    // Display products in each subcategory
    for (const mainCategory in categories) {
        const mainCategorySection = document.getElementById(mainCategory);
        if (mainCategorySection) {
            for (const subcategory in categories[mainCategory]) {
                const subcategoryContainer = document.getElementById(subcategory);
                if (subcategoryContainer) {
                    const productGrid = subcategoryContainer.querySelector('.product-grid');
                    if (productGrid) {
                        productGrid.innerHTML = categories[mainCategory][subcategory]
                            .map(product => createProductCard(product))
                            .join('');
                    }
                }
            }
        }
    }
}

function createProductCard(product) {
    // Şirket ismini al (örn: "FullBoard - Alçı Plakalar" -> "FullBoard")
    const companyName = product.parentCategory.split(' - ')[0];
    
    return `
        <a href="product-detail.html?id=${product.id}" class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p class="product-company">${companyName}</p>
        </a>
    `;
}

