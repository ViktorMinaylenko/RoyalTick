import {
    formatPrice, showCountMessage, shuffle, isItemInList,
    checkPriceParam, getCartItemCountBySize, parseJwt
} from "@/lib/utils/common";
import { countWholeCartItemsAmount } from "@/lib/utils/cart";
import { getCheckedPriceFrom, getCheckedPriceTo } from "@/lib/utils/catalog";

describe("Unit Tests", () => {

    describe("formatPrice", () => {
        it("розставляє пробіли (1000 → '1 000')", () => {
            expect(formatPrice(1000)).toBe("1 000");
        });
        it("великі суми (1000000 → '1 000 000')", () => {
            expect(formatPrice(1000000)).toBe("1 000 000");
        });
        it("обробка NaN", () => {
            expect(formatPrice(NaN)).toBe("NaN");
        });
    });

    describe("showCountMessage", () => {
        it("'товар' для 1, 21", () => {
            expect(showCountMessage("1", "ua")).toBe("товар");
            expect(showCountMessage("21", "ua")).toBe("товар");
        });
        it("'товара' для 2, 3, 4, 22", () => {
            expect(showCountMessage("4", "ua")).toBe("товара");
            expect(showCountMessage("22", "ua")).toBe("товара");
        });
        it("'товарів' для 5-20, 11-14", () => {
            expect(showCountMessage("5", "ua")).toBe("товарів");
            expect(showCountMessage("11", "ua")).toBe("товарів");
        });
        it("англійська однина/множина", () => {
            expect(showCountMessage("1", "en")).toBe("item");
            expect(showCountMessage("5", "en")).toBe("items");
        });
    });

    describe("shuffle", () => {
        it("масив зберігає ту саму довжину", () => {
            expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
        });
        it("містить ті самі елементи після перемішування", () => {
            const data = [1, 2, 3, 4, 5];
            expect(shuffle([...data]).sort((a, b) => a - b)).toEqual(data);
        });
        it("порожній масив → порожній масив", () => {
            expect(shuffle([])).toEqual([]);
        });
    });

    describe("parseJwt", () => {
        it("витягує payload з токена", () => {
            const payload = { email: "test@mail.com", role: "admin" };
            const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
            const token = `header.${encoded}.signature`;
            expect(parseJwt(token).email).toBe("test@mail.com");
            expect(parseJwt(token).role).toBe("admin");
        });
    });

    describe("isItemInList", () => {
        const cart = [
            { productId: "id_1", size: "42mm", count: 2 },
            { productId: "id_2", size: "38mm", count: 5 },
        ] as any;

        it("знаходить існуючий товар за ID", () => {
            expect(isItemInList(cart, "id_1")).toBe(true);
        });
        it("повертає false, якщо товару немає", () => {
            expect(isItemInList(cart, "id_999")).toBe(false);
        });
    });

    describe("getCartItemCountBySize", () => {
        const cart = [
            { productId: "id_1", size: "42mm", count: 2 },
            { productId: "id_2", size: "38mm", count: 5 },
        ] as any;

        it("фільтрує за розміром (case insensitive)", () => {
            expect(getCartItemCountBySize(cart, "42mm")).toBe(2);
            expect(getCartItemCountBySize(cart, "42MM")).toBe(2);
        });
        it("ігнорує пробіли і 'mm'", () => {
            expect(getCartItemCountBySize(cart, "42 mm")).toBe(2);
        });
        it("повертає 0 якщо розміру немає в кошику", () => {
            expect(getCartItemCountBySize(cart, "50mm")).toBe(0);
        });
        it("повертає 0 якщо size у товарі undefined", () => {
            const cartNoSize = [{ productId: "1", count: 5 }] as any;
            expect(getCartItemCountBySize(cartNoSize, "42mm")).toBe(0);
        });
    });

    describe("checkPriceParam", () => {
        it("валідні ціни (0 - 100 000)", () => {
            expect(checkPriceParam(50000)).toBe(true);
            expect(checkPriceParam(100000)).toBe(true);
        });
        it("невалідні ціни (від'ємні або завеликі)", () => {
            expect(checkPriceParam(-1)).toBe(false);
            expect(checkPriceParam(100001)).toBe(false);
        });
    });

    describe("countWholeCartItemsAmount", () => {
        it("сумує кількості товарів", () => {
            const cart = [{ count: 2 }, { count: 3 }, { count: 1 }] as any;
            expect(countWholeCartItemsAmount(cart)).toBe(6);
        });
        it("повертає 0 для порожнього кошика", () => {
            expect(countWholeCartItemsAmount([])).toBe(0);
        });
        it("коректно обробляє рядки замість чисел", () => {
            expect(countWholeCartItemsAmount([{ count: "10" }] as any)).toBe(10);
        });
    });

    describe("getCheckedPriceFrom / getCheckedPriceTo", () => {
        it("не змінює ціну менше 100к", () => {
            expect(getCheckedPriceFrom(5000)).toBe(5000);
            expect(getCheckedPriceTo(80000)).toBe(80000);
        });
        it("скидає до 50000 якщо ціна From > 100к", () => {
            expect(getCheckedPriceFrom(150000)).toBe("50000");
        });
        it("скидає до 100000 якщо ціна To > 100к", () => {
            expect(getCheckedPriceTo(150000)).toBe("100000");
        });
    });

    describe("Email validation regex", () => {
        const emailRegex = /\S+@\S+\.\S+/;
        it("пропускає валідний email", () => {
            expect(emailRegex.test("test@mail.com")).toBe(true);
        });
        it("не пропускає email без @", () => {
            expect(emailRegex.test("testmail.com")).toBe(false);
        });
        it("не пропускає email без крапки домену", () => {
            expect(emailRegex.test("test@mail")).toBe(false);
        });
    });
    describe("checkOffsetParam", () => {
        const { checkOffsetParam } = require("@/lib/utils/common");

        it("повертає true для '0'", () => {
            expect(checkOffsetParam("0")).toBe(true);
        });
        it("повертає true для '10'", () => {
            expect(checkOffsetParam("10")).toBe(true);
        });
        it("повертає false для undefined", () => {
            expect(checkOffsetParam(undefined)).toBe(false);
        });
        it("повертає false для null", () => {
            expect(checkOffsetParam(null as any)).toBe(false);
        });
        it("повертає false для рядка 'abc'", () => {
            expect(checkOffsetParam("abc")).toBe(false);
        });
        it("повертає false для від'ємного числа", () => {
            expect(checkOffsetParam("-1")).toBe(false);
        });
    });

    describe("getCheckedArrayParam", () => {
        const { getCheckedArrayParam } = require("@/lib/utils/common");

        it("повертає масив для валідного JSON-масиву", () => {
            const encoded = encodeURIComponent(JSON.stringify(["42mm", "38mm"]));
            expect(getCheckedArrayParam(encoded)).toEqual(["42mm", "38mm"]);
        });
        it("повертає false для порожнього масиву", () => {
            const encoded = encodeURIComponent(JSON.stringify([]));
            expect(getCheckedArrayParam(encoded)).toBeFalsy();
        });
        it("повертає false для невалідного JSON", () => {
            expect(getCheckedArrayParam("not_json")).toBe(false);
        });
        it("повертає false якщо результат не масив", () => {
            const encoded = encodeURIComponent(JSON.stringify({ key: "val" }));
            expect(getCheckedArrayParam(encoded)).toBeFalsy();
        });
    });

    describe("showCountMessage — додаткові випадки", () => {
        it("'товарів' для 12", () => {
            expect(showCountMessage("12", "ua")).toBe("товарів");
        });
        it("'товарів' для 13", () => {
            expect(showCountMessage("13", "ua")).toBe("товарів");
        });
        it("'товар' для 31", () => {
            expect(showCountMessage("31", "ua")).toBe("товар");
        });
        it("'items' для 11 (EN)", () => {
            expect(showCountMessage("11", "en")).toBe("items");
        });
    });
});