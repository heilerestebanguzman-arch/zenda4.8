// Validadores para Bolivia
export const validateBolivianCI = (ci: string): boolean => {
  const cleanCI = ci.replace(/\s/g, '');
  const regex = /^[0-9]{7,8}$/;
  return regex.test(cleanCI);
};

export const validateBolivianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s/g, '');
  // Teléfono boliviano: 8 dígitos, empieza con 7 o 6
  const regex = /^[6-7][0-9]{7}$/;
  return regex.test(cleanPhone);
};

export const formatBolivianPhone = (phone: string): string => {
  const clean = phone.replace(/\s/g, '');
  return `+591 ${clean}`;
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
