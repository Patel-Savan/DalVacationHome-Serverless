export const saveLocalStorage = (key: string, value: string): void => {
    localStorage.setItem(key, value);
}

export const deleteLocalStorage = (key: string): void => {
    localStorage.removeItem(key);
}

export const readLocalStorage = (key: string): string | null => {
    return localStorage.getItem(key);
}
