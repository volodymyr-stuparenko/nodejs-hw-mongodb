import { ContactsCollection } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (body) => {
  const contact = await ContactsCollection.create(body);
  return contact;
};

export const updateContact = async (contactId, body, options = {}) => {
  const rawContactResult = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    body,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawContactResult || !rawContactResult.value) return null;

  return {
    contact: rawContactResult.value,
    isNew: Boolean(rawContactResult?.lastErrorObject?.upserted),
  };
};

export const deleteContact = async (contactId) => {
  const contact = ContactsCollection.findByIdAndDelete({
    _id: contactId,
  });
  return contact;
};
