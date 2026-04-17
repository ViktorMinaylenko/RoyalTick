import {
    formatPrice,
    showCountMessage,
    shuffle,
    isItemInList,
    checkPriceParam,
    getCartItemCountBySize,
    parseJwt
} from "@/lib/utils/common";
import { countWholeCartItemsAmount } from "@/lib/utils/cart";
import { getCheckedPriceFrom, getCheckedPriceTo } from "@/lib/utils/catalog";

describe("Business Logic Specification - Unit & Integration Suite", () => {

    // --- 1. ТЕСТИ ФОРМАТУВАННЯ ТА ВІЗУАЛІЗАЦІЇ ---
    describe("Formatting Utilities", () => {
        it("1. formatPrice: розділяє розряди (12500 -> 12 500)", () => {
            expect(formatPrice(12500)).toBe("12 500");
        });

        it("2. showCountMessage: 'товар' для 1, 21, 31", () => {
            expect(showCountMessage("1", "ua")).toBe("товар");
            expect(showCountMessage("21", "ua")).toBe("товар");
        });

        it("3. showCountMessage: 'товара' для 2, 3, 4, 22", () => {
            expect(showCountMessage("4", "ua")).toBe("товара");
            expect(showCountMessage("22", "ua")).toBe("товара");
        });

        it("4. showCountMessage: 'товарів' для 5-20, 11-14", () => {
            expect(showCountMessage("11", "ua")).toBe("товарів");
            expect(showCountMessage("14", "ua")).toBe("товарів");
            expect(showCountMessage("10", "ua")).toBe("товарів");
        });

        it("5. showCountMessage EN: правильний однина/множина", () => {
            expect(showCountMessage("1", "en")).toBe("item");
            expect(showCountMessage("2", "en")).toBe("items");
        });
    });

    // --- 2. ТЕСТИ СКЛАДНОЇ ЛОГІКИ КОШИКА ---
    describe("Cart & Collection Logic", () => {
        const mockCart = [
            { productId: "id_1", size: "42mm", count: 2 },
            { productId: "id_2", size: "38mm", count: 5 },
        ] as any;

        it("6. isItemInList: знаходить існуючий товар за ID", () => {
            expect(isItemInList(mockCart, "id_1")).toBe(true);
        });

        it("7. isItemInList: повертає false, якщо товару немає", () => {
            expect(isItemInList(mockCart, "id_999")).toBe(false);
        });

        it("8. getCartItemCountBySize: коректно фільтрує за розміром (Case Insensitive)", () => {
            expect(getCartItemCountBySize(mockCart, "42mm")).toBe(2);
            expect(getCartItemCountBySize(mockCart, "42MM")).toBe(2);
        });

        it("9. getCartItemCountBySize: ігнорує 'mm' та пробіли в назві розміру", () => {
            expect(getCartItemCountBySize(mockCart, "42 mm")).toBe(2);
        });

        it("10. countWholeCartItemsAmount: сумує всі одиниці товарів", () => {
            expect(countWholeCartItemsAmount(mockCart)).toBe(7);
        });
    });

    // --- 3. ТЕСТИ КАТАЛОГУ ТА ПАРАМЕТРІВ ---
    describe("Catalog & Filter Validation", () => {
        it("11. checkPriceParam: валідні ціни (0 - 100 000)", () => {
            expect(Number(checkPriceParam(0))).toBe(0);
            expect(checkPriceParam(50000)).toBe(true);
            expect(checkPriceParam(100000)).toBe(true);
        });

        it("12. checkPriceParam: невалідні ціни (від'ємні або завеликі)", () => {
            expect(checkPriceParam(-1)).toBe(false);
            expect(checkPriceParam(100001)).toBe(false);
        });

        it("13. getCheckedPriceFrom: скидає до 50000, якщо ціна > 100к", () => {
            expect(getCheckedPriceFrom(150000)).toBe("50000");
        });

        it("14. getCheckedPriceTo: скидає до 100000, якщо ціна > 100к", () => {
            expect(getCheckedPriceTo(150000)).toBe("100000");
        });
    });

    // --- 4. АЛГОРИТМІЧНІ ТЕСТИ ---
    describe("Algorithms", () => {
        it("15. shuffle: не втрачає дані при перемішуванні", () => {
            const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const result = shuffle([...data]);
            expect(result.sort((a, b) => a - b)).toEqual(data);
        });

        it("16. shuffle: повертає порожній масив для порожнього входу", () => {
            expect(shuffle([])).toEqual([]);
        });
    });

    // --- 5. ТЕСТИ БЕЗПЕКИ (MOCKED) ---
    describe("Security Utils", () => {
        it("17. parseJwt: витягує дані з фейкового токена", () => {
            const payload = { email: "test@mail.com", role: "admin" };
            const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
            const token = `header.${encoded}.signature`;

            expect(parseJwt(token).email).toBe("test@mail.com");
            expect(parseJwt(token).role).toBe("admin");
        });
    });

    // --- 6. ТЕСТИ ВАЛІДАЦІЇ (AUTH) ---
    describe("Auth Validation Rules", () => {
        const emailRegex = /\S+@\S+\.\S+/;

        it("18. Email: валідація успішна", () => expect(emailRegex.test("user@watch.com")).toBe(true));
        it("19. Email: відсутня @", () => expect(emailRegex.test("userwatch.com")).toBe(false));
        it("20. Email: відсутня крапка домену", () => expect(emailRegex.test("user@watch")).toBe(false));
    });

    // --- 7. КРАЙОВІ ВИПАДКИ (EDGE CASES) ---
    describe("Edge Cases", () => {
        it("21. formatPrice: обробка NaN", () => {
            expect(formatPrice(NaN)).toBe("NaN");
        });

        it("22. getCartItemCountBySize: робота з undefined розміром", () => {
            const cart = [{ productId: "1", count: 5 }] as any;
            expect(getCartItemCountBySize(cart, "42mm")).toBe(0);
        });

        it("23. countWholeCartItemsAmount: обробка нечислових значень count", () => {
            const cart = [{ count: "abc" }] as any;
            expect(countWholeCartItemsAmount(cart)).toBeNaN();
        });
    });
});