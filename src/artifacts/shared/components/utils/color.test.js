import { hexToRgb, rgbToHsl } from "./color";

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
        it("should convert rgb data to hsl array", () => {
            const result = rgbToHsl(...[255, 0, 0]);
            expect(result).toEqual([0, 1, 0.5]);
        });
    });
});

