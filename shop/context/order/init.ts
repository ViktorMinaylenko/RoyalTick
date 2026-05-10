import { sample } from "effector";
import { getRoyalTickOfficesByCity, getRoyalTickOfficesByCityFx, makePayment, makePaymentFx } from ".";

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