import {
  getAllContacts,
  getContactByIdService,
  createContactService,
  patchContactService,
  deleteContactService,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      type,
      isFavourite,
    } = req.query;

    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    const filter = {};
    if (type) {
      filter.contactType = type;
    }
    if (isFavourite !== undefined) {
      filter.isFavourite = isFavourite === 'true';
    }

    const { contacts, totalItems } = await getAllContacts(
      pageNum,
      perPageNum,
      sortBy,
      sortOrder,
      filter
    );

    const totalPages = Math.ceil(totalItems / perPageNum);

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts,
        page: pageNum,
        perPage: perPageNum,
        totalItems,
        totalPages,
        hasPreviousPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: 'Error fetching contacts!',
      error: err.message,
    });
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactByIdService(contactId);
    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const newContact = await createContactService(req.body);
    res.status(201).json({
      status: 201,
      message: 'Contact created successfully!',
      data: newContact,
    });
  } catch (err) {
    next(err);
  }
};

export const patchContact = async (req, res) => {
  const { contactId } = req.params;
  const updateData = req.body;

  const updatedContact = await patchContactService(contactId, updateData);

  if (!updatedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const updatedContact = await patchContactService(contactId, req.body);
    if (!updatedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: `Contact with id ${contactId} updated successfully!`,
      data: updatedContact,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;

  const result = await deleteContactService(contactId);

  if (!result) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};
