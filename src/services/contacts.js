import Contact from '../models/contactModel.js';

export const getAllContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (err) {
    console.error('Error fetching contacts:', err);
    throw new Error('Error fetching contacts');
  }
};

export const getContactByIdService = async (contactId) => {
  try {
    const contact = await Contact.findById(contactId);
    return contact;
  } catch {
    throw new Error('Error fetching contact by id');
  }
};
