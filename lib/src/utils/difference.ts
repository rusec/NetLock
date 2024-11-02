export function difference<T>(arr1: T[], arr2: T[]): [T[], T[]] {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const onlyInFirst: T[] = arr1.filter((item) => !set2.has(item));
    const onlyInSecond: T[] = arr2.filter((item) => !set1.has(item));

    return [onlyInFirst, onlyInSecond];
}
