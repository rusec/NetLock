function convertISOToHumanReadable(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString();
}

export { convertISOToHumanReadable };
