function convertDateToHumanReadable(value: string | number): string {
    const date = new Date(value);
    return date.toLocaleString();
}

export { convertDateToHumanReadable };
