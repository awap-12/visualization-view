import { hexToRgb, rgbToHsl, rgbToHwb } from "./color";

describe("color utils test", () => {
    describe("hex to rgb test", () => {
        it("should covert hex string to rgb array", () => {
            const result = hexToRgb("#0000ff");
            expect(result).toEqual([0, 0, 255]);
        });
        it("should covert hex string(3 digital) to rgb array", () => {
            const result = hexToRgb("#0f0");
            expect(result).toEqual([0, 255, 0])
        });
    });
    describe("rgb to hsl test", () => {
        it("should convert #7f7f7f rgb data to hsl array", () => {
            const [h, s, l] = rgbToHsl(...[127, 127, 127]);
            expect(h).toBeCloseTo(0);
            expect(s).toBeCloseTo(0);
            expect(l).toBeCloseTo(0.5);
        });
        it("should convert #ff7fff rgb data to hsl array", () => {
            const [h, s, l] = rgbToHsl(...[255, 127, 255]);
            expect(h).toBeCloseTo(300);
            expect(s).toBeCloseTo(1);
            expect(l).toBeCloseTo(0.75);
        });
    });
    describe("rgb to hwb test", () => {
        it("should convert #7f7f7f rgb data to hwb array", () => {
            const [h, w, b] = rgbToHwb(...[127, 127, 127]);
            expect(h).toBeCloseTo(0);
            expect(w).toBeCloseTo(0.5);
            expect(b).toBeCloseTo(0.5);
        });
        it("should convert #ff7fff rgb data to hwb array", () => {
            const [h, w, b] = rgbToHwb(...[255, 127, 255]);
            expect(h).toBeCloseTo(300);
            expect(w).toBeCloseTo(0.5);
            expect(b).toBeCloseTo(0);
        });
    });
});

