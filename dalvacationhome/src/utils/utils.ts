export const saveLocalStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const deleteLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

export const readLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const getRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
