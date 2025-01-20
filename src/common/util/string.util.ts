export const string = {
    toHex: (str: string): string => {
        // UTF-8 인코딩된 바이트 배열을 얻기 위해 TextEncoder 사용
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str); // 문자열을 UTF-8 바이트 배열로 변환

        // 바이트 배열을 HEX 문자열로 변환
        let hex = '';
        bytes.forEach(byte => {
            // 각 바이트를 2자리 16진수로 변환하고, HEX 문자열에 추가
            hex += byte.toString(16).padStart(2, '0').toUpperCase();
        });
        return hex;
    },
    toHexUTF16: (str: string): string => {
        const bytes = new Uint16Array([...str].map(char => char.charCodeAt(0))); // 각 문자의 UTF-16 코드 포인트를 가져옴
        return Array.from(bytes).map(byte => (byte & 0xFF).toString(16).padStart(2, '0').toUpperCase() +
            ((byte >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase()).join('');
    },
    replaceSpecialChar: (text: string): string => {
        return text.replace(/[&\/\#,+()$~%.'":@^*?<>{}]/g, "");
    }
}
