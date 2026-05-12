import { sample } from "effector";
import { getNovaPoshtaOfficesByCity, getNovaPoshtaOfficesByCityFx, getRoyalTickOfficesByCity, getRoyalTickOfficesByCityFx, makePayment, makePaymentFx } from ".";

sample({
    clock: getRoyalTickOfficesByCity,
    source: {},
    fn: (_, data) => data,
    target: getRoyalTickOfficesByCityFx,
})

sample({
    clock: makePayment,
    fn: (data) => data,
    target: makePaymentFx,
})

sample({
    clock: getNovaPoshtaOfficesByCity,
    fn: (data) => data,
    target: getNovaPoshtaOfficesByCityFx,
})