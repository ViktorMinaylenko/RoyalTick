import {
    addCartItemToLS, countWholeCartItemsAmount,
    updateCartItemQuantityInLS
} from "@/lib/utils/cart";
import { isUserAuth } from "@/lib/utils/common";

jest.mock("@/context/cart", () => ({
    setShouldShowEmpty: jest.fn(),
    setCartFromLS: jest.fn(),
    addProductToCart: jest.fn(),
}));

jest.mock("react-hot-toast", () => {
    const toast = { success: jest.fn(), error: jest.fn() };
    return { __esModule: true, default: toast };
});

const mockProduct = {
    _id: "prod_1",
    name: "Royal Watch",
    price: 5000,
    category: "watches",
    images: ["img.jpg"],
    inStock: true,
    sizes: {},
    type: "watch",
    characteristics: {},
} as any;

describe("Integration Tests — cart + localStorage", () => {

    beforeEach(() => {
        localStorage.clear();
    });

    describe("isUserAuth + localStorage", () => {
        it("повертає false якщо auth відсутній", () => {
            expect(isUserAuth()).toBe(false);
        });

        it("повертає true якщо є валідний токен", () => {
            localStorage.setItem("auth", JSON.stringify({ accessToken: "token123" }));
            expect(isUserAuth()).toBe(true);
        });

        it("повертає false якщо auth є але без accessToken", () => {
            localStorage.setItem("auth", JSON.stringify({}));
            expect(isUserAuth()).toBe(false);
        });
    });

    describe("addCartItemToLS — запис у localStorage", () => {
        it("додає новий товар до порожнього кошика", () => {
            addCartItemToLS(mockProduct, "", 1, false);
            const cart = JSON.parse(localStorage.getItem("cart") as string);
            expect(cart).toHaveLength(1);
            expect(cart[0].productId).toBe("prod_1");
        });

        it("збільшує count якщо товар вже є в кошику", () => {
            addCartItemToLS(mockProduct, "", 1, false);
            addCartItemToLS(mockProduct, "", 1, false);
            const cart = JSON.parse(localStorage.getItem("cart") as string);
            expect(cart).toHaveLength(1);
            expect(Number(cart[0].count)).toBe(2);
        });

        it("додає як окремий елемент для різних розмірів", () => {
            addCartItemToLS(mockProduct, "38mm", 1, false);
            addCartItemToLS(mockProduct, "42mm", 1, false);
            const cart = JSON.parse(localStorage.getItem("cart") as string);
            expect(cart).toHaveLength(2);
        });
    });

    describe("updateCartItemQuantityInLS — оновлення кількості", () => {
        it("оновлює кількість конкретного елемента", () => {
            addCartItemToLS(mockProduct, "", 1, false);
            const cart = JSON.parse(localStorage.getItem("cart") as string);
            const clientId = cart[0].clientId;

            updateCartItemQuantityInLS(clientId, 5);

            const updated = JSON.parse(localStorage.getItem("cart") as string);
            expect(Number(updated[0].count)).toBe(5);
        });

        it("не змінює інші елементи при оновленні одного", () => {
            addCartItemToLS(mockProduct, "38mm", 1, false);
            addCartItemToLS({ ...mockProduct, _id: "prod_2" }, "42mm", 1, false);
            const cart = JSON.parse(localStorage.getItem("cart") as string);

            updateCartItemQuantityInLS(cart[0].clientId, 10);

            const updated = JSON.parse(localStorage.getItem("cart") as string);
            expect(Number(updated[1].count)).toBe(1);
        });
    });

    describe("countWholeCartItemsAmount — після реальних операцій", () => {
        it("рахує загальну кількість після кількох додавань", () => {
            addCartItemToLS(mockProduct, "38mm", 2, false);
            addCartItemToLS({ ...mockProduct, _id: "prod_2" }, "42mm", 3, false);
            const cart = JSON.parse(localStorage.getItem("cart") as string);
            expect(countWholeCartItemsAmount(cart)).toBe(5);
        });
    });
});

