export const convert = {
    unixToDate: (unixTime): string => {
        const date = new Date(unixTime);

        // 날짜와 시간 형식 변환
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // 최종 출력 형식
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
}

export const validator = {
    isDateString: (stringDate): boolean => {
        return !isNaN(Date.parse(stringDate));
    }
}