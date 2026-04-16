import {
    formatPrice,
    showCountMessage,
    shuffle
} from "@/lib/utils/common";
import { countWholeCartItemsAmount } from "@/lib/utils/cart";
import { getCheckedPriceFrom, getCheckedPriceTo } from "@/lib/utils/catalog";

describe("RoyalTick Project - Real Code Testing (20 Tests)", () => {

    describe("Common Utilities", () => {
        it("1. formatPrice: правильно розставляє пробіли (1000 -> 1 000)", () => {
            expect(formatPrice(1000)).toBe("1 000");
        });

        it("2. formatPrice: працює з великими сумами (1000000 -> 1 000 000)", () => {
            expect(formatPrice(1000000)).toBe("1 000 000");
        });

        it("3. shuffle: масив залишається тієї ж довжини", () => {
            const arr = [1, 2, 3, 4, 5];
            expect(shuffle([...arr])).toHaveLength(5);
        });

        it("4. shuffle: містить ті самі елементи після перемішування", () => {
            const arr = [1, 2, 3];
            const shuffled = shuffle([...arr]);
            expect(shuffled).toContain(1);
            expect(shuffled).toContain(2);
            expect(shuffled).toContain(3);
        });

        it("5. showCountMessage: правильне відмінювання для 1 (UA)", () => {
            expect(showCountMessage("1", "ua")).toBe("товар");
        });

        it("6. showCountMessage: правильне відмінювання для 2 (UA)", () => {
            expect(showCountMessage("2", "ua")).toBe("товара");
        });

        it("7. showCountMessage: правильне відмінювання для 5 (UA)", () => {
            expect(showCountMessage("5", "ua")).toBe("товарів");
        });

        it("8. showCountMessage: правильне відмінювання для 11 (UA)", () => {
            expect(showCountMessage("11", "ua")).toBe("товарів");
        });

        it("9. showCountMessage: правильне відмінювання для 21 (UA)", () => {
            expect(showCountMessage("21", "ua")).toBe("товар");
        });

        it("10. showCountMessage: англійська мова для 1", () => {
            expect(showCountMessage("1", "en")).toBe("item");
        });

        it("11. showCountMessage: англійська мова для 5", () => {
            expect(showCountMessage("5", "en")).toBe("items");
        });
    });

    describe("Cart Logic", () => {
        it("12. countWholeCartItemsAmount: рахує суму кількостей товарів", () => {
            const mockCart = [
                { count: 2 } as any,
                { count: 3 } as any,
                { count: 1 } as any
            ];
            expect(countWholeCartItemsAmount(mockCart)).toBe(6);
        });

        it("13. countWholeCartItemsAmount: повертає 0 для порожнього кошика", () => {
            expect(countWholeCartItemsAmount([])).toBe(0);
        });

        it("14. countWholeCartItemsAmount: коректно обробляє рядки замість чисел", () => {
            const mockCart = [{ count: "10" } as any];
            expect(countWholeCartItemsAmount(mockCart)).toBe(10);
        });
    });

    describe("Catalog Filtering", () => {
        it("15. getCheckedPriceFrom: не змінює ціну менше 100к", () => {
            expect(getCheckedPriceFrom(5000)).toBe(5000);
        });

        it("16. getCheckedPriceFrom: обмежує ціну зверху", () => {
            expect(getCheckedPriceFrom(150000)).toBe("50000");
        });

        it("17. getCheckedPriceTo: не змінює ціну менше 100к", () => {
            expect(getCheckedPriceTo(80000)).toBe(80000);
        });

        it("18. getCheckedPriceTo: повертає максимум для великих значень", () => {
            expect(getCheckedPriceTo(200000)).toBe("100000");
        });
    });

    describe("Validation Patterns", () => {
        const emailRegex = /\S+@\S+\.\S+/;

        it("19. Email regex: пропускає валідний імейл", () => {
            expect(emailRegex.test("test@mail.com")).toBe(true);
        });

        it("20. Email regex: не пропускає імейл без крапки", () => {
            expect(emailRegex.test("test@mail")).toBe(false);
        });
    });
});