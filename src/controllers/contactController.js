import {
  getAllContactsService,
  getContactByIdService,
  createContactService,
  patchContactService,
  deleteContactService,
} from '../services/contacts.js';
import createError from 'http-errors';

export const getContacts = async (req, res, next) => {
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

    const filter = { userId: req.user._id };

    if (type) {
      filter.contactType = type;
    }
    if (isFavourite !== undefined) {
      filter.isFavourite = isFavourite === 'true';
    }

    const { contacts, totalItems } = await getAllContactsService({
      page: pageNum,
      perPage: perPageNum,
      sortBy,
      sortOrder,
      filter,
    });

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
    next(err);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await getContactByIdService(contactId, userId);

    if (!contact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully found contact!',
      data: contact,
    });
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const contactData = {
      ...req.body,
      userId: req.user._id,
    };

    const newContact = await createContactService(contactData);

    res.status(201).json({
      status: 201,
      message: 'Contact created successfully!',
      data: newContact,
    });
  } catch (err) {
    next(err);
  }
};

export const patchContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const updatedContact = await patchContactService(
      contactId,
      req.body,
      userId
    );

    if (!updatedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated contact!',
      data: updatedContact,
    });
  } catch (err) {
    next(err);
  }
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

export const deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const deletedContact = await deleteContactService(contactId, userId);

    if (!deletedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
