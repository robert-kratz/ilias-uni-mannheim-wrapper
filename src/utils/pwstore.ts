import keytar from 'keytar';

// Passwort speichern
async function savePassword(email: string, password: string) {
    await keytar.setPassword('myApp', email, password);
}

// Passwort abrufen
async function getPassword(email: string) {
    return await keytar.getPassword('myApp', email);
}

export { savePassword, getPassword };
