const usersList = [
  {
    id: 'u-admin-1',
    email: 'info@aeropeak.tech',
    password: 'AeroPeak@26',
  },
  {
    id: 'u-dev-1',
    email: 'devatharshini@gmail.com',
    password: 'Deva@26',
  }
];

function login(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  let currentRoster = usersList;

  const found = currentRoster.find((u) => u.email.toLowerCase().trim() === normalizedEmail);

  if (found) {
    if (password) {
      if (!found.password) {
        if (found.email === 'info@aeropeak.tech' && password !== 'AeroPeak@26') return false;
        if (found.email === 'devatharshini@gmail.com' && password !== 'Deva@26') return false;
      } else {
        if (found.password !== password) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

console.log("admin login exact:", login('info@aeropeak.tech', 'AeroPeak@26'));
console.log("admin login mobile capital email:", login('Info@aeropeak.tech', 'AeroPeak@26'));
console.log("admin login mobile space:", login('info@aeropeak.tech ', 'AeroPeak@26'));
console.log("admin login lowercase p in password:", login('info@aeropeak.tech', 'Aeropeak@26'));
