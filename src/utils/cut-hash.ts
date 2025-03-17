interface CutHashOptions {
    value: string;
    maxLength?: number;
    cutLength?: number;
}

const cutHash = ({value, maxLength = 20, cutLength = 6}: CutHashOptions): string => {
    if (value.length <= maxLength) {
        return value;
    }
    const start = value.slice(0, cutLength);
    const end = value.slice(-cutLength);
    return `${start}...${end}`;
};

export default cutHash;
