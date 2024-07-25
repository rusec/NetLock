function removeUUIDFromString(str: string) {
    // UUID regex pattern
    const uuidPattern = /_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g;
    // Replace UUID with empty string
    const result = str.replace(uuidPattern, "");
    return result;
}

export { removeUUIDFromString };
