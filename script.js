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
                a.href = `products.html#${mainCat}`;
                a.textContent = category;
                
                a.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // If we're not on products.html, navigate there with the hash
                    if (!window.location.pathname.endsWith('products.html')) {
                        window.location.href = `products.html#${mainCat}`;
                        return;
                    }
                    
                    // If we are on products.html, scroll to the section
                    const targetSection = document.getElementById(mainCat);
                    if (targetSection) {
                        // Calculate header height for offset
                        const headerHeight = document.querySelector('header').offsetHeight;
                        
                        // First scroll to the main category section
                        targetSection.scrollIntoView();
                        window.scrollBy(0, -headerHeight - 20); // Adjust for header height
                        
                        // Then try to find and scroll to the specific category
                        setTimeout(() => {
                            const categoryHeading = Array.from(targetSection.querySelectorAll('h3'))
                                .find(h3 => h3.textContent === category);
                            
                            if (categoryHeading) {
                                categoryHeading.scrollIntoView();
                                window.scrollBy(0, -headerHeight - 20); // Adjust for header height
                            }
                            
                            // Close dropdown
                            dropdownContent.style.display = 'none';
                        }, 100); // Small delay to ensure content is loaded
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
    // Get all main category sections
    const mainCategories = {
        "Alçılar": [],
        "Boyalar": [],
        "Yapı Kimyasalları": [],
        "Asma Tavan": []
    };

    // Group products by main category and category
    for (const productId in productsData) {
        const product = productsData[productId];
        if (mainCategories.hasOwnProperty(product.mainCategory)) {
            mainCategories[product.mainCategory].push(product);
        }
    }

    // Display products in each section
    for (const categoryName in mainCategories) {
        const section = document.getElementById(categoryName);
        if (section) {
            const products = mainCategories[categoryName];
            
            // Group products by category
            const categorizedProducts = {};
            products.forEach(product => {
                if (!categorizedProducts[product.category]) {
                    categorizedProducts[product.category] = [];
                }
                categorizedProducts[product.category].push(product);
            });

            let sectionHTML = '';
            // Add main category title
            sectionHTML += `<div class="title-container"><h2>${categoryName}</h2></div>`;
            
            // Add each category and its products
            for (const category in categorizedProducts) {
                sectionHTML += `<div class="title-container"><h3>${category}</h3></div>`;
                sectionHTML += '<div class="product-grid">';
                sectionHTML += categorizedProducts[category]
                    .map(product => createProductCard(product))
                    .join('');
                sectionHTML += '</div>';
            }
            
            section.innerHTML = sectionHTML;
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

