import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
}) => {
  const limit = perPage;
  const skip = (page - 1) * limit;

  const contactsQuery = ContactsCollection.find();
  const contactsCount = await ContactsCollection.find()
    .merge(contactsQuery)
    .countDocuments();

  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    data: contacts,
    ...paginationData,
  };
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
