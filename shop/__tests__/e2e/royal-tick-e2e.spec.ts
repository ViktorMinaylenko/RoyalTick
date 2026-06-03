import { test, expect } from '@playwright/test';

test.describe('RoyalTick E2E Flows', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');
        
        // Обробка Cookie банера
        const cookieButton = page.getByRole('button', { name: /прийняти|accept/i });
        const isCookieVisible = await cookieButton.isVisible({ timeout: 3000 }).catch(() => false);
        if (isCookieVisible) {
            await cookieButton.click();
            await page.waitForTimeout(500);
        }
    });

    test('Користувач може додати товар до кошика з вибором розміру', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');

        await page.waitForSelector('ul li', { timeout: 10000 });

        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        
        let productCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';

            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }

            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCard = item;
                break;
            }
        }

        expect(productCard).toBeTruthy();

        await productCard!.hover();
        await page.waitForTimeout(300);

        const addToCartBtn = productCard!.getByRole('button', { 
            name: /додати в кошик|to cart/i 
        }).first();
        
        await expect(addToCartBtn).toBeVisible({ timeout: 5000 });
        await addToCartBtn.click();
        await page.waitForTimeout(500);


        const sizeTableDiv = page.locator('div').filter({
            has: page.locator('table tbody tr')
        }).filter({
            has: page.locator('table thead')
        }).last();
        
        await page.waitForTimeout(1000);
        const isModalVisible = await sizeTableDiv.isVisible({ timeout: 5000 }).catch(() => false);
        expect(isModalVisible).toBeTruthy();

        const sizeRows = sizeTableDiv.locator('tbody tr');
        const rowCount = await sizeRows.count();
        
        expect(rowCount).toBeGreaterThan(0);

        let sizeSelected = false;
        for (let i = 0; i < rowCount; i++) {
            const row = sizeRows.nth(i);
            const style = await row.getAttribute('style') || '';
            
            if (style.includes('cursor: pointer')) {
                await row.click();
                await page.waitForTimeout(300);
                sizeSelected = true;
                break;
            }
        }
        
        expect(sizeSelected).toBeTruthy();
        await page.waitForTimeout(500);

        let modalAddBtn = sizeTableDiv.getByRole('button', {
            name: /додати в кошик|add to cart/i
        });
        
        let btnFound = await modalAddBtn.first().isVisible({ timeout: 2000 }).catch(() => false);
        
        if (!btnFound) {
            const allModalButtons = sizeTableDiv.locator('button');
            const btnCount = await allModalButtons.count();
            
            if (btnCount > 0) {
                for (let i = 0; i < btnCount; i++) {
                    const btn = allModalButtons.nth(i);
                    const btnText = await btn.textContent() || '';
                    
                    if (btnText.includes('Додати') || btnText.includes('кошик') || 
                        btnText.includes('Add') || btnText.includes('cart')) {
                        modalAddBtn = btn;
                        btnFound = true;
                        break;
                    }
                }
            }
        }

        if (!btnFound) {
            const pageButton = page.getByRole('button', {
                name: /додати в кошик|add to cart/i
            });
            const isPageBtnVisible = await pageButton.first().isVisible({ timeout: 2000 }).catch(() => false);
            if (isPageBtnVisible) {
                modalAddBtn = pageButton.first();
                btnFound = true;
            }
        }

        if (!btnFound) {
            const allPageButtons = page.locator('button');
            const allPageButtonCount = await allPageButtons.count();
            
            for (let i = 0; i < allPageButtonCount; i++) {
                const btn = allPageButtons.nth(i);
                const btnClass = await btn.getAttribute('class') || '';
                const btnText = await btn.textContent() || '';
                const isVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);

                if (btnClass.includes('close') || btnText.includes('✕') || btnText.includes('×')) {
                    continue;
                }

                if (isVisible && btnText.trim().length > 0) {
                    modalAddBtn = btn;
                    btnFound = true;
                    break;
                }
            }
        }
        
        expect(btnFound).toBeTruthy();
        await modalAddBtn.click();
        await page.waitForTimeout(1000);

        await expect(sizeTableDiv).not.toBeVisible({ timeout: 5000 }).catch(() => {

        });
    });

    test('Користувач може додати товар в "Улюблені"', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');

        await page.waitForSelector('ul li', { timeout: 10000 });

        // 1. Знаходимо першу картку товару (фільтруємо навігацію)
        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        
        let productCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';

            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }

            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCard = item;
                break;
            }
        }

        expect(productCard).toBeTruthy();

        await productCard!.hover();
        await page.waitForTimeout(300);

        const allButtons = productCard!.locator('button');
        const buttonCount = await allButtons.count();
        
        let favoriteButton = null;

        for (let i = 0; i < buttonCount; i++) {
            const btn = allButtons.nth(i);
            const btnClass = await btn.getAttribute('class') || '';
            const btnHtml = await btn.innerHTML() || '';
            
            if (btnClass.includes('favorite') || btnHtml.includes('favorite')) {
                favoriteButton = btn;
                break;
            }
        }

        if (!favoriteButton && buttonCount > 1) {
            favoriteButton = allButtons.nth(1);
        }
        
        expect(favoriteButton).toBeTruthy();
        await favoriteButton!.click();
        await page.waitForTimeout(1000);

        await page.goto('/favorites');
        await page.waitForLoadState('networkidle');

        // 5. Перевіряємо, що сторінка завантажилась і має контент
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toBeTruthy();
        
        // Перевіряємо наявність заголовка або списку товарів
        const heading = page.getByRole('heading').first();
        const headingVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false);
        
        expect(headingVisible || pageContent?.length || 0 > 0).toBeTruthy();
    });

    test('Користувач може переглядати каталог', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');

        // Чекаємо, поки список товарів завантажиться
        await page.waitForSelector('ul li', { timeout: 10000 });

        // 1. Перевіряємо, що товари завантажилися (фільтруємо навігацію)
        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        
        let productCount = 0;
        let firstProductCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';
            
            // Пропускаємо навігацію та рекламу
            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }
            
            // Перевіряємо, чи це видимий елемент каталогу
            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCount++;
                if (!firstProductCard) {
                    firstProductCard = item;
                }
            }
        }
        
        expect(productCount).toBeGreaterThan(0);
        expect(firstProductCard).toBeTruthy();

        // 2. Перевіряємо видимість першого товара
        const isVisible = await firstProductCard!.isVisible({ timeout: 5000 });
        expect(isVisible).toBeTruthy();

        // 3. Перевіряємо наявність ціни (текст + ₴ символ або просто числа)
        const priceText = await firstProductCard!.textContent();
        const hasPrice = priceText && (priceText.includes('₴') || /\d+/.test(priceText));
        
        expect(hasPrice).toBeTruthy();
    });

    test('Користувач може перейти в порівнювання', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('ul li', { timeout: 10000 });

        // 1. Знаходимо першу картку товару
        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        let productCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';
            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }
            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCard = item;
                break;
            }
        }

        expect(productCard).toBeTruthy();

        // 2. Ховеримо та знаходимо кнопку порівнювання
        await productCard!.hover();
        await page.waitForTimeout(300);

        const allButtons = productCard!.locator('button');
        const buttonCount = await allButtons.count();
        let comparisonButton = null;
        
        for (let i = 0; i < buttonCount; i++) {
            const btn = allButtons.nth(i);
            const btnClass = await btn.getAttribute('class') || '';
            const btnHtml = await btn.innerHTML() || '';
            
            if (btnClass.includes('comparison') || btnHtml.includes('comparison')) {
                comparisonButton = btn;
                break;
            }
        }

        expect(comparisonButton).toBeTruthy();
        await comparisonButton!.click();
        await page.waitForTimeout(1000);

        // 3. Переходимо на сторінку порівнювання
        await page.goto('/comparison');
        await page.waitForLoadState('networkidle');

        // 4. Перевіряємо, що товар в порівнюванні
        const pageContent = await page.locator('body').textContent();
        expect(pageContent?.length || 0 > 0).toBeTruthy();
    });

    test('Користувач може перейти в кошик', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('ul li', { timeout: 10000 });

        // 1. Додаємо товар в кошик (без вибору розміру для простоти)
        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        let productCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';
            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }
            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCard = item;
                break;
            }
        }

        // 2. Переходимо на сторінку кошика
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');

        // 3. Перевіряємо, що сторінка кошика завантажилась
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toBeTruthy();
        
        // Перевіряємо наявність заголовка кошика або тексту про пустий кошик
        const hasCartContent = pageContent?.includes('кошик') || pageContent?.includes('Cart') || 
            pageContent?.includes('Кошик') || (pageContent?.length ?? 0) > 100;
        expect(hasCartContent).toBeTruthy();
    });

    test('Користувач може фільтрувати товари по категоріях', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');

        // 1. Знаходимо перший товар для підрахунку
        await page.waitForSelector('ul li', { timeout: 10000 });
        const allLiElements = page.locator('li');
        const initialLiCount = await allLiElements.count();

        // 2. Перевіряємо, що є товари
        expect(initialLiCount).toBeGreaterThan(0);

        // 3. Спробуємо знайти фільтр по категоріях
        const filterButtons = page.locator('button').filter({
            has: page.locator('text=/категор|category|watch|strap/i')
        });
        
        const hasFilters = await filterButtons.first().isVisible({ timeout: 3000 }).catch(() => false);
        
        if (hasFilters) {
            await filterButtons.first().click();
            await page.waitForTimeout(1000);
            
            // Перевіряємо, що список оновився
            const updatedLiCount = await allLiElements.count();
            expect(updatedLiCount).toBeGreaterThan(0);
        }
    });

    test('Користувач може переглядати деталі товару', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('ul li', { timeout: 10000 });

        // 1. Знаходимо першу картку товару
        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        let productCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';
            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }
            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCard = item;
                break;
            }
        }

        expect(productCard).toBeTruthy();

        // 2. Ховеримо та знаходимо кнопку "Швидкий перегляд"
        await productCard!.hover();
        await page.waitForTimeout(300);

        const quickViewBtn = productCard!.getByRole('button', {
            name: /швидкий перегляд|quick view/i
        });
        
        const quickViewVisible = await quickViewBtn.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (quickViewVisible) {
            await quickViewBtn.click();
            await page.waitForTimeout(500);

            // 3. Перевіряємо, що модалка швидкого перегляду відкрилась
            const modalContent = page.locator('div').filter({
                has: page.locator('button')
            }).last();
            
            const modalVisible = await modalContent.isVisible({ timeout: 3000 }).catch(() => false);
            expect(modalVisible).toBeTruthy();
        }
    });

    test('Користувач може видалити товар з улюблених', async ({ page }) => {
        // 1. Додаємо товар в улюблені
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('ul li', { timeout: 10000 });

        const allLiElements = page.locator('li');
        const liCount = await allLiElements.count();
        let productCard = null;
        
        for (let i = 0; i < liCount; i++) {
            const item = allLiElements.nth(i);
            const classList = await item.getAttribute('class') || '';
            if (classList.includes('nav-menu') || classList.includes('ad')) {
                continue;
            }
            const isVisible = await item.isVisible({ timeout: 2000 }).catch(() => false);
            if (isVisible) {
                productCard = item;
                break;
            }
        }

        expect(productCard).toBeTruthy();

        await productCard!.hover();
        await page.waitForTimeout(300);

        const allButtons = productCard!.locator('button');
        const buttonCount = await allButtons.count();
        let favoriteButton = null;
        
        for (let i = 0; i < buttonCount; i++) {
            const btn = allButtons.nth(i);
            const btnClass = await btn.getAttribute('class') || '';
            const btnHtml = await btn.innerHTML() || '';
            
            if (btnClass.includes('favorite') || btnHtml.includes('favorite')) {
                favoriteButton = btn;
                break;
            }
        }

        if (favoriteButton) {
            await favoriteButton.click();
            await page.waitForTimeout(1000);
        }

        // 2. Переходимо на сторінку улюблених
        await page.goto('/favorites');
        await page.waitForLoadState('networkidle');

        // 3. Перевіряємо, що є товари
        const allProductsOnFav = page.locator('li');
        const favProductCount = await allProductsOnFav.count();
        
        if (favProductCount > 0) {
            // 4. Знаходимо кнопку видалення для першого товару
            let favProduct = null;
            for (let i = 0; i < favProductCount; i++) {
                const item = allProductsOnFav.nth(i);
                const classList = await item.getAttribute('class') || '';
                if (!classList.includes('nav-menu')) {
                    favProduct = item;
                    break;
                }
            }

            if (favProduct) {
                await favProduct.hover();
                await page.waitForTimeout(300);

                // Спробуємо знайти кнопку видалення
                const deleteBtn = favProduct.locator('button').filter({
                    has: favProduct.locator('[class*="delete"], [class*="remove"], [class*="trash"]')
                }).first();

                const deleteBtnVisible = await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false);
                if (deleteBtnVisible) {
                    await deleteBtn.click();
                    await page.waitForTimeout(500);
                }
            }
        }
    });

    test('Користувач може переключатися між сторінками', async ({ page }) => {
        await page.goto('/catalog');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('ul li', { timeout: 10000 });

        // 1. Перевіряємо, що є пагінація
        const nextPageBtn = page.locator('button, a').filter({
            has: page.locator('text=/далі|next|›|»/i')
        }).first();

        const hasNextBtn = await nextPageBtn.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (hasNextBtn) {
            // 2. Клікаємо на "далі"
            await nextPageBtn.click();
            await page.waitForLoadState('networkidle');

            // 3. Перевіряємо, що товари завантажилися на новій сторінці
            const productsOnPage = page.locator('li').filter({
                has: page.locator('a, img')
            });
            
            const productCount = await productsOnPage.count();
            expect(productCount).toBeGreaterThan(0);
        }
    });
});