describe("deleteProductFromLS — видалення з localStorage", () => {
    it("видаляє товар за clientId", () => {
        // Починаємо з чистого стану — додаємо ОДИН товар
        localStorage.clear();
        addCartItemToLS(mockProduct, "", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        const clientId = cart[0].clientId;

        const mockEvent = jest.fn();
        const mockSetEmpty = jest.fn();
        const { deleteProductFromLS } = require("@/lib/utils/common");

        deleteProductFromLS(clientId, "cart", mockEvent, mockSetEmpty, "Видалено", false);

        const updated = JSON.parse(localStorage.getItem("cart") as string);
        expect(updated).toHaveLength(0);
    });

    it("викликає setShouldShowEmpty якщо кошик порожній після видалення", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        const clientId = cart[0].clientId;

        const mockEvent = jest.fn();
        const mockSetEmpty = jest.fn();
        const { deleteProductFromLS } = require("@/lib/utils/common");

        deleteProductFromLS(clientId, "cart", mockEvent, mockSetEmpty, "Видалено", false);

        expect(mockSetEmpty).toHaveBeenCalledWith(true);
    });

    it("не викликає setShouldShowEmpty якщо залишились товари", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "38mm", 1, false);
        addCartItemToLS({ ...mockProduct, _id: "prod_2" }, "42mm", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);

        const mockEvent = jest.fn();
        const mockSetEmpty = jest.fn();
        const { deleteProductFromLS } = require("@/lib/utils/common");

        deleteProductFromLS(cart[0].clientId, "cart", mockEvent, mockSetEmpty, "Видалено", false);

        expect(mockSetEmpty).not.toHaveBeenCalled();
    });

    it("викликає event з оновленим масивом", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "38mm", 1, false);
        addCartItemToLS({ ...mockProduct, _id: "prod_2" }, "42mm", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);

        const mockEvent = jest.fn();
        const mockSetEmpty = jest.fn();
        const { deleteProductFromLS } = require("@/lib/utils/common");

        deleteProductFromLS(cart[0].clientId, "cart", mockEvent, mockSetEmpty, "Видалено", false);

        expect(mockEvent).toHaveBeenCalledWith(
            expect.arrayContaining([expect.objectContaining({ productId: "prod_2" })])
        );
    });

    it("коректно працює якщо ключ в localStorage відсутній", () => {
        localStorage.clear();
        const mockEvent = jest.fn();
        const mockSetEmpty = jest.fn();
        const { deleteProductFromLS } = require("@/lib/utils/common");

        expect(() =>
            deleteProductFromLS("nonexistent", "cart", mockEvent, mockSetEmpty, "Видалено", false)
        ).not.toThrow();
    });
});

describe("addCartItemToLS — edge cases", () => {
    it("зберігає правильну ціну товару", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        expect(cart[0].price).toBe(5000);
    });

    it("зберігає правильне зображення", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        expect(cart[0].image).toBe("img.jpg");
    });

    it("генерує унікальний clientId для кожного товару", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "38mm", 1, false);
        addCartItemToLS({ ...mockProduct, _id: "prod_2" }, "42mm", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        expect(cart[0].clientId).not.toBe(cart[1].clientId);
    });

    it("count після подвійного додавання без розміру збільшується на 1", () => {
        // Логіка: якщо розміру немає — count + 1 (незалежно від переданого count)
        localStorage.clear();
        addCartItemToLS(mockProduct, "", 1, false);
        addCartItemToLS(mockProduct, "", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        expect(Number(cart[0].count)).toBe(2);
    });

    it("товари з різними productId не об'єднуються", () => {
        localStorage.clear();
        addCartItemToLS(mockProduct, "", 1, false);
        addCartItemToLS({ ...mockProduct, _id: "prod_99" }, "", 1, false);
        const cart = JSON.parse(localStorage.getItem("cart") as string);
        expect(cart).toHaveLength(2);
    });
});