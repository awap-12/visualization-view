const UUID_SIZE = 16;

/**
 * Generate a group of random bytes
 * @param {number} size
 * @return {Uint8Array}
 */
function generateRandomBytes(size) {
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; ++i)
        buffer[i] = Math.random() * 0xff | 0;
    return buffer;
}

/**
 * Generate UUID base on [RFC 4122]{@link https://www.rfc-editor.org/rfc/rfc4122.txt}
 * @param {number} size
 * @return {string}
 */
function generateUUID(size = UUID_SIZE) {
    const data = generateRandomBytes(size);
    // mark as random - RFC 4122 § 4.4
    data[6] = (data[6] & 0x4f) | 0x40;
    data[8] = (data[8] & 0xbf) | 0x80;
    let result = '';
    for (let offset = 0; offset < size; ++offset) {
        const byte = data[offset];
        if (offset === 4 || offset === 6 || offset === 8) result += "-";
        if (byte < 16) result += "0";
        result += byte.toString(16).toLowerCase();
    }
    return result;
}

export default generateUUID;
