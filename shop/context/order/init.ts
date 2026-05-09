import { sample } from "effector";
import { getRoyalTickOfficesByCity, getRoyalTickOfficesByCityFx } from ".";

sample({
    clock: getRoyalTickOfficesByCity,
    source: {},
    fn: (_, data) => data,
    target: getRoyalTickOfficesByCityFx,
})